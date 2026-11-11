import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { BloqueoRequest } from '@/types';

interface ModalCrearBloqueoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BloqueoRequest) => Promise<boolean>;
  profesionalId: string;
}

const MOTIVOS = ['Licencia Médica', 'Congreso Médico', 'Vacaciones', 'Capacitación Institucional', 'Fuerza Mayor'];

export const ModalCrearBloqueo: React.FC<ModalCrearBloqueoProps> = ({
  isOpen, onClose, onConfirm, profesionalId,
}) => {
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [motivoCustom, setMotivoCustom] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) {
      setErrorMsg('Las fechas de inicio y fin son obligatorias.');
      return;
    }
    if (fechaInicio > fechaFin) {
      setErrorMsg('La fecha de inicio debe ser anterior o igual a la de fin.');
      return;
    }
    const finalMotivo = motivo === 'Otro' ? motivoCustom.trim() : motivo;
    if (!finalMotivo) {
      setErrorMsg('Ingresá el motivo del bloqueo.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await onConfirm({
        profesionalId,
        fechaInicio,
        fechaFin,
        horaInicio: horaInicio ? (horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio) : undefined,
        horaFin: horaFin ? (horaFin.length === 5 ? `${horaFin}:00` : horaFin) : undefined,
        motivo: finalMotivo,
      });
      if (ok) onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar el bloqueo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-bloqueo-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 id="modal-bloqueo-title" className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Registrar Bloqueo / Licencia Médica</span>
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div role="alert" className="p-2.5 text-xs rounded-xl border border-rose-300 bg-rose-50 text-rose-900 font-medium">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="bloq-motivo" className="block font-bold text-foreground mb-1">Motivo de Indisponibilidad *</label>
            <select id="bloq-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs">
              {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
              <option value="Otro">Otro motivo...</option>
            </select>
            {motivo === 'Otro' && (
              <input type="text" placeholder="Especificar motivo..." value={motivoCustom} onChange={(e) => setMotivoCustom(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bloq-fini" className="block font-bold text-foreground mb-1">Fecha Inicio *</label>
              <input id="bloq-fini" type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs" />
            </div>
            <div>
              <label htmlFor="bloq-ffin" className="block font-bold text-foreground mb-1">Fecha Fin *</label>
              <input id="bloq-ffin" type="date" required value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bloq-hini" className="block font-bold text-foreground mb-1">Hora Inicio (opcional)</label>
              <input id="bloq-hini" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs" />
            </div>
            <div>
              <label htmlFor="bloq-hfin" className="block font-bold text-foreground mb-1">Hora Fin (opcional)</label>
              <input id="bloq-hfin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs" />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-xl">
            Los turnos existentes en el período serán cancelados preventivamente para reprogramación.
          </p>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-input px-3 py-1.5 font-semibold text-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-amber-600 px-4 py-1.5 font-bold text-white hover:bg-amber-700 disabled:opacity-50">{submitting ? 'Registrando...' : 'Registrar Bloqueo'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
