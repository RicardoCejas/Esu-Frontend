import React, { useState, useEffect } from 'react';
import { metricasService, type DashboardMetricas, type LogAccesoHcDto } from '@/api/metricasService';
import { centrosService } from '@/api/centrosService';
import { exportarAcsv } from '@/lib/exportCsv';
import { getFechaLocalHoy, getFechaLocalDiasAtras, formatHoraLocal, formatFechaCorta } from '@/lib/dateUtils';
import type { CentroSalud } from '@/types';
import {
  Building2,
  Activity,
  Stethoscope,
  TrendingUp,
  CalendarCheck,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Filter,
  Table as TableIcon,
  ShieldCheck,
  Clock,
  X
} from 'lucide-react';
import { InteractiveBarChart, InteractiveDonutChart } from './components/InteractiveCharts';

export const AdminDashboardPage: React.FC = () => {
  // Filtros dinámicos con fecha local
  const [fechaDesde, setFechaDesde] = useState<string>(getFechaLocalDiasAtras(30));
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaLocalHoy());
  const [centroSeleccionado, setCentroSeleccionado] = useState<string>('TODOS');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>('TODOS');

  // Datos
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [horaActualizacion, setHoraActualizacion] = useState<string>('');

  // Vista Accesible Tabular vs Gráficos
  const [vistaTabular, setVistaTabular] = useState<boolean>(false);

  // Modal de Auditoría de Accesos Clínicos
  const [modalAuditoriaOpen, setModalAuditoriaOpen] = useState<boolean>(false);
  const [logsAuditoria, setLogsAuditoria] = useState<LogAccesoHcDto[]>([]);
  const [cargandoAuditoria, setCargandoAuditoria] = useState<boolean>(false);

  const cargarDatos = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [mData, cData] = await Promise.all([
        metricasService.getDashboardMetricas({
          desde: fechaDesde,
          hasta: fechaHasta,
          centroId: centroSeleccionado !== 'TODOS' ? centroSeleccionado : undefined,
          especialidad: especialidadSeleccionada !== 'TODOS' ? especialidadSeleccionada : undefined,
        }),
        centrosService.getAll(),
      ]);
      setMetricas(mData);
      setCentros(cData || []);
      setHoraActualizacion(formatHoraLocal(mData.fechaActualizacion));
    } catch (err) {
      console.error('Error al cargar métricas del dashboard:', err);
      setErrorCarga('No se pudieron calcular las métricas gerenciales. Verificá la conexión con la API.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [fechaDesde, fechaHasta, centroSeleccionado, especialidadSeleccionada]);

  // Cargar registro de auditoría de accesos clínicos (sin datos médicos)
  const handleAbrirAuditoria = async () => {
    setModalAuditoriaOpen(true);
    setCargandoAuditoria(true);
    try {
      const res = await metricasService.getAuditoriaAccesosClinicos(0, 50);
      setLogsAuditoria(res.content || []);
    } catch (err) {
      console.error('Error al obtener registros de auditoría:', err);
    } finally {
      setCargandoAuditoria(false);
    }
  };

  // Exportación Segura de Métricas y Turnos Agregados a CSV (Sin exponer DNI ni datos clínicos)
  const handleExportarMetricasCSV = () => {
    if (!metricas) return;

    const headers = [
      'Identificador Operativo',
      'Día / Fecha',
      'Atendidos',
      'Ausentes',
      'Cancelados',
      'Total',
      'Centro de Salud / Sede',
    ];

    const rows = metricas.demandaSemanal.map((d) => [
      `SEM-${d.diaSemana}`,
      d.label,
      d.atendidos,
      d.ausentes,
      d.cancelados,
      d.total,
      metricas.centroNombre || 'Todos los Centros',
    ]);

    const nombreArchivo = `metricas_operativas_cde_${getFechaLocalHoy()}`;
    exportarAcsv(nombreArchivo, headers, rows);
  };

  // Formatear datos para gráficos
  const demandaSemanalGrafico = (metricas?.demandaSemanal || []).map((d) => ({
    label: d.label,
    valor: d.total,
    detalle: `${d.atendidos} at. / ${d.ausentes} aus.`,
  }));

  const especialidadesGrafico = (metricas?.distribucionEspecialidades || []).map((esp) => ({
    label: esp.especialidad,
    valor: esp.totalTurnos,
    color: esp.color || '#0284c7',
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Encabezado Principal y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Dashboard Administrativo y Métricas Gerenciales
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Indicadores consolidados en tiempo real de demanda médica, ocupación, ausentismo y auditoría de la red Cruz del Eje.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={handleAbrirAuditoria}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 px-3.5 py-2 text-xs font-semibold text-sky-900 dark:text-sky-300 hover:bg-sky-100 transition shadow-2xs cursor-pointer"
            title="Ver trazabilidad de quién accedió a información clínica sin revelar datos confidenciales"
          >
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Auditoría de Accesos</span>
          </button>

          <button
            type="button"
            onClick={handleExportarMetricasCSV}
            disabled={!metricas || cargando}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white transition shadow-xs cursor-pointer disabled:opacity-60"
            title="Exportar resumen operativo sin datos identificatorios de pacientes"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar Métricas (CSV)</span>
          </button>

          <button
            type="button"
            onClick={cargarDatos}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition shadow-2xs cursor-pointer"
            title="Actualizar datos desde la API"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-primary ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Metadatos de Actualización */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">Filtros de Período y Sede:</span>
            {metricas && (
              <span className="hidden sm:inline text-muted-foreground">
                ({metricas.periodoDescripcion})
              </span>
            )}
          </div>

          {horaActualizacion && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Última actualización: <strong>{horaActualizacion} hs</strong> (Hora local)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
              Centro de Salud / Sede
            </label>
            <select
              value={centroSeleccionado}
              onChange={(e) => setCentroSeleccionado(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todos los Centros (Red Cruz del Eje)</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
              Especialidad
            </label>
            <select
              value={especialidadSeleccionada}
              onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todas las Especialidades</option>
              <option value="Clínica Médica">Clínica Médica</option>
              <option value="Medicina General">Medicina General</option>
              <option value="Pediatría">Pediatría</option>
              <option value="Cardiología">Cardiología</option>
              <option value="Traumatología">Traumatología</option>
              <option value="Ginecología">Ginecología</option>
            </select>
          </div>
        </div>

        {/* Explicación de Alcance de Exportación (Requisito Fase 4) */}
        <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between">
          <p className="italic">
            * Los filtros seleccionados aplican de manera uniforme a los indicadores (KPIs), gráficos de demanda y exportaciones. Los datos son agregados y resguardan el secreto profesional conforme a la Ley 25.326.
          </p>
          <button
            type="button"
            onClick={() => setVistaTabular(!vistaTabular)}
            className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline cursor-pointer shrink-0 ml-2"
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>{vistaTabular ? 'Ver Gráficos Interactivos' : 'Ver como Tabla Accesible'}</span>
          </button>
        </div>
      </div>

      {/* Estado de Error */}
      {errorCarga && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorCarga}</span>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-800 transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado de Carga */}
      {cargando && !metricas && (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Calculando métricas agregadas desde el servidor...</p>
        </div>
      )}

      {/* Tarjetas KPI de Rendimiento */}
      {metricas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Atendidos Hoy */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Pacientes Atendidos Hoy</span>
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">{metricas.atendidosHoy}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 inline mr-0.5" /> En curso
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sobre {metricas.turnosHoy} turnos agendados hoy ({formatFechaCorta(getFechaLocalHoy())})
            </p>
          </div>

          {/* KPI 2: Ausentismo del Período (Con denominador real) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Tasa de Ausentismo</span>
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">{metricas.tasaAusentismo}%</span>
              <span className="text-xs text-muted-foreground font-semibold">
                ({metricas.turnosAusentes} ausencias)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sobre {metricas.turnosAtendidos + metricas.turnosAusentes} turnos concretados en el período
            </p>
          </div>

          {/* KPI 3: Especialidad Más Demandada */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Especialidad Top</span>
              <Stethoscope className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-foreground truncate">
                {metricas.especialidadMasDemandada}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {metricas.totalEspecialidadMasDemandada} turnos registrados en el rango
            </p>
          </div>

          {/* KPI 4: Sedes Operativas Conectadas */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Sedes Operativas</span>
              <Building2 className="h-4 w-4 text-sky-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">{centros.length}</span>
              <span className="text-xs text-emerald-600 font-semibold">100% Conectadas</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Hospital, Clínicas y Dispensarios de Cruz del Eje</p>
          </div>
        </div>
      )}

      {/* Visualización de Datos: Gráficos Interactivos O Tablas Accesibles (Requisito Fase 4) */}
      {metricas && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gráfico / Tabla 1: Demanda Semanal */}
          <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Distribución de Demanda Semanal</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Volumen real de atenciones y ausencias según día de la semana
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                Lunes a Domingo
              </span>
            </div>

            {vistaTabular ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-foreground">
                  <caption className="sr-only">Distribución de demanda semanal de turnos</caption>
                  <thead className="bg-muted text-muted-foreground uppercase text-[10px]">
                    <tr>
                      <th scope="col" className="p-2.5">Día</th>
                      <th scope="col" className="p-2.5">Atendidos</th>
                      <th scope="col" className="p-2.5">Ausentes</th>
                      <th scope="col" className="p-2.5">Cancelados</th>
                      <th scope="col" className="p-2.5">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {metricas.demandaSemanal.map((d) => (
                      <tr key={d.diaSemana} className="hover:bg-muted/30">
                        <th scope="row" className="p-2.5 font-bold">{d.label}</th>
                        <td className="p-2.5 text-emerald-600 font-semibold">{d.atendidos}</td>
                        <td className="p-2.5 text-amber-600 font-semibold">{d.ausentes}</td>
                        <td className="p-2.5 text-rose-600">{d.cancelados}</td>
                        <td className="p-2.5 font-extrabold">{d.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <InteractiveBarChart data={demandaSemanalGrafico} />
            )}
          </div>

          {/* Gráfico / Tabla 2: Distribución por Especialidad */}
          <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Demanda por Especialidad</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Distribución porcentual calculada en el período
                  </p>
                </div>
              </div>
            </div>

            {vistaTabular ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-foreground">
                  <caption className="sr-only">Demanda y porcentaje por especialidad médica</caption>
                  <thead className="bg-muted text-muted-foreground uppercase text-[10px]">
                    <tr>
                      <th scope="col" className="p-2.5">Especialidad</th>
                      <th scope="col" className="p-2.5">Turnos</th>
                      <th scope="col" className="p-2.5">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {metricas.distribucionEspecialidades.map((esp) => (
                      <tr key={esp.especialidad} className="hover:bg-muted/30">
                        <th scope="row" className="p-2.5 font-bold">{esp.especialidad}</th>
                        <td className="p-2.5 font-semibold">{esp.totalTurnos}</td>
                        <td className="p-2.5 text-sky-700 font-bold">{esp.porcentaje}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <InteractiveDonutChart data={especialidadesGrafico} />
            )}
          </div>
        </div>
      )}

      {/* MODAL DE AUDITORÍA DE ACCESOS CLÍNICOS (Requisito Fase 4) */}
      {modalAuditoriaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground font-heading">
                    Registro de Auditoría de Accesos Clínicos
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Trazabilidad de accesos y motivos asistenciales sin revelación de contenido médico (Ley 25.326 y Ley 26.529).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAuditoriaOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {cargandoAuditoria ? (
                <div className="flex items-center justify-center p-12">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : logsAuditoria.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No hay registros de accesos clínicos asentados en el período.
                </div>
              ) : (
                <table className="w-full text-xs text-left text-foreground">
                  <thead className="bg-muted text-muted-foreground uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2.5">Fecha y Hora</th>
                      <th className="p-2.5">Usuario / Profesional</th>
                      <th className="p-2.5">Rol</th>
                      <th className="p-2.5">Paciente Ref.</th>
                      <th className="p-2.5">Acción</th>
                      <th className="p-2.5">Motivo Asistencial</th>
                      <th className="p-2.5">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logsAuditoria.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/40">
                        <td className="p-2.5 font-mono text-[11px]">
                          {log.fechaHora ? log.fechaHora.replace('T', ' ').substring(0, 16) : '-'}
                        </td>
                        <td className="p-2.5 font-semibold">{log.usuarioEmail}</td>
                        <td className="p-2.5">
                          <span className="rounded-md bg-sky-50 text-sky-800 px-2 py-0.5 text-[10px] font-bold border border-sky-200">
                            {log.rolUsuario}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">
                          {log.pacienteIdentificador}
                        </td>
                        <td className="p-2.5 font-bold">{log.accion}</td>
                        <td className="p-2.5 text-muted-foreground max-w-xs truncate" title={log.motivo}>
                          {log.motivo}
                        </td>
                        <td className="p-2.5 font-mono text-[10px] text-muted-foreground">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModalAuditoriaOpen(false)}
                className="rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
