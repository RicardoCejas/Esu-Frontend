import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import type { Turno } from '@/types';
import { turnosService } from '@/api/turnosService';
import { useToast } from '@/context/ToastContext';

interface GestionTurnoModalProps {
  turno: Turno | null;
  modo: 'cancelar' | 'reprogramar' | null;
  onClose: () => void;
  onSuccess: () => void;
}

function getHoyLocalISO(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const GestionTurnoModal: React.FC<GestionTurnoModalProps> = ({
  turno,
  modo,
  onClose,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast();
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (turno && modo === 'reprogramar') {
      setNuevaFecha(turno.fecha || getHoyLocalISO());
      setNuevaHora((turno.hora || '09:00').slice(0, 5));
    }
    setMotivoCancelacion('');
  }, [turno, modo]);

  if (!turno || !modo) return null;

  const fechaFormateada = turno.fecha
    ? turno.fecha.split('-').reverse().join('/')
    : 'Sin fecha';

  const handleConfirmarCancelacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    try {
      await turnosService.cancelarTurno(turno.id);
      success(
        `Turno de ${turno.pacienteNombre || 'paciente'} cancelado. Se envió la notificación al paciente.`
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'No se pudo cancelar el turno.');
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarReprogramacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaFecha || !nuevaHora) {
      toastError('Seleccioná la nueva fecha y horario.');
      return;
    }
    setProcesando(true);
    try {
      await turnosService.reprogramarTurno(turno.id, `${nuevaFecha}T${nuevaHora}:00`);
      const fechaLegible = nuevaFecha.split('-').reverse().join('/');
      success(
        `Turno reprogramado para el ${fechaLegible} a las ${nuevaHora} hs. Se envió la notificación al paciente.`
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'No se pudo reprogramar el turno.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            modo === 'cancelar'
              ? 'bg-rose-50 border-rose-100'
              : 'bg-sky-50 border-sky-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {modo === 'cancelar' ? (
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            ) : (
              <Calendar className="h-5 w-5 text-sky-700" />
            )}
            <h3 className="text-sm font-black text-slate-900">
              {modo === 'cancelar' ? 'Cancelar Turno Médico' : 'Reprogramar Turno Médico'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Datos del turno actual */}
        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1">
            <p className="font-bold text-slate-900 text-sm">
              {turno.pacienteNombre || `Paciente #${turno.pacienteId}`}
            </p>
            <p className="text-slate-600 font-mono">
              DNI: {turno.pacienteDni || 'Sin DNI'}
            </p>
            <p className="text-slate-700 font-semibold flex items-center gap-1.5 pt-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Turno actual: {fechaFormateada} a las {turno.hora || '09:00'} hs
            </p>
          </div>

          {modo === 'cancelar' ? (
            <form onSubmit={handleConfirmarCancelacion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de cancelación (opcional)
                </label>
                <textarea
                  rows={2}
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  placeholder="Ej: Reorganización de agenda médica o emergencia en guardia..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
                <Bell className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Al confirmar, el turno pasará a estado <strong>CANCELADO</strong> y se enviará una notificación automática al paciente.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {procesando ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmarReprogramacion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nueva Fecha *
                  </label>
                  <input
                    type="date"
                    min={getHoyLocalISO()}
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nuevo Horario *
                  </label>
                  <input
                    type="time"
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-[11px] text-sky-900">
                <Bell className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Al reprogramar, se actualizará la agenda y le llegará una notificación automática al paciente con el nuevo día y hora.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 text-xs font-bold text-white hover:bg-sky-800 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{procesando ? 'Reprogramando...' : 'Guardar y Notificar'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
