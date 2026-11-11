import React from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { BloqueoAgenda } from '@/types';

interface MedicoBloqueosListProps {
  bloqueos: BloqueoAgenda[];
  canEdit: boolean;
  onOpenModal: () => void;
  onSelectDelete: (id: string) => void;
}

export const MedicoBloqueosList: React.FC<MedicoBloqueosListProps> = ({
  bloqueos,
  canEdit,
  onOpenModal,
  onSelectDelete,
}) => {
  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Bloqueos y Licencias ({bloqueos.length})</span>
        </h2>
        {canEdit && (
          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Bloquear</span>
          </button>
        )}
      </div>

      {bloqueos.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">Sin ausencias o bloqueos de agenda vigentes.</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {bloqueos.map((b) => (
            <li key={b.id} className="rounded-lg border border-border bg-background p-3 flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-foreground block">{b.motivo}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {b.fechaInicio} → {b.fechaFin}
                </span>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onSelectDelete(b.id)}
                  className="p-1 text-muted-foreground hover:text-rose-700 rounded transition cursor-pointer"
                  title="Eliminar bloqueo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
