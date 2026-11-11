import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Turno } from '@/types';

interface MedicoProximosTurnosListProps {
  turnos: Turno[];
}

export const MedicoProximosTurnosList: React.FC<MedicoProximosTurnosListProps> = ({ turnos }) => {
  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-2.5">
        <Calendar className="h-4 w-4 text-sky-700" aria-hidden="true" />
        <span>Próximos Turnos en esta Sede ({turnos.length})</span>
      </h2>

      {turnos.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">
          No se registran turnos activos próximos para este profesional en la sede.
        </p>
      ) : (
        <ul className="divide-y divide-border text-xs">
          {turnos.map((t) => (
            <li key={t.id} className="py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{t.pacienteNombre}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {t.fecha} · {t.hora} hs ({t.estado})
                </p>
              </div>
              <Link
                to={`/dashboard/recepcion/turnos/${t.id}/reagendar`}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-muted transition shrink-0"
              >
                Reagendar
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
