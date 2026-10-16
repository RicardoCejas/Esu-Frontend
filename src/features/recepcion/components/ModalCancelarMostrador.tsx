import React, { useState } from 'react';
import { XCircle, X, AlertCircle } from 'lucide-react';
import { turnosService } from '@/api/turnosService';
import type { Turno } from '@/types';

interface ModalCancelarMostradorProps {
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
  const [motivoTipo, setMotivoTipo] = useState('Desistimiento voluntario del paciente');
  const [observacion, setObservacion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !turno) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const motivoFinal = `${motivoTipo}${observacion.trim() ? `: ${observacion.trim()}` : ''}`;

    try {
      setIsSubmitting(true);
      await turnosService.cancelarConJustificativo(turno.id, motivoFinal);
      onCancelado(turno.id, motivoFinal);
      onClose();
    } catch {
      setError('No se pudo registrar la cancelación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Cancelación con Justificativo</h2>
              <p className="text-xs text-muted-foreground">Turno: {turno.codigoVerificacion}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl bg-muted/40 text-xs space-y-1">
          <p><span className="text-muted-foreground">Paciente:</span> <strong className="text-foreground">{turno.pacienteNombre}</strong></p>
          <p><span className="text-muted-foreground">Médico:</span> <strong className="text-foreground">{turno.profesionalNombre}</strong></p>
          <p><span className="text-muted-foreground">Hora:</span> <strong className="text-foreground font-mono">{turno.hora} hs</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Motivo Principal *</label>
            <select
              value={motivoTipo}
              onChange={(e) => setMotivoTipo(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Desistimiento voluntario del paciente">Desistimiento voluntario del paciente</option>
              <option value="Imprevisto / Fuerza mayor del paciente">Imprevisto / Fuerza mayor del paciente</option>
              <option value="Paciente retirado de sala por demora">Paciente retirado de sala por demora</option>
              <option value="Error de carga / Duplicado en mostrador">Error de carga / Duplicado en mostrador</option>
              <option value="Ausencia médica imprevista">Ausencia médica imprevista</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Detalle / Justificativo adicional</label>
            <textarea
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Describa el motivo expresado en ventanilla..."
              className="w-full rounded-xl border border-input bg-background p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-muted transition"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-destructive px-5 py-2 font-semibold text-destructive-foreground hover:bg-destructive/90 transition shadow-xs"
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
