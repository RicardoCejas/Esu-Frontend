import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { permisosService } from '@/api/permisosService';
import { usuariosService } from '@/api/usuariosService';
import { toBackendRole } from '@/lib/roles';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/features/admin/components/PermisosMatrixSelector';
import {
  EXCLUDED_CENTER_PERMISSIONS,
  sanitizePermissionsForCenterStaff,
} from '../utils/centroStaffHelpers';
import type { BackendUserRole, Permiso, PermissionCode, User } from '@/types';

function resolveCenterBackendRole(rawRole?: string): BackendUserRole {
  const r = String(rawRole ?? 'RECEPCIONISTA').toUpperCase();
  if (r === 'MEDICO' || r === 'PROFESIONAL' || r === 'ROLE_MEDICO' || r === 'ROLE_PROFESIONAL') {
    return 'PROFESIONAL';
  }
  return 'RECEPCIONISTA';
}

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
  const [rol, setRol] = useState<BackendUserRole>('RECEPCIONISTA');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<PermissionCode[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!usuarioId) {
      setLoading(false);
      setLoadError('Identificador de usuario inválido.');
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [userObj, catalogo, userPerms] = await Promise.all([
        usuariosService.getById(usuarioId),
        permisosService.getCatalogo().catch(() => [] as Permiso[]),
        permisosService.getByUsuario(usuarioId).catch(() => [] as PermissionCode[]),
      ]);

      setTargetUser(userObj);
      setCatalogoPermisos(Array.isArray(catalogo) ? catalogo : []);

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

  const handleSave = async (): Promise<boolean> => {
    if (!targetUser) return false;
    setSaving(true);
    setSubmitError(null);
    try {
      const effectiveCentroId = scopedCentroId || (targetUser.centroSaludId ? String(targetUser.centroSaludId) : '');
      const centroIdNum = effectiveCentroId ? Number(effectiveCentroId) : null;
      const centroNombre = scopedCentroNombre || targetUser.centroSaludNombre || null;

      if (rol !== toBackendRole(targetUser.rol) || effectiveCentroId !== (targetUser.centroSaludId ?? '')) {
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
    catalogoPermisos,
    rol,
    permisosSeleccionados,
    setPermisosSeleccionados,
    excludedPermissions: EXCLUDED_CENTER_PERMISSIONS,
    loading,
    saving,
    loadError,
    submitError,
    loadData,
    handleRolChange,
    applyRoleDefaults,
    handleSave,
  };
}
