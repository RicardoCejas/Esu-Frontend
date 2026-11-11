import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { permisosService } from '@/api/permisosService';
import { usuariosService } from '@/api/usuariosService';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/features/admin/components/PermisosMatrixSelector';
import type { PerfilOperativoErrors, PerfilOperativoValues } from '../components/PersonalPerfilOperativoCard';
import {
  EXCLUDED_CENTER_PERMISSIONS,
  isSelfAccount,
  resolveCenterBackendRole,
  sanitizePermissionsForCenterStaff,
  validatePerfilOperativo,
} from '../utils/centroStaffHelpers';
import type { BackendUserRole, Permiso, PermissionCode, User } from '@/types';

function defaultPermsForRole(roleKey: BackendUserRole): PermissionCode[] {
  const key = roleKey === 'PROFESIONAL' ? 'MEDICO' : roleKey;
  return sanitizePermissionsForCenterStaff(
    DEFAULT_PERMISSIONS_BY_ROLE[key] ?? DEFAULT_PERMISSIONS_BY_ROLE[roleKey] ?? []
  );
}

/**
 * Coordinates fetching and updating a center staff member's role and granular PBAC permissions.
 */
export function usePersonalPermisos(usuarioId?: string) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const scopedCentroId = currentUser?.centroSaludId ? String(currentUser.centroSaludId) : '';
  const scopedCentroNombre = currentUser?.centroSaludNombre ?? '';

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [catalogoPermisos, setCatalogoPermisos] = useState<Permiso[]>([]);
  const [catalogoError, setCatalogoError] = useState<string | null>(null);
  const [rol, setRol] = useState<BackendUserRole>('RECEPCIONISTA');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<PermissionCode[]>([]);
  const [perfilValues, setPerfilValues] = useState<PerfilOperativoValues>({
    nombre: '',
    apellido: '',
    dni: '',
  });
  const [perfilErrors, setPerfilErrors] = useState<PerfilOperativoErrors>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSelf = targetUser ? isSelfAccount(targetUser, currentUser) : false;

  const loadData = useCallback(async () => {
    if (!usuarioId) {
      setLoading(false);
      setLoadError('Identificador de usuario inválido.');
      return;
    }

    setLoading(true);
    setLoadError(null);
    setCatalogoError(null);
    try {
      const [userObj, catResult, permsResult] = await Promise.all([
        usuariosService.getById(usuarioId),
        permisosService
          .getCatalogo()
          .then((data) => ({ ok: true as const, data }))
          .catch((err) => ({ ok: false as const, error: extractApiErrorMessage(err, 'No se pudo cargar el catálogo de permisos.') })),
        permisosService.getByUsuario(usuarioId).catch(() => [] as PermissionCode[]),
      ]);

      setTargetUser(userObj);
      setPerfilValues({
        nombre: userObj?.nombre ?? '',
        apellido: userObj?.apellido ?? '',
        dni: userObj?.dni ?? '',
      });
      if (catResult.ok) {
        setCatalogoPermisos(Array.isArray(catResult.data) ? catResult.data : []);
      } else {
        setCatalogoPermisos([]);
        setCatalogoError(catResult.error);
      }
      const userPerms = permsResult;

      const matchedRol = resolveCenterBackendRole(userObj?.rol);
      setRol(matchedRol);

      if (Array.isArray(userPerms) && userPerms.length > 0) {
        setPermisosSeleccionados(sanitizePermissionsForCenterStaff(userPerms));
      } else {
        setPermisosSeleccionados(defaultPermsForRole(matchedRol));
      }
    } catch (err) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar la cuenta del integrante.'));
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRolChange = (nuevoRol: BackendUserRole) => {
    setRol(nuevoRol);
    setPermisosSeleccionados(defaultPermsForRole(nuevoRol));
  };

  const applyRoleDefaults = () => {
    setPermisosSeleccionados(defaultPermsForRole(rol));
  };

  const setPerfilField = <K extends keyof PerfilOperativoValues>(field: K, value: string) => {
    setPerfilValues((prev) => ({ ...prev, [field]: value }));
    setPerfilErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSavePerfilOperativo = async (): Promise<boolean> => {
    if (!targetUser) return false;
    const nextErrs = validatePerfilOperativo(perfilValues);
    if (Object.keys(nextErrs).length > 0) {
      setPerfilErrors(nextErrs);
      return false;
    }
    const dniClean = perfilValues.dni.trim();

    setSavingPerfil(true);
    setSubmitError(null);
    try {
      const updated = await usuariosService.actualizarPerfilOperativo(targetUser.id, {
        nombre: perfilValues.nombre.trim(),
        apellido: perfilValues.apellido.trim(),
        dni: dniClean,
      });
      setTargetUser(updated);
      success(`Datos operativos actualizados para ${updated.email}.`);
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudieron actualizar los datos operativos.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleRevocarSesiones = async (): Promise<boolean> => {
    if (!targetUser || isSelf) return false;
    setRevokingSessions(true);
    setSubmitError(null);
    try {
      await usuariosService.revocarSesiones(targetUser.id);
      success(`Sesiones activas revocadas para ${targetUser.email}.`);
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudieron revocar las sesiones activas.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setRevokingSessions(false);
    }
  };

  const handleSave = async (): Promise<boolean> => {
    if (!targetUser || isSelf) {
      const msg = 'No podés modificar tu propio rol ni tus propios permisos desde esta sesión.';
      setSubmitError(msg);
      toastError(msg);
      return false;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      const effectiveCentroId = scopedCentroId || (targetUser.centroSaludId ? String(targetUser.centroSaludId) : '');
      const centroIdNum = effectiveCentroId ? Number(effectiveCentroId) : null;
      const centroNombre = scopedCentroNombre || targetUser.centroSaludNombre || null;

      if (rol !== resolveCenterBackendRole(targetUser.rol) || effectiveCentroId !== (targetUser.centroSaludId ?? '')) {
        await usuariosService.actualizarAsignacion(targetUser.id, {
          rol,
          centroSaludId: centroIdNum,
          centroSaludNombre: centroNombre,
        });
      }

      const filteredPerms = sanitizePermissionsForCenterStaff(permisosSeleccionados);
      await permisosService.updateUsuarioPermisos(targetUser.id, filteredPerms);
      success(`Rol y permisos actualizados para ${targetUser.email}.`);
      navigate('/dashboard/recepcion/personal');
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudieron guardar los permisos.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    scopedCentroId,
    scopedCentroNombre,
    targetUser,
    isSelf,
    catalogoPermisos,
    catalogoError,
    rol,
    permisosSeleccionados,
    setPermisosSeleccionados,
    perfilValues,
    perfilErrors,
    setPerfilField,
    handleSavePerfilOperativo,
    handleRevocarSesiones,
    excludedPermissions: EXCLUDED_CENTER_PERMISSIONS,
    loading,
    saving,
    savingPerfil,
    revokingSessions,
    loadError,
    submitError,
    loadData,
    handleRolChange,
    applyRoleDefaults,
    handleSave,
  };
}
