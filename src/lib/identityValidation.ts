import type { User } from '@/types';

/**
 * Verifica si el paciente autenticado cuenta con un DNI válido y verificado con número de trámite.
 * Evita la usurpación de identidad y el acceso no autorizado a información clínica confidencial.
 */
export const esPacienteDniVerificado = (user: User | null): boolean => {
  if (!user) return false;
  // Solo los usuarios con rol de PACIENTE requieren validación de identidad para su historial clínico
  if (user.rol !== 'PACIENTE') return true;

  if (!user.dni) return false;
  const dniClean = user.dni.trim();

  // Descartar identificadores temporales o placeholders
  if (
    dniClean.startsWith('DNI-') ||
    dniClean.startsWith('G-') ||
    dniClean.startsWith('PENDIENTE')
  ) {
    return false;
  }

  // Comprobar formato numérico estándar de DNI argentino
  if (!/^\d{7,8}$/.test(dniClean)) {
    return false;
  }

  // Validar si completó la verificación con trámite
  if (user.dniVerificado) return true;
  if (typeof window !== 'undefined' && localStorage.getItem(`esu_dni_verified_${user.id}`) === 'true') {
    return true;
  }

  return false;
};

/**
 * Rutas médicas protegidas que exigen validación de identidad obligatoria para pacientes.
 */
export const RUTAS_PROTEGIDAS_DNI = [
  '/dashboard/paciente/historial',
  '/dashboard/paciente/estudios',
  '/dashboard/perfil',
];

export const esRutaProtegidaDni = (pathname: string): boolean => {
  return RUTAS_PROTEGIDAS_DNI.some((ruta) => pathname.startsWith(ruta));
};
