import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import { getFechaLocalHoy } from '@/lib/dateUtils';

export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export interface ReporteTurnosParams {
  desde?: string;
  hasta?: string;
  centroSaludId?: number | string;
}

export const reportesService = {
  async exportarTurnosExcel(params?: ReporteTurnosParams): Promise<void> {
    try {
      const res = await apiClient.get<Blob>(API_ENDPOINTS.reportes.excelTurnos, {
        params: {
          desde: params?.desde ? `${params.desde}T00:00:00` : undefined,
          hasta: params?.hasta ? `${params.hasta}T23:59:59` : undefined,
          centroSaludId: params?.centroSaludId && params.centroSaludId !== 'TODOS' ? params.centroSaludId : undefined,
        },
        responseType: 'blob',
      });
      triggerFileDownload(res.data, `reporte_turnos_${getFechaLocalHoy()}.xlsx`);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'Error al descargar el reporte oficial en Excel.'), { cause: err });
    }
  },

  async exportarTurnosPdf(params?: ReporteTurnosParams): Promise<void> {
    try {
      const res = await apiClient.get<Blob>(API_ENDPOINTS.reportes.pdfTurnos, {
        params: {
          desde: params?.desde ? `${params.desde}T00:00:00` : undefined,
          hasta: params?.hasta ? `${params.hasta}T23:59:59` : undefined,
          centroSaludId: params?.centroSaludId && params.centroSaludId !== 'TODOS' ? params.centroSaludId : undefined,
        },
        responseType: 'blob',
      });
      triggerFileDownload(res.data, `reporte_turnos_${getFechaLocalHoy()}.pdf`);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'Error al descargar el reporte oficial en PDF.'), { cause: err });
    }
  },

  async exportarTurnosCsv(params?: ReporteTurnosParams): Promise<void> {
    try {
      const res = await apiClient.get<Blob>(API_ENDPOINTS.reportes.csvTurnos, {
        params: {
          desde: params?.desde ? `${params.desde}T00:00:00` : undefined,
          hasta: params?.hasta ? `${params.hasta}T23:59:59` : undefined,
          centroSaludId: params?.centroSaludId && params.centroSaludId !== 'TODOS' ? params.centroSaludId : undefined,
        },
        responseType: 'blob',
      });
      triggerFileDownload(res.data, `reporte_turnos_${getFechaLocalHoy()}.csv`);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'Error al descargar el reporte oficial en CSV.'), { cause: err });
    }
  },

  async exportarPacientesCsv(centroSaludId?: number | string): Promise<void> {
    try {
      const res = await apiClient.get<Blob>(API_ENDPOINTS.reportes.pacientesCsv, {
        params: {
          centroSaludId: centroSaludId && centroSaludId !== 'TODOS' ? centroSaludId : undefined,
        },
        responseType: 'blob',
      });
      triggerFileDownload(res.data, `padron_pacientes_${getFechaLocalHoy()}.csv`);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'Error al descargar el padrón de pacientes en CSV.'), { cause: err });
    }
  },
};
