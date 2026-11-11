import { useState, useEffect, useCallback, useMemo } from 'react';
import { metricasService, type DashboardMetricas } from '@/api/metricasService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { exportarAcsv } from '@/lib/exportCsv';
import { getFechaLocalHoy, getFechaLocalDiasAtras, formatHoraLocal } from '@/lib/dateUtils';

export function useMetricasCentro(centroId?: string | number) {
  const [fechaDesde, setFechaDesde] = useState<string>(getFechaLocalDiasAtras(30));
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaLocalHoy());
  const [especialidad, setEspecialidad] = useState<string>('TODOS');
  const [especialidadesConocidas, setEspecialidadesConocidas] = useState<string[]>([]);

  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [horaActualizacion, setHoraActualizacion] = useState<string>('');
  const [vistaTabular, setVistaTabular] = useState<boolean>(false);

  const cargarDatos = useCallback(async () => {
    if (!centroId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setErrorCarga(null);
    try {
      const data = await metricasService.getDashboardMetricas({
        desde: fechaDesde || undefined,
        hasta: fechaHasta || undefined,
        centroId: String(centroId),
        especialidad: especialidad !== 'TODOS' ? especialidad : undefined,
      });

      setMetricas(data);
      setHoraActualizacion(formatHoraLocal(data.fechaActualizacion));

      if (Array.isArray(data.distribucionEspecialidades) && data.distribucionEspecialidades.length > 0) {
        setEspecialidadesConocidas((prev) => {
          const merged = new Set(prev);
          for (const item of data.distribucionEspecialidades) {
            if (item.especialidad && item.especialidad !== 'Sin Datos') {
              merged.add(item.especialidad);
            }
          }
          return Array.from(merged).sort((a, b) => a.localeCompare(b));
        });
      }
    } catch (err: unknown) {
      setErrorCarga(
        extractApiErrorMessage(err, 'No se pudieron calcular las métricas operativas del centro.')
      );
    } finally {
      setCargando(false);
    }
  }, [centroId, fechaDesde, fechaHasta, especialidad]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const demandaSemanalGrafico = useMemo(
    () =>
      (metricas?.demandaSemanal ?? []).map((d) => ({
        label: d.label,
        valor: d.total,
        detalle: `${d.atendidos} at. / ${d.ausentes} aus.`,
      })),
    [metricas]
  );

  const especialidadesGrafico = useMemo(
    () =>
      (metricas?.distribucionEspecialidades ?? []).map((esp) => ({
        label: esp.especialidad,
        valor: esp.totalTurnos,
        color: esp.color || '#0284c7',
      })),
    [metricas]
  );

  const dualBarData = useMemo(
    () =>
      (metricas?.demandaSemanal ?? []).map((d) => ({
        label: d.label,
        atendidos: d.atendidos,
        ausentes: d.ausentes + d.cancelados,
      })),
    [metricas]
  );

  const trendLineData = useMemo(
    () =>
      (metricas?.evolucionMensual ?? []).map((m) => ({
        label: m.label,
        tasaAsistencia: m.tasaAsistencia,
        tasaAusentismo: m.tasaAusentismo,
      })),
    [metricas]
  );

  const exportarCSV = useCallback(() => {
    if (!metricas) return;

    const headers = [
      'Agrupamiento / Día',
      'Turnos Atendidos',
      'Ausencias Registradas',
      'Cancelaciones',
      'Total Demandado',
      'Tasa Asistencia (%)',
      'Tasa Ausentismo (%)',
    ];

    const rows = (metricas.demandaSemanal ?? []).map((d) => {
      const denom = d.atendidos + d.ausentes;
      const pctAsist = denom > 0 ? Math.round((d.atendidos / denom) * 100) : 0;
      const pctAus = denom > 0 ? Math.round((d.ausentes / denom) * 100) : 0;
      return [
        d.label,
        d.atendidos,
        d.ausentes,
        d.cancelados,
        d.total,
        `${pctAsist}%`,
        `${pctAus}%`,
      ];
    });

    exportarAcsv(`metricas_centro_${getFechaLocalHoy()}`, headers, rows);
  }, [metricas]);

  return {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    especialidad,
    setEspecialidad,
    especialidadesConocidas,
    metricas,
    cargando,
    errorCarga,
    horaActualizacion,
    vistaTabular,
    setVistaTabular,
    demandaSemanalGrafico,
    especialidadesGrafico,
    dualBarData,
    trendLineData,
    cargarDatos,
    exportarCSV,
  };
}
