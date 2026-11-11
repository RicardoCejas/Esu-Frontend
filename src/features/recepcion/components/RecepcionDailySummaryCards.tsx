import React from 'react';
import { Clock, Activity, UserCheck, Users } from 'lucide-react';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Programados */}
      <div className="rounded-xl border border-border/70 bg-card p-4 transition hover:border-border">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Hoy
          </span>
          <Clock className="h-4 w-4 text-muted-foreground/70" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            {kpis.total}
          </span>
          <span className="text-[11px] text-muted-foreground">turnos</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Programados para esta fecha</p>
      </div>

      {/* 2. En Sala de Espera (Métrica Clave del Mostrador) */}
      <div className="rounded-xl border border-border/70 bg-card p-4 transition hover:border-border">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            En Sala de Espera
          </span>
          <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            {kpis.enSalaDeEspera}
          </span>
          <span className="text-[11px] text-muted-foreground">pacientes</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Listos para ser llamados</p>
      </div>

      {/* 3. En Consultorio */}
      <div className="rounded-xl border border-border/70 bg-card p-4 transition hover:border-border">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            En Consultorio
          </span>
          <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            {kpis.enConsulta}
          </span>
          <span className="text-[11px] text-muted-foreground">en curso</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Atención médica activa</p>
      </div>

      {/* 4. Atendidos / Salida */}
      <div className="rounded-xl border border-border/70 bg-card p-4 transition hover:border-border">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Completados
          </span>
          <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            {kpis.atendidosHoy}
          </span>
          <span className="text-[11px] text-muted-foreground">egresos</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Consultas finalizadas</p>
      </div>
    </div>
  );
};
