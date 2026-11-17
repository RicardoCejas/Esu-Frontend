import type { DashboardMetricas } from '@/api/metricasService';
import { exportarAcsv } from '@/lib/exportCsv';
import { getFechaLocalHoy } from '@/lib/dateUtils';

export function exportarMetricasCsvCompleto(metricas: DashboardMetricas): void {
  const headers = ['Categoría / Métrica', 'Detalle / Día / Estado', 'Valor 1', 'Valor 2', 'Valor 3', 'Tasa / %'];
  const rows: (string | number)[][] = [
    ['RESUMEN', 'Total Turnos', metricas.totalTurnos, '-', '-', '-'],
    ['RESUMEN', 'Turnos Atendidos', metricas.turnosAtendidos, '-', '-', `${metricas.tasaAsistencia}%`],
    ['RESUMEN', 'Turnos Ausentes', metricas.turnosAusentes, '-', '-', `${metricas.tasaAusentismo}%`],
    ['RESUMEN', 'Turnos Cancelados', metricas.turnosCancelados, '-', '-', `${metricas.tasaCancelacion}%`],
    ['RESUMEN', 'Turnos Pendientes', metricas.turnosPendientes, '-', '-', '-'],
    ['RESUMEN', 'Turnos Hoy', metricas.turnosHoy, `Atendidos: ${metricas.atendidosHoy}`, `Ausentes: ${metricas.ausentesHoy}`, '-'],
    ['RESUMEN', 'Duración Promedio', metricas.tiempoPromedioConsultaMinutos != null ? `${metricas.tiempoPromedioConsultaMinutos} min` : 'Sin datos', '-', '-', '-'],
  ];

  (metricas.distribucionEspecialidades ?? []).forEach((esp) => {
    rows.push(['ESPECIALIDAD', esp.especialidad, esp.totalTurnos, 'turnos', '-', `${esp.porcentaje}%`]);
  });

  (metricas.demandaSemanal ?? []).forEach((d) => {
    const denom = d.atendidos + d.ausentes;
    const pct = denom > 0 ? Math.round((d.atendidos / denom) * 100) : 0;
    rows.push(['DEMANDA_DIARIA', d.label, `Atendidos: ${d.atendidos}`, `Ausentes: ${d.ausentes}`, `Total: ${d.total}`, `${pct}% asis.`]);
  });

  (metricas.evolucionMensual ?? []).forEach((m) => {
    rows.push(['EVOLUCION_MENSUAL', m.label, `Total: ${m.totalTurnos}`, `Atendidos: ${m.atendidos}`, `Ausentes: ${m.ausentes}`, `${m.tasaAsistencia}% asis.`]);
  });

  Object.entries(metricas.desglosePorEstado ?? {}).forEach(([estado, cant]) => {
    rows.push(['ESTADO_TURNO', estado, cant, 'turnos', '-', '-']);
  });

  exportarAcsv(`metricas_centro_${getFechaLocalHoy()}`, headers, rows);
}
