export type TipoNotificacion = 'TURNO_PROXIMO' | 'CANCELACION' | 'RECETA_EMITIDA' | 'SISTEMA' | 'CHECK_IN';

export interface NotificacionItem {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fechaHora: string; // ISO string
  leida: boolean;
  enlace?: string; // Redirección interna (ej: '/dashboard/paciente', '/dashboard/paciente/historial')
  usuarioId?: string; // Para filtrar o global
}

const STORAGE_KEY_NOTIFS = 'esu_notificaciones_list';

const MOCK_NOTIFICACIONES_INICIALES: NotificacionItem[] = [
  {
    id: 'notif-1',
    tipo: 'TURNO_PROXIMO',
    titulo: 'Recordatorio de turno próximo',
    mensaje: 'Tenés una consulta con el Dr. Carlos Bustos en 24 horas en Hospital Provincial Aurelio Crespo.',
    fechaHora: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Hace 30 min (Hoy)
    leida: false,
    enlace: '/dashboard/paciente',
  },
  {
    id: 'notif-2',
    tipo: 'RECETA_EMITIDA',
    titulo: 'Nueva receta digital emitida',
    mensaje: 'La Dra. Romina Soria generó tu receta con código QR y firma digitalizada.',
    fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // Hace 3 hs (Hoy)
    leida: false,
    enlace: '/dashboard/paciente/historial',
  },
  {
    id: 'notif-3',
    tipo: 'CANCELACION',
    titulo: 'Aviso de turno cancelado',
    mensaje: 'El turno del paciente Roberto Gómez con el Dr. Fernando López fue cancelado en mostrador.',
    fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Ayer
    leida: true,
    enlace: '/dashboard/recepcion/turnos',
  },
  {
    id: 'notif-4',
    tipo: 'TURNO_PROXIMO',
    titulo: 'Acreditación confirmada en sala',
    mensaje: 'Paciente Lucas Ramírez acreditado como EN_SALA_DE_ESPERA en Consultorio 102.',
    fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Hace 2 días (Esta semana)
    leida: true,
    enlace: '/dashboard/recepcion',
  },
  {
    id: 'notif-5',
    tipo: 'SISTEMA',
    titulo: 'Actualización del Padrón Unificado',
    mensaje: 'Se incorporaron los centros de salud de Cruz del Eje a la red unificada ESU.',
    fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // Hace 4 días (Esta semana)
    leida: true,
    enlace: '/dashboard/admin/sedes',
  },
];

const getStoredNotificaciones = (): NotificacionItem[] => {
  if (typeof window === 'undefined') return MOCK_NOTIFICACIONES_INICIALES;
  const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return MOCK_NOTIFICACIONES_INICIALES;
};

let notificacionesState: NotificacionItem[] = getStoredNotificaciones();

const saveState = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notificacionesState));
  }
};

export const notificacionesService = {
  async getAll(): Promise<NotificacionItem[]> {
    return [...notificacionesState].sort(
      (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
    );
  },

  async marcarComoLeida(id: string): Promise<NotificacionItem | null> {
    const idx = notificacionesState.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notificacionesState[idx] = { ...notificacionesState[idx], leida: true };
      saveState();
      return notificacionesState[idx];
    }
    return null;
  },

  async marcarTodasComoLeidas(): Promise<void> {
    notificacionesState = notificacionesState.map((n) => ({ ...n, leida: true }));
    saveState();
  },

  async agregarNotificacion(
    notif: Omit<NotificacionItem, 'id' | 'fechaHora' | 'leida'>
  ): Promise<NotificacionItem> {
    const nueva: NotificacionItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fechaHora: new Date().toISOString(),
      leida: false,
    };
    notificacionesState = [nueva, ...notificacionesState];
    saveState();
    return nueva;
  },
};
