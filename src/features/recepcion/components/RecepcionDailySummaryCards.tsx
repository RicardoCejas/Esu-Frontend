import React from 'react';
import { Clock, Activity, UserCheck } from 'lucide-react';

interface RecepcionDailySummaryCardsProps {
  kpis: {
    total: number;
    enSalaDeEspera: number;
    enConsulta: number;
    atendidosHoy: number;
  };
}

export const RecepcionDailySummaryCards: React.FC<RecepcionDailySummaryCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Total Turnos Hoy</span>
          <Clock className="h-4 w-4 text-sky-600" />
        </div>
        <div className="text-2xl font-black text-foreground mt-1">{kpis.total}</div>
        <p className="text-[11px] text-muted-foreground">Programados para esta fecha</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">En Sala de Espera</span>
          <Clock className="h-4 w-4 text-amber-600" />
        </div>
        <div className="text-2xl font-black text-amber-600 mt-1">{kpis.enSalaDeEspera}</div>
        <p className="text-[11px] text-muted-foreground">Acreditados listos para llamado</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">En Consultorio</span>
          <Activity className="h-4 w-4 text-sky-600" />
        </div>
        <div className="text-2xl font-black text-sky-600 mt-1">{kpis.enConsulta}</div>
        <p className="text-[11px] text-muted-foreground">Atención médica en curso</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold">Atendidos / Salida</span>
          <UserCheck className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-black text-emerald-600 mt-1">{kpis.atendidosHoy}</div>
        <p className="text-[11px] text-muted-foreground">Consultas completadas hoy</p>
      </div>
    </div>
  );
};
