export type NivelAlertaEspera = 'optimo' | 'moderado' | 'critico';

export interface SemaforoInfo {
  nivel: NivelAlertaEspera;
  label: string;
  badgeClass: string;
  esCritico: boolean;
}

export function parseHoraToMinutes(horaStr?: string): number | null {
  if (!horaStr || typeof horaStr !== 'string') return null;
  const clean = horaStr.includes('T') ? (horaStr.split('T')[1] ?? '') : horaStr;
  const parts = clean.split(':');
  if (parts.length < 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  return h * 60 + m;
}

export function calcularMinutosEspera(
  horaCheckIn?: string,
  horaTurno?: string,
  now: Date = new Date()
): number {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const checkInMinutes = parseHoraToMinutes(horaCheckIn) ?? parseHoraToMinutes(horaTurno);

  if (checkInMinutes === null) return 0;
  const diff = currentMinutes - checkInMinutes;
  return diff > 0 ? diff : 0;
}

export function obtenerSemaforoEspera(minutos: number): SemaforoInfo {
  if (minutos >= 30) {
    return {
      nivel: 'critico',
      label: 'Demora Crítica',
      badgeClass:
        'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
      esCritico: true,
    };
  }
  if (minutos >= 15) {
    return {
      nivel: 'moderado',
      label: 'Demora Moderada',
      badgeClass:
        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
      esCritico: false,
    };
  }
  return {
    nivel: 'optimo',
    label: 'Espera Normal',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
    esCritico: false,
  };
}

export function formatearTiempoEspera(minutos: number): string {
  if (minutos <= 0) return '< 1 min';
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
