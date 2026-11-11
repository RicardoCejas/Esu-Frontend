import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { permisosService } from '@/api/permisosService';
import { usuariosService } from '@/api/usuariosService';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/features/admin/components/PermisosMatrixSelector';
import { DNI_VALIDATION_ERROR, isValidDniFormat } from '@/lib/dniValidation';
import {
  EXCLUDED_CENTER_PERMISSIONS,
  sanitizePermissionsForCenterStaff,
} from '../utils/centroStaffHelpers';
import type { BackendUserRole, Permiso, PermissionCode } from '@/types';

export interface NuevoPersonalFormValues {
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  rol: 'RECEPCIONISTA' | 'PROFESIONAL';
  password: string;
  confirmPassword: string;
}

export type NuevoPersonalErrors = Partial<Record<keyof NuevoPersonalFormValues, string>>;

function getDefaultRolePermissions(rol: BackendUserRole): PermissionCode[] {
  const key = rol === 'PROFESIONAL' ? 'MEDICO' : rol;
  return sanitizePermissionsForCenterStaff(
    DEFAULT_PERMISSIONS_BY_ROLE[key] ?? DEFAULT_PERMISSIONS_BY_ROLE[rol] ?? []
  );
}

/**
 * Coordinates center-scoped staff account creation including granular PBAC permission defaults.
 */
export function useNuevoPersonalCentro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const centroId = user?.centroSaludId ? String(user.centroSaludId) : '';
  const centroNombre = user?.centroSaludNombre ?? '';

  const [catalogoPermisos, setCatalogoPermisos] = useState<Permiso[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [catalogoError, setCatalogoError] = useState<string | null>(null);
  const [values, setValues] = useState<NuevoPersonalFormValues>({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    rol: 'RECEPCIONISTA',
    password: '',
    confirmPassword: '',
  });
  const [permisos, setPermisos] = useState<PermissionCode[]>(() =>
    getDefaultRolePermissions('RECEPCIONISTA')
  );
  const [errors, setErrors] = useState<NuevoPersonalErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCatalogo = useCallback(async () => {
    setLoadingCatalogo(true);
    setCatalogoError(null);
    try {
      const cat = await permisosService.getCatalogo();
      setCatalogoPermisos(Array.isArray(cat) ? cat : []);
    } catch (err) {
      setCatalogoPermisos([]);
      setCatalogoError(
        extractApiErrorMessage(err, 'No se pudo cargar el catálogo de permisos desde el servidor.')
      );
    } finally {
      setLoadingCatalogo(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalogo();
  }, [loadCatalogo]);

  const setField = <K extends keyof NuevoPersonalFormValues>(
    field: K,
    value: NuevoPersonalFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (field === 'rol') {
      setPermisos(getDefaultRolePermissions(value as BackendUserRole));
    }
    if (submitError) setSubmitError(null);
  };

  const validate = (): NuevoPersonalErrors => {
    const next: NuevoPersonalErrors = {};
    if (values.nombre.trim().length < 2) next.nombre = 'Ingresá el nombre del integrante.';
    if (values.apellido.trim().length < 2) next.apellido = 'Ingresá el apellido del integrante.';
    const emailClean = values.email.trim();
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      next.email = 'Ingresá un correo electrónico institucional válido.';
    }
    const dniClean = values.dni.trim();
    if (dniClean && !isValidDniFormat(dniClean)) {
      next.dni = DNI_VALIDATION_ERROR;
    }
    if (values.password.length < 6) {
      next.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (values.confirmPassword !== values.password) {
      next.confirmPassword = 'Las contraseñas no coinciden.';
    }
    return next;
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!centroId) {
      setSubmitError('Tu usuario no tiene una sede asignada.');
      return false;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const creado = await usuariosService.crearUsuario({
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        username: values.email.trim().toLowerCase(),
        password: values.password,
        dni: values.dni.trim() || undefined,
        rol: values.rol,
        centroSaludId: centroId,
        permisos: sanitizePermissionsForCenterStaff(permisos),
      });
      success(`Cuenta creada para ${creado.email} en ${centroNombre || 'la sede'}.`);
      navigate('/dashboard/recepcion/personal');
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo crear la cuenta del personal.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    centroId,
    centroNombre,
    catalogoPermisos,
    loadingCatalogo,
    catalogoError,
    loadCatalogo,
    values,
    permisos,
    setPermisos,
    errors,
    submitError,
    saving,
    excludedPermissions: EXCLUDED_CENTER_PERMISSIONS,
    setField,
    resetRoleDefaults: () => setPermisos(getDefaultRolePermissions(values.rol)),
    handleSubmit,
  };
}
