import { apiClient } from './apiClient';

export interface DemandaDiaDto {
  diaSemana: string;
  label: string;
  atendidos: number;
  ausentes: number;
  cancelados: number;
  total: number;
}

export interface EspecialidadDemandaDto {
  especialidad: string;
  totalTurnos: number;
  porcentaje: number;
  color?: string;
}

export interface TendenciaMensualDto {
  mes: string;
  label: string;
  totalTurnos: number;
  atendidos: number;
  ausentes: number;
  tasaAsistencia: number;
  tasaAusentismo: number;
}

export interface DashboardMetricas {
  fechaDesde: string;
  fechaHasta: string;
  centroId?: number | string | null;
  centroNombre?: string;
  especialidad?: string | null;
  fechaActualizacion: string;
  respuestaIncompleta: boolean;
  periodoDescripcion: string;

  totalTurnos: number;
  turnosAtendidos: number;
  turnosAusentes: number;
  turnosCancelados: number;
  turnosPendientes: number;
  turnosHoy: number;
  atendidosHoy: number;
  ausentesHoy: number;

  tasaAsistencia: number;
  tasaAusentismo: number;
  tasaCancelacion: number;
  tiempoPromedioConsultaMinutos: number;

  especialidadMasDemandada: string;
  totalEspecialidadMasDemandada: number;

  demandaSemanal: DemandaDiaDto[];
  distribucionEspecialidades: EspecialidadDemandaDto[];
  evolucionMensual: TendenciaMensualDto[];
  desglosePorEstado: Record<string, number>;
}

export interface LogAccesoHcDto {
  id: number;
  usuarioId: number;
  usuarioEmail: string;
  rolUsuario: string;
  pacienteIdentificador: string;
  accion: string;
  motivo: string;
  ipAddress: string;
  fechaHora: string;
  centroCustodia: string;
}

export const metricasService = {
  async getDashboardMetricas(params?: {
    desde?: string;
    hasta?: string;
    centroId?: number | string;
    especialidad?: string;
  }): Promise<DashboardMetricas> {
    const res = await apiClient.get<DashboardMetricas>('/metricas/dashboard', {
      params: {
        desde: params?.desde || undefined,
        hasta: params?.hasta || undefined,
        centroId: params?.centroId && params.centroId !== 'TODOS' ? params.centroId : undefined,
        especialidad: params?.especialidad && params.especialidad !== 'TODOS' ? params.especialidad : undefined,
      },
    });
    return res.data;
  },

  async getAuditoriaAccesosClinicos(page = 0, size = 20): Promise<{ content: LogAccesoHcDto[]; totalElements: number }> {
    const res = await apiClient.get('/seguridad/auditoria/accesos-clinicos', {
      params: { page, size },
    });
    return res.data;
  },
};
