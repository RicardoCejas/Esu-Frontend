import React from 'react';
import type { Turno } from '@/types';
import { Calendar, RotateCcw, XCircle } from 'lucide-react';

export interface TurnosAdminTableProps {
  turnos: Turno[];
  isLoading: boolean;
  isProcessing: boolean;
  onReagendar: (t: Turno) => void;
  onCancelar: (t: Turno) => void;
  canCancelar?: boolean;
  canReagendar?: boolean;
}

export const TurnosAdminTable: React.FC<TurnosAdminTableProps> = ({
  turnos,
  isLoading,
  isProcessing,
  onReagendar,
  onCancelar,
  canCancelar = true,
  canReagendar = true,
}) => {
  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADO':
        return 'bg-emerald-700';
      case 'EN_ESPERA':
        return 'bg-amber-600';
      case 'ATENDIENDO':
        return 'bg-sky-700';
      case 'CANCELADO':
        return 'bg-rose-700';
      default:
        return 'bg-slate-700';
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
            <tr>
              <th className="p-4">Fecha & Hora</th>
              <th className="p-4">Código</th>
              <th className="p-4">Paciente</th>
              <th className="p-4">Profesional</th>
              <th className="p-4">Centro</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Cargando turnos...
                </td>
              </tr>
            ) : turnos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">
                      No se encontraron turnos registrados
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      No hay citas que coincidan con los filtros de búsqueda o el rango de fechas actual.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              turnos.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition">
                  <td className="p-4 font-semibold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{t.fecha ?? ''}</span>
                      <span className="text-muted-foreground font-mono">({t.hora ?? ''} hs)</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-primary font-bold">
                    {t.codigoVerificacion || `#${t.id}`}
                  </td>
                  <td className="p-4 font-medium text-foreground">{t.pacienteNombre ?? '—'}</td>
                  <td className="p-4">{t.profesionalNombre ?? '—'}</td>
                  <td className="p-4 text-muted-foreground">{t.centroSaludNombre ?? '—'}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 font-bold text-[10px] text-white shadow-xs ${getBadgeClass(
                        t.estado
                      )}`}
                    >
                      {t.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {t.estado !== 'CANCELADO' && t.estado !== 'COMPLETADO' && canReagendar && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onReagendar(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1 text-foreground hover:bg-accent transition cursor-pointer disabled:opacity-50"
                          title="Reagendar turno"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-primary" />
                          <span>Reagendar</span>
                        </button>
                      )}

                      {t.estado !== 'CANCELADO' && canCancelar && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onCancelar(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-700 font-semibold hover:bg-rose-700 hover:text-white dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-200 transition cursor-pointer disabled:opacity-50"
                          title="Cancelar cita"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
