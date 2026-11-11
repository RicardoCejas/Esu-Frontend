import type { BackendUserRole, PermissionCode, User } from '../../../types/index.ts';
import { DNI_VALIDATION_ERROR, isValidDniFormat } from '../../../lib/dniValidation.ts';

export const CENTER_STAFF_ALLOWED_ROLES: { value: BackendUserRole; label: string }[] = [
  { value: 'RECEPCIONISTA', label: 'Personal de Recepción' },
  { value: 'PROFESIONAL', label: 'Profesional Médico' },
];

export const EXCLUDED_CENTER_PERMISSIONS: PermissionCode[] = [
  'PACIENTES_FUSIONAR',
  'USUARIOS_ADMINISTRAR',
  'CONSULTORIOS_ADMINISTRAR',
];

/**
 * Normalizes a user role string for institutional comparison.
 */
function normalizeRole(role?: string): string {
  return (role ?? '').trim().toUpperCase().replace(/^ROLE_/, '');
}

/**
 * Filters users belonging exclusively to the active health center and eligible
 * to be managed by center receptionists (excludes ADMIN and PACIENTE accounts).
 */
export function filterEligibleCenterStaff(
  users: User[],
  scopedCentroId?: string | number
): User[] {
  const centroTarget = scopedCentroId != null ? String(scopedCentroId) : '';
  return users.filter((u) => {
    const roleNorm = normalizeRole(u.rol);
    const isStaffRole =
      roleNorm === 'RECEPCIONISTA' || roleNorm === 'PROFESIONAL' || roleNorm === 'MEDICO';
    if (!isStaffRole) return false;
    if (!centroTarget) return false;
    return String(u.centroSaludId ?? '') === centroTarget;
  });
}

/**
 * Applies search, role, and active-status filters over scoped center staff.
 */
export function filterPersonalCentroList(
  staff: User[],
  filters: {
    busqueda: string;
    filtroRol: 'TODOS' | 'RECEPCIONISTA' | 'MEDICO';
    filtroEstado: 'TODOS' | 'ACTIVO' | 'INACTIVO';
  }
): User[] {
  const term = filters.busqueda.trim().toLowerCase();
  return staff.filter((u) => {
    const matchSearch =
      !term ||
      (u.nombre ?? '').toLowerCase().includes(term) ||
      (u.apellido ?? '').toLowerCase().includes(term) ||
      (u.email ?? '').toLowerCase().includes(term) ||
      (u.dni ?? '').toLowerCase().includes(term);

    const roleNorm = normalizeRole(u.rol);
    const matchRole =
      filters.filtroRol === 'TODOS' ||
      (filters.filtroRol === 'RECEPCIONISTA' && roleNorm === 'RECEPCIONISTA') ||
      (filters.filtroRol === 'MEDICO' && (roleNorm === 'MEDICO' || roleNorm === 'PROFESIONAL'));

    const isActive = u.activo !== false;
    const matchStatus =
      filters.filtroEstado === 'TODOS' ||
      (filters.filtroEstado === 'ACTIVO' && isActive) ||
      (filters.filtroEstado === 'INACTIVO' && !isActive);

    return matchSearch && matchRole && matchStatus;
  });
}

/**
 * Returns true if the target user matches the currently authenticated account.
 */
export function isSelfAccount(target: User, currentUser: User | null): boolean {
  if (!currentUser) return false;
  const targetId = String(target.usuarioId ?? target.id ?? '');
  const selfId = String(currentUser.usuarioId ?? currentUser.id ?? '');
  if (targetId && selfId && targetId === selfId) return true;
  if (target.email && currentUser.email) {
    return target.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
  }
  return false;
}

/**
 * Strips restricted network-level permissions when a center receptionist assigns rights.
 */
export function sanitizePermissionsForCenterStaff(
  permisos: PermissionCode[]
): PermissionCode[] {
  const excluded = new Set<PermissionCode>(EXCLUDED_CENTER_PERMISSIONS);
  return permisos.filter((p) => !excluded.has(p));
}

/**
 * Maps any backend or frontend role representation to the two allowed center staff roles.
 */
export function resolveCenterBackendRole(rawRole?: string): BackendUserRole {
  const r = normalizeRole(rawRole || 'RECEPCIONISTA');
  return r === 'MEDICO' || r === 'PROFESIONAL' ? 'PROFESIONAL' : 'RECEPCIONISTA';
}

/**
 * Validates editable operational staff identity fields before PUT /perfil-operativo.
 */
export function validatePerfilOperativo(values: {
  nombre: string;
  apellido: string;
  dni: string;
}): { nombre?: string; apellido?: string; dni?: string } {
  const errs: { nombre?: string; apellido?: string; dni?: string } = {};
  if (values.nombre.trim().length < 2) errs.nombre = 'Ingresá un nombre válido.';
  if (values.apellido.trim().length < 2) errs.apellido = 'Ingresá un apellido válido.';
  const dniClean = values.dni.trim();
  if (dniClean && !isValidDniFormat(dniClean)) errs.dni = DNI_VALIDATION_ERROR;
  return errs;
}
