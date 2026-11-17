import React from 'react';
import { Layers } from 'lucide-react';

interface MetricasCentroEstadoBreakdownProps {
  desglose?: Record<string, number>;
  totalTurnos: number;
}

const ESTADO_BADGE_STYLE: Record<string, string> = {
  CONFIRMADO: 'bg-sky-700 text-white',
  RESERVADO: 'bg-sky-800 text-white',
  EN_ESPERA: 'bg-amber-700 text-white',
  ATENDIENDO: 'bg-indigo-700 text-white',
  ATENDIDO: 'bg-emerald-700 text-white',
  COMPLETADO: 'bg-emerald-700 text-white',
  FINALIZADO: 'bg-emerald-700 text-white',
  AUSENTE: 'bg-rose-700 text-white',
  NO_ASISTIO: 'bg-rose-700 text-white',
  CANCELADO: 'bg-slate-700 text-white',
  CANCELADO_POR_MEDICO: 'bg-slate-800 text-white',
};

export const MetricasCentroEstadoBreakdown: React.FC<MetricasCentroEstadoBreakdownProps> = ({
  desglose,
  totalTurnos,
}) => {
  const entries = Object.entries(desglose ?? {});
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Desglose Asistencial por Estado de Turno
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-semibold tabular-nums">
          Total: <strong className="text-foreground">{totalTurnos}</strong> turnos
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {entries.map(([estado, cantidad]) => {
          const badgeCls = ESTADO_BADGE_STYLE[estado.toUpperCase()] || 'bg-slate-700 text-white';
          const porcentaje = totalTurnos > 0 ? Math.round((cantidad / totalTurnos) * 100) : 0;

          return (
            <div
              key={estado}
              className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col justify-between space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeCls}`}>
                  {estado.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-extrabold text-foreground tabular-nums">{cantidad}</span>
                <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                  {porcentaje}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
