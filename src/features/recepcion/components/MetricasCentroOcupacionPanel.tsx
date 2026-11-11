import React from 'react';
import { BarChart2, LineChart } from 'lucide-react';
import type { DashboardMetricas } from '@/api/metricasService';
import {
  InteractiveDualBarChart,
  InteractiveLineChart,
} from '@/features/admin/components/InteractiveTrendsCharts';

interface MetricasCentroOcupacionPanelProps {
  metricas: DashboardMetricas;
  dualBarData: { label: string; atendidos: number; ausentes: number }[];
  trendLineData: { label: string; tasaAsistencia: number; tasaAusentismo: number }[];
  vistaTabular: boolean;
}

export const MetricasCentroOcupacionPanel: React.FC<MetricasCentroOcupacionPanelProps> = ({
  metricas,
  dualBarData,
  trendLineData,
  vistaTabular,
}) => {
  if (vistaTabular) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="pb-3 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Atenciones vs Ausencias Semanales</h2>
            <p className="text-[11px] text-muted-foreground">Distribución por día operativo en el período</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Tabla semanal de asistencia y ausencias">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="py-2 px-3 font-semibold">Día</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Atendidos</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Ausentes</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Cancelados</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">% Asist.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {(metricas.demandaSemanal ?? []).map((row) => {
                  const denom = row.atendidos + row.ausentes;
                  const pct = denom > 0 ? Math.round((row.atendidos / denom) * 100) : 0;
                  return (
                    <tr key={row.diaSemana} className="hover:bg-muted/40">
                      <th scope="row" className="py-2 px-3 font-medium text-foreground">{row.label}</th>
                      <td className="py-2 px-3 text-right text-sky-700 dark:text-sky-400 font-semibold">{row.atendidos}</td>
                      <td className="py-2 px-3 text-right text-rose-700 dark:text-rose-400 font-semibold">{row.ausentes}</td>
                      <td className="py-2 px-3 text-right text-muted-foreground">{row.cancelados}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="pb-3 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Tendencia Histórica Mensual</h2>
            <p className="text-[11px] text-muted-foreground">Tasas de asistencia y ausentismo mes a mes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Tabla de evolución mensual">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="py-2 px-3 font-semibold">Mes</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Atendidos</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Ausentes</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Asist.</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Aus.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {(metricas.evolucionMensual ?? []).map((m) => (
                  <tr key={m.mes} className="hover:bg-muted/40">
                    <th scope="row" className="py-2 px-3 font-medium text-foreground">{m.label}</th>
                    <td className="py-2 px-3 text-right text-sky-700 dark:text-sky-400 font-semibold">{m.atendidos}</td>
                    <td className="py-2 px-3 text-right text-rose-700 dark:text-rose-400 font-semibold">{m.ausentes}</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">{m.tasaAsistencia}%</td>
                    <td className="py-2 px-3 text-right font-semibold text-amber-700 dark:text-amber-400">{m.tasaAusentismo}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-sky-700 dark:text-sky-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Consultas Atendidas vs Ausentismo</h2>
              <p className="text-[11px] text-muted-foreground">Volumen por día operativo de la sede</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Semanal</span>
        </div>
        {dualBarData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
            Sin turnos registrados para el período seleccionado.
          </div>
        ) : (
          <InteractiveDualBarChart data={dualBarData} />
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Evolución Temporal de Asistencia (%)</h2>
              <p className="text-[11px] text-muted-foreground">Histórico mensual calculado desde turnos reales</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Semestral</span>
        </div>
        {trendLineData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
            Sin turnos suficientes para construir la serie histórica.
          </div>
        ) : (
          <InteractiveLineChart data={trendLineData} />
        )}
      </div>
    </div>
  );
};
