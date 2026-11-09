import React, { useEffect } from 'react';
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
    if (!isOpen) {
      resetForm();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !turno) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ejecutarCancelacion();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cancelar-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="modal-cancelar-title" className="text-base font-bold text-foreground">
                Cancelación con Justificativo
              </h2>
              <p className="text-xs text-muted-foreground">
                Turno: {turno.codigoVerificacion || `#${turno.id}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal de cancelación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1">
          <p><span className="text-muted-foreground">Paciente:</span> <strong className="text-foreground">{turno.pacienteNombre ?? '—'}</strong></p>
          <p><span className="text-muted-foreground">Médico:</span> <strong className="text-foreground">{turno.profesionalNombre ?? '—'}</strong></p>
          <p><span className="text-muted-foreground">Fecha y Hora:</span> <strong className="text-foreground font-mono">{turno.fecha} ({turno.hora} hs)</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Motivo Principal *</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {MOTIVOS_CANCELACION_MOSTRADOR.map((opcion) => (
                <option key={opcion.id} value={opcion.label}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-foreground">Detalle / Justificativo adicional</label>
              <span className={`text-[10px] ${esLongitudExcedida ? 'text-destructive font-bold' : 'text-muted-foreground font-mono'}`}>
                {caracteresRestantes} caracteres restantes
              </span>
            </div>
            <textarea
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Describa el motivo expresado en ventanilla o consultorio..."
              className={`w-full rounded-xl border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 ${
                esLongitudExcedida ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer disabled:opacity-50"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={isSubmitting || esLongitudExcedida}
              className="rounded-xl bg-destructive px-5 py-2 font-semibold text-destructive-foreground hover:bg-destructive/90 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
