import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export type TipoNotificacion =
  | 'TURNO_PROXIMO'
  | 'CANCELACION'
  | 'RECETA_EMITIDA'
  | 'SISTEMA'
  | 'CHECK_IN';

export interface NotificacionItem {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fechaHora: string; // ISO string
  leida: boolean;
  enlace?: string;
  usuarioId?: string;
}

interface RawNotificacionDto {
  id?: string | number;
  tipo?: string;
  titulo?: string;
  mensaje?: string;
  fechaHora?: string;
  fechaCreacion?: string;
  leida?: boolean;
  enlace?: string;
  linkAccion?: string;
}

function normalizeTipo(tipo?: string): TipoNotificacion {
  const upper = (tipo || 'SISTEMA').toUpperCase();
  if (
    upper === 'TURNO_PROXIMO' ||
    upper === 'CANCELACION' ||
    upper === 'RECETA_EMITIDA' ||
    upper === 'SISTEMA' ||
    upper === 'CHECK_IN'
  ) {
    return upper;
  }
  if (upper.includes('TURNO') || upper.includes('RECORDATORIO')) return 'TURNO_PROXIMO';
  if (upper.includes('CANCEL')) return 'CANCELACION';
  if (upper.includes('RECETA')) return 'RECETA_EMITIDA';
  return 'SISTEMA';
}

function normalizeNotificacion(raw: RawNotificacionDto): NotificacionItem {
  return {
    id: String(raw.id ?? ''),
    tipo: normalizeTipo(raw.tipo),
    titulo: raw.titulo || 'Notificación del sistema',
    mensaje: raw.mensaje || '',
    fechaHora: raw.fechaHora || raw.fechaCreacion || new Date().toISOString(),
    leida: Boolean(raw.leida),
    enlace: raw.enlace || raw.linkAccion || undefined,
  };
}

export const notificacionesService = {
  async getAll(soloNoLeidas?: boolean): Promise<NotificacionItem[]> {
    const res = await apiClient.get<RawNotificacionDto[]>(API_ENDPOINTS.notificaciones.base, {
      params: soloNoLeidas !== undefined ? { soloNoLeidas } : undefined,
    });
    const list = Array.isArray(res.data) ? res.data.map(normalizeNotificacion) : [];
    return list.sort(
      (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
    );
  },

  async contarNoLeidas(): Promise<number> {
    const res = await apiClient.get<{ noLeidas?: number }>(
      API_ENDPOINTS.notificaciones.noLeidasContar
    );
    return Number(res.data?.noLeidas ?? 0);
  },

  async marcarComoLeida(id: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.notificaciones.marcarLeida(id));
  },

  async marcarTodasComoLeidas(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.notificaciones.marcarTodasLeidas);
  },

  async eliminar(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.notificaciones.byId(id));
  },
};
