import React, { useState, useMemo } from 'react';
import { profesionalesService } from '@/api/profesionalesService';
import { turnosService } from '@/api/turnosService';
import { useToast } from '@/context/ToastContext';
import type { Turno } from '@/types';
import {
  X,
  CalendarOff,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface BloquearAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  profesionalId: string;
  profesionalNombre?: string;
  turnosActuales: Turno[];
  onBloqueoCreado?: () => void;
}

const MOTIVOS_PREDEFINIDOS = [
  'Licencia Médica',
  'Congreso / Capacitación',
  'Feriado Institucional',
  'Vacaciones / Descanso',
  'Urgencia Personal',
  'Mantenimiento de Consultorio',
];

export const BloquearAgendaModal: React.FC<BloquearAgendaModalProps> = ({
  isOpen,
  onClose,
  profesionalId,
  profesionalNombre,
  turnosActuales,
  onBloqueoCreado,
}) => {
  const { success, error, warning } = useToast();
  const [esDiaCompleto, setEsDiaCompleto] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const [motivoCategoria, setMotivoCategoria] = useState(MOTIVOS_PREDEFINIDOS[0]);
  const [motivoDetalle, setMotivoDetalle] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Detección reactiva de turnos afectados a reprogramar (DoD HU-FE-62)
  const turnosAfectados = useMemo(() => {
    return turnosActuales.filter((turno) => {
      if (turno.estado === 'CANCELADO' || turno.estado === 'COMPLETADO' || turno.estado === 'CANCELADO_POR_MEDICO') {
        return false;
      }
      // Chequear rango de fechas
      const fechaTurno = turno.fecha;
      if (fechaTurno < fechaInicio || fechaTurno > fechaFin) {
        return false;
      }
      // Si es rango horario y está en la misma fecha
      if (!esDiaCompleto) {
        if (turno.hora < horaInicio || turno.hora > horaFin) {
          return false;
        }
      }
      return true;
    });
  }, [turnosActuales, fechaInicio, fechaFin, horaInicio, horaFin, esDiaCompleto]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fechaInicio > fechaFin) {
      warning('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    if (!esDiaCompleto && horaInicio >= horaFin) {
      warning('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    const motivoCompleto = motivoDetalle.trim()
      ? `${motivoCategoria}: ${motivoDetalle.trim()}`
      : motivoCategoria;

    setGuardando(true);
    try {
      await profesionalesService.bloquearAgenda(profesionalId || 'p1', {
        profesionalId: profesionalId || 'p1',
        fechaInicio,
        fechaFin,
        horaInicio: esDiaCompleto ? '00:00' : horaInicio,
        horaFin: esDiaCompleto ? '23:59' : horaFin,
        motivo: motivoCompleto,
      });

      // Actualizar turnos afectados preventivamente a CANCELADO_POR_MEDICO
      for (const t of turnosAfectados) {
        await turnosService.cancelarConJustificativo(
          t.id,
          `Bloqueo de agenda médica (${motivoCategoria}). Paciente a reprogramar prioritariamente.`
        );
      }

      success(
        turnosAfectados.length > 0
          ? `Agenda bloqueada. Se marcaron ${turnosAfectados.length} turno(s) para reprogramación preventiva.`
          : 'Agenda bloqueada correctamente para el período seleccionado.'
      );

      if (onBloqueoCreado) onBloqueoCreado();
      onClose();
    } catch (err: any) {
      error(err.message || 'Error al registrar el bloqueo de agenda.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
              <CalendarOff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">
                Bloqueo de Agenda por Licencia, Vacaciones o Feriados
              </h2>
              <p className="text-xs text-slate-300">
                {profesionalNombre || 'Profesional Médico'} • Inhabilita la toma de turnos temporalmente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-foreground flex-1">
          {/* Tipo de Bloqueo Toggle */}
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setEsDiaCompleto(true)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                esDiaCompleto
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Día(s) Completo(s)
            </button>
            <button
              type="button"
              onClick={() => setEsDiaCompleto(false)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                !esDiaCompleto
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Franja Horaria Específica
            </button>
          </div>

          {/* Rango de Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-600" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-600" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Rango Horario (si aplica) */}
          {!esDiaCompleto && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Hora Inicio del Bloqueo
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required={!esDiaCompleto}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Hora Fin del Bloqueo
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required={!esDiaCompleto}
                />
              </div>
            </div>
          )}

          {/* Motivo Obligatorio (DoD) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Motivo de Indisponibilidad (Obligatorio)</span>
              <span className="text-[11px] text-rose-500 font-semibold">* Requerido</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOTIVOS_PREDEFINIDOS.map((motivo) => (
                <button
                  key={motivo}
                  type="button"
                  onClick={() => setMotivoCategoria(motivo)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                    motivoCategoria === motivo
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'border border-border bg-card text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {motivo}
                </button>
              ))}
            </div>

            <textarea
              value={motivoDetalle}
              onChange={(e) => setMotivoDetalle(e.target.value)}
              placeholder="Detalles adicionales opcionales (ej: Congreso Nacional de Medicina, Licencia por Certificado N° 4891)..."
              rows={2}
              className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Alerta de Turnos Afectados a Reprogramar (DoD HU-FE-62) */}
          {turnosAfectados.length > 0 ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Atención: Existen {turnosAfectados.length} turno(s) agendados que serán cancelados
                  </h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                    Se notificará al equipo de recepción para reprogramar a los siguientes pacientes prioritariamente:
                  </p>
                </div>
              </div>

              <div className="divide-y divide-amber-200/80 dark:divide-amber-800/40 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 p-2 max-h-36 overflow-y-auto">
                {turnosAfectados.map((t) => (
                  <div key={t.id} className="py-1.5 px-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{t.pacienteNombre}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">DNI: {t.pacienteDni}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-amber-700 dark:text-amber-300 font-bold">
                      <span>{t.fecha}</span>
                      <span>{t.hora} hs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>No existen turnos agendados en este rango. La agenda quedará inhabilitada de forma segura.</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>{guardando ? 'Bloqueando...' : 'Confirmar Bloqueo de Agenda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
