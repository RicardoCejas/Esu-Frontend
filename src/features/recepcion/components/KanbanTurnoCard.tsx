import React from 'react';
import { ArrowRight, Flame, Volume2, CheckCircle2 } from 'lucide-react';
import type { Turno } from '@/types';
import { TiempoEsperaBadge } from './TiempoEsperaBadge';

interface KanbanTurnoCardProps {
  turno: Turno;
  columna: 'porLlegar' | 'enEspera' | 'enConsulta' | 'atendidos';
  onMoverAEnEspera?: (t: Turno) => void;
  onLlamar?: (t: Turno) => void;
  onFinalizar?: (t: Turno) => void;
}

export const KanbanTurnoCard: React.FC<KanbanTurnoCardProps> = ({
  turno,
  columna,
  onMoverAEnEspera,
  onLlamar,
  onFinalizar,
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
        <span className="font-mono font-bold text-xs text-sky-700">{turno.hora} hs</span>
        <div className="flex items-center gap-1.5">
          {turno.esSobreturno && (
            <span className="rounded-md bg-amber-500 text-white font-black px-2 py-0.5 text-[10px] tracking-wide flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Sobreturno
            </span>
          )}
          {turno.codigoVerificacion && (
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
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
        <span className="truncate max-w-[120px]">{turno.profesionalNombre}</span>
        <span className="font-medium text-foreground">Cons. {turno.consultorioNumero || 'S/N'}</span>
      </div>

      {/* Acciones según columna */}
      {columna === 'porLlegar' && onMoverAEnEspera && (
        <button
          type="button"
          onClick={() => onMoverAEnEspera(turno)}
          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs font-semibold shadow-2xs transition"
        >
          <span>Presente en Sala</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      )}

      {columna === 'enEspera' && (
        <div className="pt-1">
          <TiempoEsperaBadge
            horaCheckIn={turno.horaCheckIn}
            horaTurno={turno.hora}
            className="w-full justify-center"
          />
        </div>
      )}

      {columna === 'enEspera' && onLlamar && (
        <button
          type="button"
          onClick={() => onLlamar(turno)}
          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white py-1.5 text-xs font-semibold shadow-2xs transition"
        >
          <Volume2 className="h-3.5 w-3.5" />
          <span>Llamar a Consulta</span>
        </button>
      )}

      {columna === 'enConsulta' && onFinalizar && (
        <button
          type="button"
          onClick={() => onFinalizar(turno)}
          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-50 text-emerald-800 py-1.5 text-xs font-semibold transition"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Finalizar Atención</span>
        </button>
      )}
    </div>
  );
};
