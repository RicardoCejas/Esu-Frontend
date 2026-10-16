import type { UserRole } from '@/types';

export const USER_ROLES: UserRole[] = ['PACIENTE', 'MEDICO', 'RECEPCIONISTA', 'ADMIN'];

export const ROLE_HOME: Record<UserRole, string> = {
  PACIENTE: '/dashboard/paciente',
  MEDICO: '/dashboard/medico',
  RECEPCIONISTA: '/dashboard/recepcion',
  ADMIN: '/dashboard/admin',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  PACIENTE: 'Paciente',
  MEDICO: 'Médico',
  RECEPCIONISTA: 'Recepción',
  ADMIN: 'Administrador',
};
