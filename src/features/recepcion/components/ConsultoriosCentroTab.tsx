import React from 'react';
import { Link } from 'react-router-dom';
import { DoorOpen, Plus, Trash2, Pencil, PauseCircle, PlayCircle } from 'lucide-react';
import type { ConsultorioItem } from '@/api/centrosService';

export interface ConsultoriosCentroTabProps {
  consultorios: ConsultorioItem[];
  togglingId?: string | null;
  onToggleEstado: (c: ConsultorioItem) => void;
  onEliminar: (c: ConsultorioItem) => void;
}

export const ConsultoriosCentroTab: React.FC<ConsultoriosCentroTabProps> = ({
  consultorios,
  togglingId,
  onToggleEstado,
  onEliminar,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Consultorios Físicos de la Sede</h2>
          <p className="text-xs text-muted-foreground">
            Infraestructura habilitada para atención ambulatoria y asignación de profesionales.
          </p>
        </div>
        <Link
          to="/dashboard/recepcion/sede/consultorios/nuevo"
          className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Nuevo Consultorio</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultorios.map((c) => {
          const isToggling = togglingId === c.id;
          return (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl border border-border bg-muted/40 text-foreground shrink-0">
                    <DoorOpen className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-bold text-sm text-foreground truncate">Consultorio {c.numero}</h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
                          c.activo ? 'bg-emerald-700' : 'bg-slate-600'
                        }`}
                      >
                        {c.activo ? 'Activo' : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.planta}</p>
                    {c.especialidadAsignada && (
                      <span className="inline-block text-[11px] bg-slate-800 text-white px-2 py-0.5 rounded-md font-semibold">
                        {c.especialidadAsignada}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 border-t border-border/70 pt-2.5">
                <Link
                  to={`/dashboard/recepcion/sede/consultorios/${c.id}/editar`}
                  aria-label={`Editar consultorio ${c.numero}`}
                  title={`Editar consultorio ${c.numero}`}
                  className="min-h-[34px] inline-flex items-center gap-1 rounded-lg border border-input bg-background hover:bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Pencil className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                  <span>Editar</span>
                </Link>
                <button
                  type="button"
                  disabled={isToggling}
                  onClick={() => onToggleEstado(c)}
                  aria-label={c.activo ? `Pausar consultorio ${c.numero}` : `Reactivar consultorio ${c.numero}`}
                  title={c.activo ? `Pausar consultorio ${c.numero}` : `Reactivar consultorio ${c.numero}`}
                  className="min-h-[34px] inline-flex items-center gap-1 rounded-lg border border-input bg-background hover:bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                >
                  {c.activo ? (
                    <>
                      <PauseCircle className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                      <span>Reactivar</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onEliminar(c)}
                  aria-label={`Dar de baja consultorio ${c.numero}`}
                  title={`Dar de baja consultorio ${c.numero}`}
                  className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center p-1.5 text-muted-foreground hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}

        {consultorios.length === 0 && (
          <div className="col-span-full border border-dashed border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
            No hay consultorios registrados para esta sede médica.
          </div>
        )}
      </div>
    </div>
  );
};
