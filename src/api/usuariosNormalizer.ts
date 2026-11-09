import type { User, UserRole, BackendUserRole } from '../types/index.ts';
import { toFrontendRole, toBackendRole } from '../lib/roles.ts';

export interface CreateUserRequest {
  username: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  rol: UserRole | BackendUserRole;
  dni?: string;
  centroSaludId?: string | number;
}

export function toNumericId(raw: string | number | undefined, fieldName = 'usuarioId'): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  const digits = String(raw ?? '').replace(/\D/g, '');
  const parsed = Number(digits);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  throw new Error(`El identificador '${fieldName}' es obligatorio y debe ser un número válido.`);
}

export function validateAndBuildCreateUserPayload(data: CreateUserRequest): {
  username: string;
  password: string;
  rol: BackendUserRole;
  nombre?: string;
  apellido?: string;
  dni?: string;
} {
  const username = data.username?.trim().toLowerCase();
  if (!username) {
    throw new Error('El nombre de usuario o email es obligatorio.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    throw new Error('El nombre de usuario debe ser un correo electrónico válido.');
  }

  const password = data.password ? data.password.trim() : 'Esu2026!';
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const backendRol = toBackendRole(data.rol);
  if (!['ADMIN', 'PROFESIONAL', 'RECEPCIONISTA', 'PACIENTE'].includes(backendRol)) {
    throw new Error(`El rol '${String(data.rol)}' no es válido en el sistema.`);
  }

  return {
    username,
    password,
    rol: backendRol,
    nombre: data.nombre?.trim() || undefined,
    apellido: data.apellido?.trim() || undefined,
    dni: data.dni?.trim() || undefined,
  };
}

export function normalizeUsuario(d: Record<string, unknown>): User {
  const email = String(d.email ?? d.username ?? '').trim().toLowerCase();
  const rawRol = String(d.rol ?? 'RECEPCIONISTA');
  const rol = toFrontendRole(rawRol);

  let nombre = typeof d.nombre === 'string' ? d.nombre.trim() : '';
  let apellido = typeof d.apellido === 'string' ? d.apellido.trim() : '';
  if (!nombre && email) {
    const parts = email.split('@')[0].split('.');
    nombre = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Usuario';
    apellido = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '';
  }

  const idStr = String(d.id ?? '');

  return {
    id: idStr,
    usuarioId: idStr,
    email,
    nombre: nombre || 'Usuario',
    apellido: apellido || '',
    dni: typeof d.dni === 'string' ? d.dni : '',
    rol,
    activo: d.activo !== false,
    centroSaludId: d.centroSaludId != null ? String(d.centroSaludId) : undefined,
    centroSaludNombre: typeof d.centroSaludNombre === 'string' ? d.centroSaludNombre : undefined,
  };
}
