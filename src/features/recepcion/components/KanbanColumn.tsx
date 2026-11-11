import React from 'react';
import { KanbanTurnoCard } from './KanbanTurnoCard';
import type { Turno } from '@/types';

interface KanbanColumnProps {
  title: string;
  dotColor: string;
  badgeBg: string;
  turnos?: Turno[];
  columna: 'porLlegar' | 'enEspera' | 'enConsulta' | 'atendidos';
  onMoverAEnEspera?: (t: Turno) => void;
  onLlamar?: (t: Turno) => void;
  onFinalizar?: (t: Turno) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  dotColor,
  badgeBg,
  turnos = [],
  columna,
  onMoverAEnEspera,
  onLlamar,
  onFinalizar,
}) => {
  const listaTurnos = Array.isArray(turnos) ? turnos : [];

  return (
    <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col min-h-[500px]">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{title}</h3>
        </div>
        <span className={`rounded-full ${badgeBg} px-2.5 py-0.5 text-xs tabular-nums font-bold text-white shadow-2xs`}>
          {listaTurnos.length}
        </span>
      </div>

      <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
        {listaTurnos.map((t) => (
          <KanbanTurnoCard
            key={t.id}
            turno={t}
            columna={columna}
            onMoverAEnEspera={onMoverAEnEspera}
            onLlamar={onLlamar}
            onFinalizar={onFinalizar}
          />
        ))}

        {listaTurnos.length === 0 && (
          <div className="h-32 flex items-center justify-center text-xs text-muted-foreground/60 italic">
            Sin pacientes en esta fase
          </div>
        )}
      </div>
    </div>
  );
};
