import React, { useEffect } from 'react';
import type { Turno } from '@/types';
import { Calendar, Clock, RotateCcw, X } from 'lucide-react';

export interface ReagendarTurnoModalProps {
  turno: Turno;
  nuevaFecha: string;
  onNuevaFechaChange: (val: string) => void;
  nuevaHora: string;
  onNuevaHoraChange: (val: string) => void;
  isProcessing: boolean;
  onConfirm: (e: React.FormEvent) => void;
  onClose: () => void;
}

const HORARIOS_DISPONIBLES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '16:00', '16:30', '17:00', '17:30',
];

export const ReagendarTurnoModal: React.FC<ReagendarTurnoModalProps> = ({
  turno,
  nuevaFecha,
  onNuevaFechaChange,
  nuevaHora,
  onNuevaHoraChange,
  isProcessing,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isProcessing]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reagendar-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            <h3 id="modal-reagendar-title" className="font-bold text-base text-foreground font-heading">
              Reagendar Cita Médica
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal de reagendamiento"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-muted/40 p-3.5 text-xs space-y-1">
          <div><strong className="text-foreground">Paciente:</strong> {turno.pacienteNombre ?? '—'}</div>
          <div><strong className="text-foreground">Profesional:</strong> {turno.profesionalNombre ?? '—'}</div>
          <div><strong className="text-foreground">Código de Turno:</strong> {turno.codigoVerificacion || `#${turno.id}`}</div>
        </div>

        <form onSubmit={onConfirm} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Nueva Fecha</span>
            </label>
            <input
              type="date"
              required
              value={nuevaFecha}
              onChange={(e) => onNuevaFechaChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Nuevo Horario</span>
            </label>
            <select
              required
              value={nuevaHora}
              onChange={(e) => onNuevaHoraChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
            >
              {HORARIOS_DISPONIBLES.map((h) => (
                <option key={h} value={h}>
                  {h} hs
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="flex-1 rounded-xl border border-input py-2.5 font-semibold hover:bg-accent transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Guardando...' : 'Confirmar Reprogramación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
