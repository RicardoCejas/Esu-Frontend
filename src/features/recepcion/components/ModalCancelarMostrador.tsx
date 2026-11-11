import React, { useEffect, useId, useRef } from 'react';
import { XCircle, X, AlertCircle } from 'lucide-react';
import type { Turno } from '@/types';
import {
  useCancelacionTurno,
  MOTIVOS_CANCELACION_MOSTRADOR,
} from '../hooks/useCancelacionTurno';

export interface ModalCancelarMostradorProps {
  turno: Turno | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelado: (id: string, motivo: string) => void;
}

export const ModalCancelarMostrador: React.FC<ModalCancelarMostradorProps> = ({
  turno,
  isOpen,
  onClose,
  onCancelado,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const motivoSelectRef = useRef<HTMLSelectElement>(null);
  const motivoId = useId();
  const observacionId = useId();
  const observacionHelpId = useId();

  const {
    motivo,
    setMotivo,
    observacion,
    setObservacion,
    isSubmitting,
    error,
    ejecutarCancelacion,
    resetForm,
    caracteresRestantes,
    esLongitudExcedida,
  } = useCancelacionTurno({
    turnoId: turno?.id,
    onCancelado,
    onClose,
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const shouldShow = Boolean(isOpen && turno);
    if (shouldShow && !dialog.open) {
      resetForm();
      dialog.showModal();
      motivoSelectRef.current?.focus();
    } else if (!shouldShow && dialog.open) {
      dialog.close();
    }
  }, [isOpen, turno, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ejecutarCancelacion();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-cancelar-title"
      closedby={isSubmitting ? 'none' : 'closerequest'}
      onCancel={(e) => {
        if (isSubmitting) {
          e.preventDefault();
          return;
        }
        onClose();
      }}
      onClose={() => {
        if (isOpen) onClose();
      }}
      className="m-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95"
    >
      {turno && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
              <div>
                <h2 id="modal-cancelar-title" className="text-base font-bold text-foreground">
                  Cancelación con Justificativo
                </h2>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Turno: {turno.codigoVerificacion || `#${turno.id}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              aria-label="Cerrar diálogo de cancelación"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-900 dark:text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <dl className="rounded-xl border border-border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Paciente:</dt>
              <dd className="font-semibold text-foreground">{turno.pacienteNombre ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Profesional:</dt>
              <dd className="font-semibold text-foreground">{turno.profesionalNombre ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Fecha y Hora:</dt>
              <dd className="font-semibold text-foreground tabular-nums">
                {turno.fecha} ({turno.hora} hs)
              </dd>
            </div>
          </dl>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor={motivoId} className="block font-semibold text-foreground">
                Motivo Principal <span className="text-rose-600">*</span>
              </label>
              <select
                ref={motivoSelectRef}
                id={motivoId}
                name="motivo"
                required
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {MOTIVOS_CANCELACION_MOSTRADOR.map((opcion) => (
                  <option key={opcion.id} value={opcion.label}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={observacionId} className="font-semibold text-foreground">
                  Detalle / Justificativo adicional
                </label>
                <span
                  id={observacionHelpId}
                  className={`text-[10px] tabular-nums ${
                    esLongitudExcedida ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {caracteresRestantes} caracteres restantes
                </span>
              </div>
              <textarea
                id={observacionId}
                name="observacion"
                rows={3}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                aria-invalid={esLongitudExcedida}
                aria-describedby={observacionHelpId}
                placeholder="Describa el motivo expresado en ventanilla o consultorio..."
                className={`w-full rounded-xl border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                  esLongitudExcedida
                    ? 'border-rose-600 focus:ring-rose-500'
                    : 'border-input focus:ring-primary'
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-h-[38px] rounded-xl border border-input bg-background px-4 py-2 font-semibold text-foreground hover:bg-muted transition cursor-pointer disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isSubmitting || esLongitudExcedida}
                className="min-h-[38px] rounded-xl bg-rose-700 px-5 py-2 font-bold text-white hover:bg-rose-800 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </form>
        </div>
      )}
    </dialog>
  );
};
