import type { BackendUserRole, UserRole } from '@/types';

export const USER_ROLES: UserRole[] = ['PACIENTE', 'MEDICO', 'PROFESIONAL', 'RECEPCIONISTA', 'ADMIN'];

export const ROLE_HOME: Record<UserRole, string> = {
  PACIENTE: '/dashboard/paciente',
  MEDICO: '/dashboard/medico',
  PROFESIONAL: '/dashboard/medico',
  RECEPCIONISTA: '/dashboard/recepcion',
  ADMIN: '/dashboard/admin',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  PACIENTE: 'Paciente',
  MEDICO: 'Médico',
  PROFESIONAL: 'Profesional Médico',
  RECEPCIONISTA: 'Recepción',
  ADMIN: 'Administrador',
};

/**
 * Adaptador bidireccional SSOT entre los roles de la interfaz (MEDICO)
 * y los roles de seguridad y dominio del backend Spring Boot (PROFESIONAL).
 */
export function toFrontendRole(rawRole?: string): UserRole {
  const upper = (rawRole || 'PACIENTE').toUpperCase();
  if (upper === 'MEDICO' || upper === 'PROFESIONAL') return 'MEDICO';
  if (upper === 'RECEPCIONISTA') return 'RECEPCIONISTA';
  if (upper === 'ADMIN') return 'ADMIN';
  return 'PACIENTE';
}

export function toBackendRole(role?: UserRole | string): BackendUserRole {
  const upper = (role || 'PACIENTE').toUpperCase();
  if (upper === 'MEDICO' || upper === 'PROFESIONAL') return 'PROFESIONAL';
  if (upper === 'RECEPCIONISTA') return 'RECEPCIONISTA';
  if (upper === 'ADMIN') return 'ADMIN';
  return 'PACIENTE';
}
