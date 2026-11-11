import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, DollarSign, RotateCcw, UserX, Megaphone, CalendarClock, FileText } from 'lucide-react';
import type { Turno } from '@/types';

interface RecepcionTurnoRowProps {
  turno: Turno;
  mostrarFecha?: boolean;
  canCheckIn?: boolean;
  canCancelar?: boolean;
  onCheckIn: (turno: Turno) => void;
  onMarcarAusente: (turno: Turno) => void;
  onLlamar?: (turno: Turno) => void;
  onOpenCopago: (turno: Turno) => void;
  onOpenCancelar: (turno: Turno) => void;
}

export const RecepcionTurnoRow: React.FC<RecepcionTurnoRowProps> = ({
  turno: t,
  mostrarFecha = false,
  canCheckIn = true,
  canCancelar = true,
  onCheckIn,
  onMarcarAusente,
  onLlamar,
  onOpenCopago,
  onOpenCancelar,
}) => {
  const esEnEspera = t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA';
  const esAtendiendo = t.estado === 'ATENDIENDO';
  const esCompletado = t.estado === 'COMPLETADO';
  const esCancelado = t.estado === 'CANCELADO' || t.estado === 'CANCELADO_POR_MEDICO';
  const esAusente = t.estado === 'AUSENTE';
  const esTerminal = esCompletado || esCancelado || esAusente;

  const badgeClass = esEnEspera
    ? 'bg-amber-600 text-white'
    : esAtendiendo
    ? 'bg-sky-700 text-white'
    : esCompletado
    ? 'bg-emerald-700 text-white'
    : esCancelado
    ? 'bg-rose-700 text-white'
    : esAusente
    ? 'bg-slate-700 text-white'
    : 'bg-slate-800 text-white';

  return (
    <tr className="hover:bg-muted/30 transition">
      <td className="p-3.5 font-bold tabular-nums text-sm text-foreground">
        {mostrarFecha && t.fecha && <div className="text-[11px] text-muted-foreground font-normal">{t.fecha}</div>}
        <div>{t.hora} hs</div>
        {t.horaCheckIn && <div className="text-[10px] text-muted-foreground font-normal">Check-in: {t.horaCheckIn}</div>}
      </td>
      <td className="p-3.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <span>{t.pacienteNombre}</span>
          {t.esPrimeraVez && (
            <span className="inline-flex items-center rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
              1ª Vez
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground tabular-nums">
          DNI: {t.pacienteDni} • Tel: {t.pacienteTelefono ?? 'S/N'}
        </div>
      </td>
      <td className="p-3.5">
        <div className="font-medium text-foreground">{t.obraSocial || 'Particular'}</div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
          {t.copagoMonto !== undefined ? (
            <span className="text-emerald-600 font-semibold">Copago: ${t.copagoMonto} {t.numeroBono && `(${t.numeroBono})`}</span>
          ) : (
            <span className="text-amber-600 font-medium">Copago pendiente</span>
          )}
        </div>
      </td>
      <td className="p-3.5">
        <div className="font-semibold text-foreground">{t.profesionalNombre}</div>
        <div className="text-[11px] text-muted-foreground">{t.especialidadNombre}</div>
      </td>
      <td className="p-3.5">
        <div className="font-medium text-foreground">
          Consultorio {t.consultorioNumero || 'S/N'} {t.planta && `(${t.planta})`}
        </div>
        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{t.centroSaludNombre}</div>
      </td>
      <td className="p-3.5 text-center">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}`}>
          {t.estado === 'EN_SALA_DE_ESPERA' ? 'EN SALA DE ESPERA' : t.estado}
        </span>
      </td>
      <td className="p-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {canCheckIn && !esEnEspera && !esAtendiendo && !esTerminal && (
            <button
              type="button"
              onClick={() => onCheckIn(t)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
              title="Marcar llegada presencial"
            >
              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Presente</span>
            </button>
          )}
          {esEnEspera && onLlamar && (
            <button
              type="button"
              onClick={() => onLlamar(t)}
              className="inline-flex items-center gap-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 cursor-pointer"
              title="Llamar a consultorio"
            >
              <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Llamar</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenCopago(t)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground px-2 py-1.5 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            title="Verificar copago"
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>Copago</span>
          </button>
          {!esTerminal && (
            <button
              type="button"
              onClick={() => onMarcarAusente(t)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-muted text-slate-700 dark:text-slate-300 px-2 py-1.5 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
              title="Marcar paciente ausente"
              aria-label="Marcar paciente ausente"
            >
              <UserX className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
              <span className="hidden sm:inline">Ausente</span>
            </button>
          )}
          {!esCompletado && (
            <Link
              to={`/dashboard/recepcion/turnos/${t.id}/reagendar`}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground px-2 py-1.5 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              title="Reagendar turno"
              aria-label="Reagendar turno"
            >
              <CalendarClock className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
            </Link>
          )}
          {t.pacienteId && (
            <Link
              to={`/dashboard/recepcion/pacientes/${t.pacienteId}`}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground px-2 py-1.5 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              title="Ver ficha del paciente"
              aria-label="Ver ficha del paciente"
            >
              <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
            </Link>
          )}
          {canCancelar && !esTerminal && (
            <button
              type="button"
              onClick={() => onOpenCancelar(t)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 px-2 py-1.5 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer"
              title="Cancelar turno"
              aria-label="Cancelar turno"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
