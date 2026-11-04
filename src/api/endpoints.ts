/**
 * Definición centralizada de rutas de API y normalización de errores HTTP (Fase 2 - Ítems 22 y 24).
 * Todas las rutas son relativas al `baseURL` configurado en `apiClient` (`/api`).
 */

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/registro',
    refresh: '/auth/refresh',
    google: '/auth/google',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    cambiarPassword: '/auth/cambiar-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/verify-email/resend',
    devSwitchRole: '/auth/dev-switch-role',
    me: '/auth/me',
    validarToken: '/auth/validar-token',
    sesiones: '/auth/sesiones',
    sesionById: (id: string | number) => `/auth/sesiones/${id}`,
  },
  centrosSalud: {
    base: '/centros-salud',
    byId: (id: string | number) => `/centros-salud/${id}`,
    consultorios: '/centros-salud/consultorios',
    consultorioById: (id: string | number) => `/centros-salud/consultorios/${id}`,
  },
  especialidades: {
    base: '/especialidades',
    byId: (id: string | number) => `/especialidades/${id}`,
  },
  profesionales: {
    base: '/profesionales',
    byId: (id: string | number) => `/profesionales/${id}`,
    byEspecialidad: (especialidadId: string | number) => `/profesionales/especialidad/${especialidadId}`,
    byCentro: (centroId: string | number) => `/profesionales/centro/${centroId}`,
    vincularCentro: (profesionalId: string | number, centroId: string | number) =>
      `/profesionales/${profesionalId}/centros/${centroId}`,
  },
  disponibilidades: {
    base: '/disponibilidades',
    byProfesional: (profesionalId: string | number) => `/disponibilidades/profesional/${profesionalId}`,
    byId: (id: string | number) => `/disponibilidades/${id}`,
  },
  bloqueosAgenda: {
    base: '/bloqueos-agenda',
    byProfesional: (profesionalId: string | number) => `/bloqueos-agenda/profesional/${profesionalId}`,
    byId: (id: string | number) => `/bloqueos-agenda/${id}`,
  },
  pacientes: {
    base: '/pacientes',
    byId: (id: string | number) => `/pacientes/${id}`,
    byDni: (dni: string) => `/pacientes/dni/${encodeURIComponent(dni.trim())}`,
    contacto: (id: string | number) => `/pacientes/${id}/contacto`,
    fusionar: '/pacientes/fusionar',
    resumenClinico: (id: string | number) => `/pacientes/${id}/resumen-clinico`,
    alergias: (id: string | number) => `/pacientes/${id}/alergias`,
    alergiaById: (alergiaId: string | number) => `/pacientes/alergias/${alergiaId}`,
  },
  historiasClinicas: {
    crearConsulta: '/historias-clinicas/consultas',
    byPaciente: (pacienteId: string | number) => `/historias-clinicas/paciente/${pacienteId}`,
    timelinePaciente: (pacienteId: string | number) => `/historias-clinicas/paciente/${pacienteId}/timeline`,
    timelineParametrizado: (pacienteId: string | number) => `/historias-clinicas/${pacienteId}/timeline`,
    evoluciones: '/historias-clinicas/evoluciones',
    adendaEvolucion: (evolucionId: string | number) => `/historias-clinicas/evoluciones/${evolucionId}/adenda`,
    pdfEvolucion: (evolucionId: string | number) => `/historias-clinicas/evoluciones/${evolucionId}/pdf`,
    borrador: '/historias-clinicas/consultas/borrador',
    emergencia: (pacienteId: string | number) => `/historias-clinicas/emergencia/${pacienteId}`,
  },
  turnos: {
    base: '/turnos',
    crear: '/turnos/crear',
    disponibles: '/turnos/disponibles',
    sobreturno: '/turnos/sobreturno',
    reservarPublico: '/turnos/publico/reservar',
    mostrador: '/turnos/mostrador',
    miAgenda: '/turnos/mi-agenda',
    byId: (id: string | number) => `/turnos/obtener/${id}`,
    byPaciente: (pacienteId: string | number) => `/turnos/paciente/${pacienteId}`,
    byProfesional: (profesionalId: string | number) => `/turnos/profesional/${profesionalId}`,
    confirmar: (id: string | number) => `/turnos/${id}/confirmar`,
    cancelar: (id: string | number) => `/turnos/${id}/cancelar`,
    cancelarMostrador: (id: string | number) => `/turnos/${id}/cancelar-mostrador`,
    reprogramar: (id: string | number) => `/turnos/${id}/reprogramar`,
    checkIn: (id: string | number) => `/turnos/${id}/check-in`,
    llamar: (id: string | number) => `/turnos/${id}/llamar`,
    estado: (id: string | number) => `/turnos/${id}/estado`,
    copago: (id: string | number) => `/turnos/${id}/copago`,
    atender: (id: string | number) => `/turnos/${id}/atender`,
    ausente: (id: string | number) => `/turnos/${id}/ausente`,
    finalizarAtencion: (id: string | number) => `/turnos/${id}/finalizar-atencion`,
    certificadoAsistencia: (id: string | number) => `/turnos/${id}/certificado-asistencia`,
  },
  recetas: {
    base: '/recetas',
    misRecetas: '/recetas/mis-recetas',
    byPaciente: (pacienteId: string | number) => `/recetas/paciente/${pacienteId}`,
    validarPrescripcion: '/recetas/validar',
    validarPorCodigo: (codigo: string) => `/recetas/validar/${encodeURIComponent(codigo.trim())}`,
    dispensar: '/recetas/dispensar',
    pdf: (id: string | number) => `/recetas/${id}/pdf`,
    verificarPublico: (hash: string) => `/public/verificar/${encodeURIComponent(hash.trim())}`,
  },
  estudios: {
    subir: '/estudios/subir',
    byPaciente: (pacienteId: string | number) => `/estudios/paciente/${pacienteId}`,
    descargar: (id: string | number) => `/estudios/${id}/descargar`,
    byId: (id: string | number) => `/estudios/${id}`,
  },
  consentimientos: {
    firmar: '/consentimientos/firmar',
    byPaciente: (pacienteId: string | number) => `/consentimientos/paciente/${pacienteId}`,
  },
  plantillasEvolucion: {
    base: '/plantillas-evolucion',
  },
  cie10: {
    buscar: '/cie10/buscar',
  },
  notificaciones: {
    base: '/notificaciones',
    noLeidasContar: '/notificaciones/no-leidas/contar',
    marcarLeida: (id: string | number) => `/notificaciones/${id}/leer`,
    marcarTodasLeidas: '/notificaciones/leer-todas',
    byId: (id: string | number) => `/notificaciones/${id}`,
    eliminarLeidas: '/notificaciones/leidas',
  },
  reportes: {
    resumenTurnos: '/reportes/turnos/resumen',
    csvTurnos: '/reportes/turnos/csv',
    pdfTurnos: '/reportes/turnos/pdf',
  },
  metricasSanitarias: {
    dashboard: '/metricas/dashboard',
    auditoriaAccesosClinicos: '/seguridad/auditoria/accesos-clinicos',
  },
  usuarios: {
    base: '/usuarios',
    crear: '/usuarios/crear',
    todos: '/usuarios/obtener/todos',
    preferencias: '/usuarios/preferencias',
    cambiarEstado: (id: string | number) => `/usuarios/${id}/estado`,
    revocarMisSesiones: '/usuarios/me/revocar-sesiones',
    revocarSesionesUsuario: (id: string | number) => `/usuarios/${id}/revocar-sesiones`,
  },
} as const;

export function isDemoModeEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
}

export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage = 'Error de comunicación con el servidor.'
): string {
  if (!error) return fallbackMessage;

  if (typeof error === 'object' && error !== null) {
    const maybeAxios = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
          mensaje?: string;
          error?: string;
          title?: string;
        };
      };
      message?: string;
    };

    const data = maybeAxios.response?.data;
    if (data) {
      if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim();
      if (typeof data.mensaje === 'string' && data.mensaje.trim()) return data.mensaje.trim();
      if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
      if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    }

    if (typeof maybeAxios.message === 'string' && maybeAxios.message.trim()) {
      if (maybeAxios.message.toLowerCase().includes('timeout')) {
        return 'El servidor está tardando en responder. Por favor reintente en unos instantes.';
      }
      return maybeAxios.message.trim();
    }
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }

  return fallbackMessage;
}
