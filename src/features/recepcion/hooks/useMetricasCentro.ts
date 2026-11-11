import { useState, useEffect, useCallback, useMemo } from 'react';
import { metricasService, type DashboardMetricas } from '@/api/metricasService';
import { reportesService } from '@/api/reportesService';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { exportarMetricasCsvCompleto } from '../utils/metricasExportUtils';
import { getFechaLocalHoy, getFechaLocalDiasAtras, formatHoraLocal } from '@/lib/dateUtils';

export interface OpcionMedicoMetricas {
  id: number;
  nombreCompleto: string;
}

export function useMetricasCentro(centroId?: string | number) {
  const [fechaDesde, setFechaDesde] = useState<string>(getFechaLocalDiasAtras(30));
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaLocalHoy());
  const [especialidad, setEspecialidad] = useState<string>('TODOS');
  const [profesionalId, setProfesionalId] = useState<string>('TODOS');
  const [consultorio, setConsultorio] = useState<string>('TODOS');

  const [especialidadesConocidas, setEspecialidadesConocidas] = useState<string[]>([]);
  const [medicosOpciones, setMedicosOpciones] = useState<OpcionMedicoMetricas[]>([]);
  const [consultoriosOpciones, setConsultoriosOpciones] = useState<string[]>([]);

  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [horaActualizacion, setHoraActualizacion] = useState<string>('');
  const [vistaTabular, setVistaTabular] = useState<boolean>(false);

  const [exportandoOficial, setExportandoOficial] = useState<boolean>(false);
  const [errorExportacion, setErrorExportacion] = useState<string | null>(null);

  useEffect(() => {
    if (!centroId) return;
    let isSubscribed = true;
    const idStr = String(centroId);

    Promise.allSettled([
      centrosService.getEspecialidadesPorCentro(idStr),
      profesionalesService.getByCentro(idStr),
      centrosService.getConsultorios(idStr),
    ]).then(([espsRes, profsRes, consRes]) => {
      if (!isSubscribed) return;

      if (espsRes.status === 'fulfilled' && Array.isArray(espsRes.value)) {
        const nombres = espsRes.value.map((e) => e.nombre).filter(Boolean);
        setEspecialidadesConocidas((prev) => Array.from(new Set([...prev, ...nombres])).sort());
      }

      if (profsRes.status === 'fulfilled' && Array.isArray(profsRes.value)) {
        setMedicosOpciones(
          profsRes.value.map((p) => ({
            id: Number(p.id),
            nombreCompleto: `Dr(a). ${p.nombre} ${p.apellido}`.trim(),
          }))
        );
      }

      if (consRes.status === 'fulfilled' && Array.isArray(consRes.value)) {
        const nums = consRes.value.map((c) => String(c.numero)).filter(Boolean);
        setConsultoriosOpciones(Array.from(new Set(nums)).sort());
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [centroId]);

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
        profesionalId: profesionalId !== 'TODOS' ? profesionalId : undefined,
        consultorio: consultorio !== 'TODOS' ? consultorio : undefined,
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
  }, [centroId, fechaDesde, fechaHasta, especialidad, profesionalId, consultorio]);

  useEffect(() => {
    void cargarDatos();
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
    if (metricas) exportarMetricasCsvCompleto(metricas);
  }, [metricas]);

  const descargarExcelOficial = useCallback(async () => {
    setExportandoOficial(true);
    setErrorExportacion(null);
    try {
      await reportesService.exportarTurnosExcel({
        desde: fechaDesde,
        hasta: fechaHasta,
        centroSaludId: centroId,
      });
    } catch (err: unknown) {
      setErrorExportacion(extractApiErrorMessage(err, 'No se pudo generar el reporte oficial en Excel.'));
    } finally {
      setExportandoOficial(false);
    }
  }, [fechaDesde, fechaHasta, centroId]);

  const descargarPdfOficial = useCallback(async () => {
    setExportandoOficial(true);
    setErrorExportacion(null);
    try {
      await reportesService.exportarTurnosPdf({
        desde: fechaDesde,
        hasta: fechaHasta,
        centroSaludId: centroId,
      });
    } catch (err: unknown) {
      setErrorExportacion(extractApiErrorMessage(err, 'No se pudo generar el reporte oficial en PDF.'));
    } finally {
      setExportandoOficial(false);
    }
  }, [fechaDesde, fechaHasta, centroId]);

  return {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    especialidad,
    setEspecialidad,
    profesionalId,
    setProfesionalId,
    consultorio,
    setConsultorio,
    especialidadesConocidas,
    medicosOpciones,
    consultoriosOpciones,
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
    descargarExcelOficial,
    descargarPdfOficial,
    exportandoOficial,
    errorExportacion,
  };
}
