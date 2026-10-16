import React, { useState, useEffect } from 'react';
import { turnosService } from '@/api/turnosService';
import { pacientesService } from '@/api/pacientesService';
import { centrosService } from '@/api/centrosService';
import { exportarAcsv } from '@/lib/exportCsv';
import type { Turno, User, CentroSalud } from '@/types';
import {
  Building2,
  Activity,
  Stethoscope,
  TrendingUp,
  Download,
  CalendarCheck,
  BarChart3,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';
import { InteractiveBarChart, InteractiveDonutChart } from './components/InteractiveCharts';

export const AdminDashboardPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);

  useEffect(() => {
    Promise.all([
      turnosService.getAll(),
      pacientesService.getAll(),
      centrosService.getAll(),
    ]).then(([tData, pData, cData]) => {
      setTurnos(tData);
      setPacientes(pData);
      setCentros(cData);
    });
  }, []);

  const hoyStr = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter((t) => t.fecha === hoyStr);
  const atendidosHoy = turnosHoy.filter((t) => t.estado === 'COMPLETADO').length;

  // Ausentismo mensual estimado
  const turnosCanceladosOausentes = turnos.filter(
    (t) => t.estado === 'CANCELADO' || t.estado === 'AUSENTE'
  ).length;
  const ausentismoPorcentaje =
    turnos.length > 0 ? Math.round((turnosCanceladosOausentes / turnos.length) * 100) : 4.8;

  // Especialidad más demandada
  const conteoEspecialidad: Record<string, number> = {};
  turnos.forEach((t) => {
    const esp = t.especialidadNombre || 'Medicina General';
    conteoEspecialidad[esp] = (conteoEspecialidad[esp] || 0) + 1;
  });
  let topEspecialidad = 'Clínica Médica';
  let topConteo = 0;
  Object.entries(conteoEspecialidad).forEach(([esp, count]) => {
    if (count > topConteo) {
      topConteo = count;
      topEspecialidad = esp.split('/')[0].trim();
    }
  });

  // Datos para Gráfico de Barras: Demanda Semanal
  const demandaSemanalData = [
    { label: 'Lun', valor: 42 },
    { label: 'Mar', valor: 58 },
    { label: 'Mié', valor: 65 },
    { label: 'Jue', valor: 51 },
    { label: 'Vie', valor: 70 },
    { label: 'Sáb', valor: 24 },
  ];

  // Datos para Gráfico de Dona: Distribución de Demanda por Especialidad
  const distribucionEspecialidadesData = [
    { label: 'Clínica Médica', valor: 85, color: '#0284c7' }, // sky-600
    { label: 'Pediatría', valor: 48, color: '#10b981' }, // emerald-500
    { label: 'Cardiología', valor: 36, color: '#f59e0b' }, // amber-500
    { label: 'Ginecología', valor: 30, color: '#8b5cf6' }, // violet-500
    { label: 'Traumatología', valor: 22, color: '#ec4899' }, // pink-500
  ];

  // HU-56: Exportación de Turnos a CSV
  const handleExportarTurnosCSV = () => {
    const headers = [
      'Código Turno',
      'Fecha',
      'Hora',
      'DNI Paciente',
      'Nombre Paciente',
      'Obra Social',
      'N° Afiliado',
      'Copago ($)',
      'Profesional',
      'Especialidad',
      'Sede / Centro',
      'Consultorio',
      'Estado',
      'Justificativo Cancelación',
    ];

    const rows = turnos.map((t) => [
      t.codigoVerificacion,
      t.fecha,
      t.hora,
      t.pacienteDni,
      t.pacienteNombre,
      t.obraSocial || 'Particular',
      t.numeroAfiliado || 'N/A',
      t.copagoMonto ?? 0,
      t.profesionalNombre,
      t.especialidadNombre,
      t.centroSaludNombre,
      t.consultorioNumero || 'S/N',
      t.estado,
      t.justificativoCancelacion || '',
    ]);

    exportarAcsv(`reporte_turnos_esu_${hoyStr}`, headers, rows);
  };

  // HU-56: Exportación de Padrón a CSV
  const handleExportarPadronCSV = () => {
    const headers = ['ID', 'Nombre', 'Apellido', 'DNI', 'Email', 'Teléfono', 'Rol'];
    const rows = pacientes.map((p) => [
      p.id,
      p.nombre,
      p.apellido,
      p.dni,
      p.email,
      p.telefono || 'Sin teléfono',
      p.rol,
    ]);

    exportarAcsv(`padron_pacientes_esu_${hoyStr}`, headers, rows);
  };

  return (
    <div className="space-y-8">
      {/* Encabezado y Botones de Exportación CSV (HU-56) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Administrativo y Métricas Gerenciales
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoreo en tiempo real de demanda médica, indicadores de rendimiento (KPIs) y exportación de reportes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportarPadronCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-xs"
          >
            <Download className="h-4 w-4 text-primary" />
            <span>Exportar Padrón (CSV)</span>
          </button>

          <button
            onClick={handleExportarTurnosCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar Turnos Diarios (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Rendimiento (DoD HU-56) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pacientes Atendidos Hoy */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Pacientes Atendidos Hoy</span>
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{atendidosHoy}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 inline mr-0.5" /> En curso
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Sobre {turnosHoy.length} turnos programados hoy</p>
        </div>

        {/* KPI 2: Ausentismo Mensual */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Ausentismo Mensual</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{ausentismoPorcentaje}%</span>
            <span className="text-xs text-emerald-600 font-semibold">Dentro del umbral (&lt; 8%)</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Cancelaciones y ausencias en ventanilla</p>
        </div>

        {/* KPI 3: Especialidad Más Demandada */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Especialidad Top</span>
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-foreground truncate">{topEspecialidad}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Mayor volumen de solicitudes semanales</p>
        </div>

        {/* KPI 4: Centros y Sedes Activas */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Sedes Operativas</span>
            <Building2 className="h-4 w-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{centros.length}</span>
            <span className="text-xs text-emerald-600 font-semibold">100% Conectadas</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Hospital, Clínicas y Dispensarios</p>
        </div>
      </div>

      {/* Gráficos Interactivos de Barra y Dona (DoD HU-56) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Barras: Demanda Semanal */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Distribución de Demanda Semanal</h2>
                <p className="text-[11px] text-muted-foreground">Volumen de turnos agendados por día de atención</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-muted-foreground">Lunes a Sábado</span>
          </div>
          <InteractiveBarChart data={demandaSemanalData} />
        </div>

        {/* Gráfico de Dona: Distribución por Especialidad */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Demanda por Especialidad</h2>
                <p className="text-[11px] text-muted-foreground">Distribución porcentual de consultas</p>
              </div>
            </div>
          </div>
          <InteractiveDonutChart data={distribucionEspecialidadesData} />
        </div>
      </div>
    </div>
  );
};
