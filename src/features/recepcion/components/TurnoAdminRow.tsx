import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, RotateCcw, XCircle, UserCheck, UserX, User } from 'lucide-react';
import type { Turno } from '@/types';

export interface TurnoAdminRowProps {
  turno: Turno;
  isProcessing: boolean;
  canCancelar?: boolean;
  canReagendar?: boolean;
  canCheckIn?: boolean;
  onCancelar: (t: Turno) => void;
  onCheckIn: (t: Turno) => void;
  onMarcarAusente: (t: Turno) => void;
}

const TERMINAL_OR_BUSY_STATES = [
  'CANCELADO',
  'CANCELADO_POR_MEDICO',
  'CANCELADO_POR_PACIENTE',
  'COMPLETADO',
  'ATENDIENDO',
  'AUSENTE',
];

function getBadgeStyle(estado: string): string {
  switch (estado) {
    case 'CONFIRMADO':
      return 'bg-emerald-700 text-white';
    case 'EN_ESPERA':
    case 'EN_SALA_DE_ESPERA':
      return 'bg-amber-700 text-white';
    case 'ATENDIENDO':
      return 'bg-sky-700 text-white';
    case 'COMPLETADO':
      return 'bg-blue-800 text-white';
    case 'AUSENTE':
      return 'bg-purple-800 text-white';
    case 'CANCELADO':
    case 'CANCELADO_POR_MEDICO':
    case 'CANCELADO_POR_PACIENTE':
      return 'bg-rose-700 text-white';
    default:
      return 'bg-slate-700 text-white';
  }
}

export const TurnoAdminRow: React.FC<TurnoAdminRowProps> = ({
  turno: t,
  isProcessing,
  canCancelar = true,
  canReagendar = true,
  canCheckIn = true,
  onCancelar,
  onCheckIn,
  onMarcarAusente,
}) => {
  const isTerminalOrBusy = TERMINAL_OR_BUSY_STATES.includes(t.estado);
  const puedeHacerCheckIn = (t.estado === 'CONFIRMADO' || t.estado === 'PENDIENTE') && canCheckIn;
  const puedeMarcarAusente = (t.estado === 'CONFIRMADO' || t.estado === 'EN_ESPERA' || t.estado === 'EN_SALA_DE_ESPERA') && canCancelar;

  return (
    <tr className="hover:bg-muted/30 transition text-xs">
      <td className="p-3.5 font-semibold text-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-sky-700 shrink-0" aria-hidden="true" />
          <span>{t.fecha ?? ''}</span>
          <span className="text-muted-foreground tabular-nums">({t.hora ?? ''} hs)</span>
        </div>
      </td>

      <td className="p-3.5 tabular-nums text-sky-800 dark:text-sky-300 font-bold">
        {t.codigoVerificacion || `#${t.id}`}
      </td>

      <td className="p-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{t.pacienteNombre ?? '—'}</span>
            {t.pacienteId && (
              <Link
                to={`/dashboard/recepcion/pacientes/${t.pacienteId}`}
                className="text-slate-400 hover:text-sky-700 transition"
                title="Ver ficha del paciente"
                aria-label="Ver ficha del paciente"
              >
                <User className="h-3 w-3" />
              </Link>
            )}
          </div>
          {t.pacienteDni && (
            <span className="text-[11px] text-muted-foreground tabular-nums block">DNI {t.pacienteDni}</span>
          )}
        </div>
      </td>

      <td className="p-3.5">
        <div className="space-y-0.5">
          <span className="font-medium text-foreground block">{t.profesionalNombre ?? '—'}</span>
          {t.especialidadNombre && (
            <span className="text-[11px] text-muted-foreground block">{t.especialidadNombre}</span>
          )}
        </div>
      </td>

      <td className="p-3.5 text-muted-foreground">
        <span className="block font-medium text-foreground">{t.consultorioNumero ? `Cons. ${t.consultorioNumero}` : (t.centroSaludNombre ?? '—')}</span>
        {t.consultorioNumero && t.centroSaludNombre && (
          <span className="text-[11px] text-muted-foreground block">{t.centroSaludNombre}</span>
        )}
      </td>

      <td className="p-3.5">
        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-bold text-[10px] shadow-2xs ${getBadgeStyle(t.estado)}`}>
          {t.estado}
        </span>
      </td>

      <td className="p-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {puedeHacerCheckIn && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onCheckIn(t)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-2 py-1 font-semibold hover:bg-emerald-100 transition cursor-pointer"
              title="Marcar ingreso a sala de espera"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Check-in</span>
            </button>
          )}

          {puedeMarcarAusente && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onMarcarAusente(t)}
              className="inline-flex items-center gap-1 rounded-lg border border-purple-300 bg-purple-50 dark:bg-purple-950/40 dark:border-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 font-semibold hover:bg-purple-100 transition cursor-pointer"
              title="Marcar como ausente"
            >
              <UserX className="h-3.5 w-3.5 text-purple-700" />
              <span>Ausente</span>
            </button>
          )}

          {!isTerminalOrBusy && canReagendar && (
            <Link
              to={`/dashboard/recepcion/turnos/${t.id}/reagendar`}
              className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1 text-foreground hover:bg-accent transition font-medium"
              title="Reagendar turno"
            >
              <RotateCcw className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
              <span>Reagendar</span>
            </Link>
          )}

          {!isTerminalOrBusy && canCancelar && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onCancelar(t)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-card px-2.5 py-1 text-rose-700 font-semibold hover:bg-rose-700 hover:text-white dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-200 transition cursor-pointer disabled:opacity-50"
              title="Cancelar cita médica"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
