import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, UserX, XCircle } from 'lucide-react';
import type { Turno } from '@/types';

interface PacienteTurnosHistorialSectionProps {
  turnos: Turno[];
  canEdit: boolean;
  onMarcarAusente?: (turno: Turno) => void;
  onCancelar?: (turno: Turno) => void;
}

export const PacienteTurnosHistorialSection: React.FC<PacienteTurnosHistorialSectionProps> = ({
  turnos,
  canEdit,
  onMarcarAusente,
  onCancelar,
}) => {
  const [limite, setLimite] = useState(15);
  const ausentesCount = turnos.filter((t) => t.estado === 'AUSENTE').length;
  const turnosVisibles = turnos.slice(0, limite);

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Calendar className="h-4 w-4 text-sky-700" aria-hidden="true" />
          <span>Historial de Turnos y Asistencia ({turnos.length})</span>
        </h2>
        {ausentesCount > 0 && (
          <span className="rounded-md bg-amber-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
            {ausentesCount} {ausentesCount === 1 ? 'ausencia registrada' : 'ausencias registradas'}
          </span>
        )}
      </div>

      {turnos.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">
          Este paciente todavía no registra turnos en el sistema.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Profesional / Especialidad</th>
                  <th className="p-3">Establecimiento</th>
                  <th className="p-3">Estado</th>
                  {canEdit && <th className="p-3 text-right">Gestión</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {turnosVisibles.map((t) => {
                  const esActivo = t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO' || t.estado === 'EN_SALA_DE_ESPERA';
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition">
                      <td className="p-3 font-semibold tabular-nums text-foreground">
                        {t.fecha} · {t.hora} hs
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{t.profesionalNombre}</div>
                        <div className="text-[11px] text-muted-foreground">{t.especialidadNombre}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{t.centroSaludNombre}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
                            t.estado === 'COMPLETADO'
                              ? 'bg-emerald-700'
                              : t.estado === 'CANCELADO' || t.estado === 'AUSENTE' || t.estado === 'CANCELADO_POR_MEDICO'
                              ? 'bg-rose-700'
                              : 'bg-sky-700'
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {esActivo && onMarcarAusente && (
                              <button
                                type="button"
                                onClick={() => onMarcarAusente(t)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-muted"
                                title="Marcar ausente"
                              >
                                <UserX className="h-3 w-3" />
                                <span>Ausente</span>
                              </button>
                            )}
                            {esActivo && onCancelar && (
                              <button
                                type="button"
                                onClick={() => onCancelar(t)}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-300 dark:border-rose-800 px-2 py-0.5 text-[11px] text-rose-700 dark:text-rose-300 hover:bg-rose-50"
                                title="Cancelar turno"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Cancelar</span>
                              </button>
                            )}
                            {esActivo && (
                              <Link
                                to={`/dashboard/recepcion/turnos/${t.id}/reagendar`}
                                className="inline-flex items-center rounded-md bg-sky-700 text-white px-2 py-0.5 text-[11px] font-semibold hover:bg-sky-800"
                              >
                                Reagendar
                              </Link>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {turnos.length > limite && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setLimite((prev) => prev + 15)}
                className="text-xs font-bold text-sky-700 hover:underline cursor-pointer"
              >
                Cargar 15 turnos más ({turnos.length - limite} restantes)...
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
