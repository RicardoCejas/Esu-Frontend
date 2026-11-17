import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';
import type { ConsultorioItem } from '@/api/centrosService';
import type { DisponibilidadRequest } from '@/types';

interface ModalCrearDisponibilidadProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DisponibilidadRequest) => Promise<boolean>;
  profesionalId: string;
  activeCentroId: string;
  consultorios: ConsultorioItem[];
}

const DIAS = [
  { value: 'LUNES', label: 'Lunes' }, { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' }, { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' }, { value: 'SABADO', label: 'Sábado' },
];

export const ModalCrearDisponibilidad: React.FC<ModalCrearDisponibilidadProps> = ({
  isOpen, onClose, onConfirm, profesionalId, activeCentroId, consultorios,
}) => {
  const [diaSemana, setDiaSemana] = useState('LUNES');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('13:00');
  const [intervaloMinutos, setIntervaloMinutos] = useState(20);
  const [consultorioId, setConsultorioId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (horaInicio >= horaFin) {
      setErrorMsg('La hora de inicio debe ser anterior a la de fin.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await onConfirm({
        profesionalId,
        centroSaludId: activeCentroId,
        diaSemana,
        horaInicio,
        horaFin,
        intervaloMinutos: Number(intervaloMinutos),
        consultorioId: consultorioId || undefined,
      });
      if (ok) onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-disp-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 id="modal-disp-title" className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-700" />
            <span>Nueva Franja Horaria de Atención</span>
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
            <label htmlFor="disp-dia" className="block font-bold text-foreground mb-1">Día de la Semana *</label>
            <select id="disp-dia" value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs">
              {DIAS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="disp-ini" className="block font-bold text-foreground mb-1">Hora Inicio *</label>
              <input id="disp-ini" type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs" />
            </div>
            <div>
              <label htmlFor="disp-fin" className="block font-bold text-foreground mb-1">Hora Fin *</label>
              <input id="disp-fin" type="time" required value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="disp-int" className="block font-bold text-foreground mb-1">Intervalo *</label>
              <select id="disp-int" value={intervaloMinutos} onChange={(e) => setIntervaloMinutos(Number(e.target.value))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs">
                {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="disp-con" className="block font-bold text-foreground mb-1">Consultorio Habitual</label>
              <select id="disp-con" value={consultorioId} onChange={(e) => setConsultorioId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs">
                <option value="">Sin consultorio fijo</option>
                {consultorios.map((c) => <option key={c.id} value={c.id}>{c.numero} ({c.planta})</option>)}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-input px-3 py-1.5 font-semibold text-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-sky-700 px-4 py-1.5 font-bold text-white hover:bg-sky-800 disabled:opacity-50">{submitting ? 'Guardando...' : 'Crear Franja'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
