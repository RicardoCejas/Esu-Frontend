import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import type { DashboardMetricas } from '@/api/metricasService';
import { InteractiveBarChart, InteractiveDonutChart } from '@/features/admin/components/InteractiveCharts';

interface MetricasCentroDemandaPanelProps {
  metricas: DashboardMetricas;
  demandaSemanalGrafico: { label: string; valor: number; detalle?: string }[];
  especialidadesGrafico: { label: string; valor: number; color: string }[];
  vistaTabular: boolean;
}

export const MetricasCentroDemandaPanel: React.FC<MetricasCentroDemandaPanelProps> = ({
  metricas,
  demandaSemanalGrafico,
  especialidadesGrafico,
  vistaTabular,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Distribución de Demanda Semanal</h2>
              <p className="text-[11px] text-muted-foreground">
                Volumen real de atenciones y ausencias por día de la semana
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Lunes a Domingo</span>
        </div>

        {vistaTabular ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-foreground">
              <caption className="sr-only">Distribución de demanda semanal de turnos del centro</caption>
              <thead className="bg-muted text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th scope="col" className="p-2.5">Día</th>
                  <th scope="col" className="p-2.5 text-right">Atendidos</th>
                  <th scope="col" className="p-2.5 text-right">Ausentes</th>
                  <th scope="col" className="p-2.5 text-right">Cancelados</th>
                  <th scope="col" className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {(metricas.demandaSemanal ?? []).map((d) => (
                  <tr key={d.diaSemana} className="hover:bg-muted/30">
                    <th scope="row" className="p-2.5 font-bold">{d.label}</th>
                    <td className="p-2.5 text-right text-emerald-700 dark:text-emerald-400 font-semibold">{d.atendidos}</td>
                    <td className="p-2.5 text-right text-amber-700 dark:text-amber-400 font-semibold">{d.ausentes}</td>
                    <td className="p-2.5 text-right text-rose-700 dark:text-rose-400">{d.cancelados}</td>
                    <td className="p-2.5 text-right font-extrabold">{d.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <InteractiveBarChart data={demandaSemanalGrafico} />
        )}
      </div>

      <div className="lg:col-span-5 rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Demanda por Especialidad</h2>
              <p className="text-[11px] text-muted-foreground">
                Distribución porcentual del centro en el período
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
                  <th scope="col" className="p-2.5 text-right">Turnos</th>
                  <th scope="col" className="p-2.5 text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {(metricas.distribucionEspecialidades ?? []).map((esp) => (
                  <tr key={esp.especialidad} className="hover:bg-muted/30">
                    <th scope="row" className="p-2.5 font-bold">{esp.especialidad}</th>
                    <td className="p-2.5 text-right font-semibold">{esp.totalTurnos}</td>
                    <td className="p-2.5 text-right text-sky-700 dark:text-sky-400 font-bold">{esp.porcentaje}%</td>
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
  );
};
