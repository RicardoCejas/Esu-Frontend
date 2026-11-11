import React from 'react';
import { CalendarCheck, CheckCircle2, Clock, UserX } from 'lucide-react';
import type { DashboardMetricas } from '@/api/metricasService';
import { formatFechaCorta, getFechaLocalHoy } from '@/lib/dateUtils';

interface MetricasCentroKpiGridProps {
  metricas: DashboardMetricas;
}

export const MetricasCentroKpiGrid: React.FC<MetricasCentroKpiGridProps> = ({ metricas }) => {
  const totalTurnos = metricas.totalTurnos ?? 0;
  const atendidos = metricas.turnosAtendidos ?? 0;
  const ausentes = metricas.turnosAusentes ?? 0;
  const tasaAsistencia = metricas.tasaAsistencia ?? 0;
  const tasaAusentismo = metricas.tasaAusentismo ?? 0;
  const tiempoPromedio = metricas.tiempoPromedioConsultaMinutos ?? 20;
  const especialidadTop = metricas.especialidadMasDemandada || 'Sin datos';
  const totalEspTop = metricas.totalEspecialidadMasDemandada ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Tasa de Asistencia</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground tabular-nums">{tasaAsistencia}%</span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
            {atendidos} de {totalTurnos}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Especialidad líder: <strong className="text-foreground">{especialidadTop}</strong> ({totalEspTop})
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Tasa de Ausentismo</span>
          <UserX className="h-4 w-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground tabular-nums">{tasaAusentismo}%</span>
          <span className="text-xs text-muted-foreground font-semibold tabular-nums">
            {ausentes} ausencias
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Sobre {atendidos + ausentes} turnos concretados en el período
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Atendidos Hoy</span>
          <CalendarCheck className="h-4 w-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground tabular-nums">{metricas.atendidosHoy ?? 0}</span>
          <span className="text-xs text-muted-foreground font-semibold tabular-nums">
            de {metricas.turnosHoy ?? 0} hoy
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Jornada activa ({formatFechaCorta(getFechaLocalHoy())})
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Duración Promedio</span>
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground tabular-nums">{tiempoPromedio} min</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Tiempo promedio estimado por consulta ambulatoria
        </p>
      </div>
    </div>
  );
};
