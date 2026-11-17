import React from 'react';
import { ArrowRight, Flame, Volume2, CheckCircle2, UserX, XCircle } from 'lucide-react';
import type { Turno } from '@/types';
import { TiempoEsperaBadge } from './TiempoEsperaBadge';

interface KanbanTurnoCardProps {
  turno: Turno;
  columna: 'porLlegar' | 'enEspera' | 'enConsulta' | 'atendidos';
  onMoverAEnEspera?: (t: Turno) => void;
  onLlamar?: (t: Turno) => void;
  onFinalizar?: (t: Turno) => void;
  onMarcarAusente?: (t: Turno) => void;
  onCancelar?: (t: Turno) => void;
}

export const KanbanTurnoCard: React.FC<KanbanTurnoCardProps> = ({
  turno,
  columna,
  onMoverAEnEspera,
  onLlamar,
  onFinalizar,
  onMarcarAusente,
  onCancelar,
}) => {
  return (
    <div
      className={`rounded-xl border p-3 shadow-xs space-y-2 transition ${
        turno.esSobreturno
          ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20'
          : 'border-border bg-card hover:border-sky-500/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="tabular-nums font-bold text-xs text-sky-700 dark:text-sky-400">{turno.hora} hs</span>
        <div className="flex items-center gap-1.5">
          {turno.esSobreturno && (
            <span className="rounded-md bg-amber-600 text-white font-black px-2 py-0.5 text-[10px] tracking-wide flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Sobreturno
            </span>
          )}
          {turno.codigoVerificacion && (
            <span className="tabular-nums text-[10px] text-white bg-slate-700 px-1.5 py-0.5 rounded-sm font-semibold">
              {turno.codigoVerificacion}
            </span>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-xs text-foreground truncate">{turno.pacienteNombre}</h4>
        <p className="text-[11px] text-muted-foreground">DNI: {turno.pacienteDni}</p>
      </div>

      <div className="text-[11px] text-muted-foreground border-t border-border pt-1.5 flex items-center justify-between">
        <span className="truncate max-w-[110px]" title={turno.profesionalNombre}>{turno.profesionalNombre}</span>
        <span className="font-semibold text-foreground">
          Cons. {turno.consultorioNumero || 'S/N'}
          {turno.planta ? ` (${turno.planta})` : ''}
        </span>
      </div>

      {/* Por llegar */}
      {columna === 'porLlegar' && (
        <div className="space-y-1.5 pt-1">
          {onMoverAEnEspera && (
            <button
              type="button"
              onClick={() => onMoverAEnEspera(turno)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <span>Presente en Sala</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            {onMarcarAusente && (
              <button
                type="button"
                onClick={() => onMarcarAusente(turno)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 dark:border-slate-700 bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 py-1 text-[11px] font-medium transition cursor-pointer"
                title="Marcar como ausente"
              >
                <UserX className="h-3 w-3 text-slate-500" />
                <span>Ausente</span>
              </button>
            )}
            {onCancelar && (
              <button
                type="button"
                onClick={() => onCancelar(turno)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-rose-300 dark:border-rose-800 bg-background hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 py-1 text-[11px] font-medium transition cursor-pointer"
                title="Cancelar turno"
              >
                <XCircle className="h-3 w-3 text-rose-500" />
                <span>Cancelar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* En espera */}
      {columna === 'enEspera' && (
        <div className="space-y-1.5 pt-1">
          <TiempoEsperaBadge
            horaCheckIn={turno.horaCheckIn}
            horaTurno={turno.hora}
            className="w-full justify-center"
          />
          {onLlamar && (
            <button
              type="button"
              onClick={() => onLlamar(turno)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Llamar a Consulta</span>
            </button>
          )}
          <div className="flex items-center gap-1.5">
            {onMarcarAusente && (
              <button
                type="button"
                onClick={() => onMarcarAusente(turno)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 dark:border-slate-700 bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 py-1 text-[11px] font-medium transition cursor-pointer"
              >
                <UserX className="h-3 w-3 text-slate-500" />
                <span>Ausente</span>
              </button>
            )}
            {onCancelar && (
              <button
                type="button"
                onClick={() => onCancelar(turno)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-rose-300 dark:border-rose-800 bg-background hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 py-1 text-[11px] font-medium transition cursor-pointer"
              >
                <XCircle className="h-3 w-3 text-rose-500" />
                <span>Cancelar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* En consulta */}
      {columna === 'enConsulta' && (
        <div className="space-y-1.5 pt-1">
          {onLlamar && (
            <button
              type="button"
              onClick={() => onLlamar(turno)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-400 bg-background hover:bg-sky-50 dark:hover:bg-sky-950/30 text-sky-700 dark:text-sky-300 py-1 text-xs font-semibold transition cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Re-llamar por Voz</span>
            </button>
          )}
          {onFinalizar && (
            <button
              type="button"
              onClick={() => onFinalizar(turno)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Finalizar Atención</span>
            </button>
          )}
        </div>
      )}

      {/* Atendidos */}
      {columna === 'atendidos' && (
        <div className="pt-1 flex items-center justify-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
            <CheckCircle2 className="h-3 w-3" />
            Atención Completada
          </span>
        </div>
      )}
    </div>
  );
};
