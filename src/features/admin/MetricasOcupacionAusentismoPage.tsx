import React, { useState, useEffect, useMemo } from 'react';
import { metricasService, type DashboardMetricas } from '@/api/metricasService';
import { centrosService } from '@/api/centrosService';
import { exportarAcsv } from '@/lib/exportCsv';
import { getFechaLocalHoy, getFechaLocalDiasAtras, formatHoraLocal } from '@/lib/dateUtils';
import type { CentroSalud } from '@/types';
import {
  CalendarCheck,
  Clock,
  Printer,
  TrendingUp,
  Filter,
  BarChart2,
  LineChart,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Table as TableIcon,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import {
  InteractiveDualBarChart,
  InteractiveLineChart,
} from './components/InteractiveTrendsCharts';

export const MetricasOcupacionAusentismoPage: React.FC = () => {
  // Filtros dinámicos con fechas en huso horario local (DoD HU-70)
  const [fechaDesde, setFechaDesde] = useState<string>(getFechaLocalDiasAtras(30));
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaLocalHoy());
  const [centroSeleccionado, setCentroSeleccionado] = useState<string>('TODOS');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>('TODOS');

  // Datos del backend
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [horaActualizacion, setHoraActualizacion] = useState<string>('');

  // Vista accesible (tabla vs gráfico para WCAG)
  const [vistaTabular, setVistaTabular] = useState<boolean>(false);

  const cargarDatos = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [mData, cData] = await Promise.all([
        metricasService.getDashboardMetricas({
          desde: fechaDesde || undefined,
          hasta: fechaHasta || undefined,
          centroId: centroSeleccionado !== 'TODOS' ? centroSeleccionado : undefined,
          especialidad: especialidadSeleccionada !== 'TODOS' ? especialidadSeleccionada : undefined,
        }),
        centrosService.getAll(),
      ]);
      setMetricas(mData);
      setCentros(cData || []);
      setHoraActualizacion(formatHoraLocal(mData.fechaActualizacion));
    } catch (err) {
      console.error('Error al cargar métricas de ocupación y ausentismo:', err);
      setErrorCarga('No se pudieron calcular las métricas desde la API. Verificá la conectividad con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [fechaDesde, fechaHasta, centroSeleccionado, especialidadSeleccionada]);

  // Lista de especialidades disponibles reportadas por la red
  const especialidadesDisponibles = useMemo(() => {
    if (!metricas?.distribucionEspecialidades) return [];
    return metricas.distribucionEspecialidades.map((e) => e.especialidad).sort();
  }, [metricas]);

  // KPIs calculados por el backend (sin porcentajes inventados)
  const totalTurnos = metricas?.totalTurnos ?? 0;
  const atendidos = metricas?.turnosAtendidos ?? 0;
  const ausentes = metricas?.turnosAusentes ?? 0;

  const tasaAsistencia = metricas?.tasaAsistencia ?? 0;
  const tasaAusentismo = metricas?.tasaAusentismo ?? 0;
  const tiempoPromedioMin = metricas?.tiempoPromedioConsultaMinutos ?? 20;

  // Series para gráficos interactivos
  const dualBarData = useMemo(() => {
    if (!metricas?.demandaSemanal || metricas.demandaSemanal.length === 0) return [];
    return metricas.demandaSemanal.map((d) => ({
      label: d.label,
      atendidos: d.atendidos,
      ausentes: d.ausentes + d.cancelados,
    }));
  }, [metricas]);

  const trendLineData = useMemo(() => {
    if (!metricas?.evolucionMensual || metricas.evolucionMensual.length === 0) return [];
    return metricas.evolucionMensual.map((m) => ({
      label: m.label,
      tasaAsistencia: m.tasaAsistencia,
      tasaAusentismo: m.tasaAusentismo,
    }));
  }, [metricas]);

  // Exportar a CSV Seguro (Campos operacionales agregados, sin DNI ni datos clínicos - Ley 25.326)
  const handleExportarCSV = () => {
    if (!metricas) return;

    const headers = [
      'Agrupamiento / Fecha',
      'Turnos Atendidos',
      'Ausencias Registradas',
      'Cancelaciones',
      'Total Demandado',
      'Tasa Asistencia (%)',
      'Tasa Ausentismo (%)',
    ];

    const rows = (metricas.demandaSemanal || []).map((d) => {
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

    const fechaHoy = getFechaLocalHoy();
    exportarAcsv(`reporte_ocupacion_ausentismo_${fechaHoy}`, headers, rows);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Métricas de Ocupación y Ausentismo
            </h1>
            <span className="rounded-full bg-sky-100 dark:bg-sky-950/60 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              Red Sanitaria
            </span>
            {metricas?.respuestaIncompleta && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Límite de registros alcanzado
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Monitoreo gerencial de demanda, presentismo y rendimiento asistencial en centros de Cruz del Eje.
          </p>
        </div>

        {/* Acciones Superiores */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <button
            type="button"
            onClick={() => setVistaTabular(!vistaTabular)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-xs cursor-pointer ${
              vistaTabular
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-input hover:bg-muted'
            }`}
            title="Alternar entre gráficos interactivos y tablas numéricas accesibles (WCAG)"
          >
            {vistaTabular ? <Eye className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
            <span>{vistaTabular ? 'Ver Gráficos' : 'Vista Accesible (Tablas)'}</span>
          </button>

          <button
            type="button"
            onClick={cargarDatos}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Recalcular métricas"
          >
            <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={handleImprimir}
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-xs cursor-pointer"
            title="Imprimir informe ejecutivo para directorio"
          >
            <Printer className="h-4 w-4 text-muted-foreground" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleExportarCSV}
            disabled={!metricas || cargando}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Descargar resumen gerencial en CSV (datos agregados sin información personal identificable)"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Aviso de Privacidad y Cumplimiento de Datos */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 px-4 py-2.5 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Privacidad de Datos (Ley 25.326):</strong> Los tableros gerenciales operan con métricas agregadas por institución y no exponen historiales clínicos, diagnósticos ni DNI de pacientes.
          </span>
        </div>
        {horaActualizacion && (
          <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300">
            Actualizado: {horaActualizacion}
          </span>
        )}
      </div>

      {/* Barra de Filtros Dinámicos */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3 print:hidden">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros Dinámicos de Reporte</span>
          </div>
          {metricas?.periodoDescripcion && (
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
              Período: {metricas.periodoDescripcion}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Centro de Salud */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Centro de Salud</label>
            <select
              value={centroSeleccionado}
              onChange={(e) => setCentroSeleccionado(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todos los centros</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Especialidad */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Especialidad Médica</label>
            <select
              value={especialidadSeleccionada}
              onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todas las especialidades</option>
              {especialidadesDisponibles.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary"
            >
            </input>
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary"
            >
            </input>
          </div>
        </div>
      </div>

      {/* Manejo de Error */}
      {errorCarga && (
        <div className="rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorCarga}</span>
          </div>
          <button
            onClick={cargarDatos}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tarjetas KPI Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* KPI 1: Tasa de Asistencia */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tasa de Asistencia</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{tasaAsistencia}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 inline mr-0.5" /> asistencias efectivas
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Calculado sobre turnos concluidos (atendidos vs no presentados)
          </p>
        </div>

        {/* KPI 2: Tasa de Ausentismo */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tasa de Ausentismo</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{tasaAusentismo}%</span>
            <span className="text-xs text-muted-foreground font-semibold">
              {ausentes} ausencias
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Pacientes que no se presentaron a la consulta agendada
          </p>
        </div>

        {/* KPI 3: Pacientes Atendidos */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Turnos Atendidos</span>
            <CalendarCheck className="h-4 w-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{atendidos}</span>
            <span className="text-xs text-muted-foreground">
              de {totalTurnos} solicitados
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Consultas médicas efectivamente realizadas en el período
          </p>
        </div>

        {/* KPI 4: Tiempo Promedio por Consulta */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tiempo Promedio</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{tiempoPromedioMin} min</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Rango asistencial estándar
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Duración promedio estimada por consulta ambulatoria
          </p>
        </div>
      </div>

      {/* Visualización: Gráficos o Tablas Accesibles (WCAG) */}
      {vistaTabular ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabla 1: Demanda y Asistencia Semanal */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-sky-600" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Detalle Semanal de Atenciones y Ausencias
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Distribución por día de la semana para el período seleccionado
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" aria-label="Tabla de demanda semanal">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th scope="col" className="py-2 px-3 font-semibold">Día</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Atendidos</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Ausentes</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Cancelados</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Total</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">% Asist.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dualBarData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-muted-foreground">
                        Sin datos para los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    (metricas?.demandaSemanal || []).map((row) => {
                      const denom = row.atendidos + row.ausentes;
                      const pct = denom > 0 ? Math.round((row.atendidos / denom) * 100) : 0;
                      return (
                        <tr key={row.diaSemana} className="hover:bg-muted/40">
                          <td className="py-2 px-3 font-medium text-foreground">{row.label}</td>
                          <td className="py-2 px-3 text-right text-sky-700 dark:text-sky-400 font-semibold">{row.atendidos}</td>
                          <td className="py-2 px-3 text-right text-rose-700 dark:text-rose-400 font-semibold">{row.ausentes}</td>
                          <td className="py-2 px-3 text-right text-muted-foreground">{row.cancelados}</td>
                          <td className="py-2 px-3 text-right font-bold text-foreground">{row.total}</td>
                          <td className="py-2 px-3 text-right font-medium text-emerald-700 dark:text-emerald-400">{pct}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla 2: Evolución Mensual */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Tendencia Histórica Mensual
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Tasas de asistencia y ausentismo calculadas mes a mes
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" aria-label="Tabla de evolución mensual">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th scope="col" className="py-2 px-3 font-semibold">Mes</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Atendidos</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Ausentes</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Total Turnos</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Tasa Asist.</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Tasa Aus.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trendLineData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-muted-foreground">
                        Sin datos históricos suficientes
                      </td>
                    </tr>
                  ) : (
                    (metricas?.evolucionMensual || []).map((m) => (
                      <tr key={m.mes} className="hover:bg-muted/40">
                        <td className="py-2 px-3 font-medium text-foreground">{m.label}</td>
                        <td className="py-2 px-3 text-right text-sky-700 dark:text-sky-400 font-semibold">{m.atendidos}</td>
                        <td className="py-2 px-3 text-right text-rose-700 dark:text-rose-400 font-semibold">{m.ausentes}</td>
                        <td className="py-2 px-3 text-right font-bold text-foreground">{m.totalTurnos}</td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">{m.tasaAsistencia}%</td>
                        <td className="py-2 px-3 text-right font-semibold text-amber-700 dark:text-amber-400">{m.tasaAusentismo}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Barras dobles Atendidos vs Ausentes */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-sky-600" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Consultas Atendidas vs Ausentismo
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Comparativa de volumen por día operativo calculada por API
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                Semanal
              </span>
            </div>
            {cargando ? (
              <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Calculando datos...
              </div>
            ) : dualBarData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                No hay turnos registrados para el período seleccionado.
              </div>
            ) : (
              <InteractiveDualBarChart data={dualBarData} />
            )}
          </div>

          {/* Gráfico 2: Línea de Evolución Temporal de Tasas (%) */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Evolución Temporal de Asistencia (%)
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Histórico mensual calculado desde turnos reales sin valores simulados
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                Semestral
              </span>
            </div>
            {cargando ? (
              <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Calculando tendencia...
              </div>
            ) : trendLineData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                No hay turnos suficientes para construir la serie histórica.
              </div>
            ) : (
              <InteractiveLineChart data={trendLineData} />
            )}
          </div>
        </div>
      )}

      {/* Pie de informe para versión impresa */}
      <div className="hidden print:block text-center text-xs text-muted-foreground pt-4 border-t border-border">
        Reporte gerencial generado desde el Ecosistema de Salud Unificado (ESU) — Cruz del Eje, Córdoba. Conforme a Ley Nacional de Protección de Datos Personales N° 25.326.
      </div>
    </div>
  );
};
