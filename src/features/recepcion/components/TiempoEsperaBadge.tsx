import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTiempoEspera } from '../hooks/useTiempoEsperaQueue';

export interface TiempoEsperaBadgeProps {
  horaCheckIn?: string;
  horaTurno?: string;
  className?: string;
}

export const TiempoEsperaBadge: React.FC<TiempoEsperaBadgeProps> = ({
  horaCheckIn,
  horaTurno,
  className = '',
}) => {
  const { semaforo, formato, esCritico } = useTiempoEspera(horaCheckIn, horaTurno);

  const ariaLabel = `Tiempo de espera: ${formato}, ${semaforo.label}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold border transition ${semaforo.badgeClass} ${className}`}
      title={ariaLabel}
      aria-label={ariaLabel}
    >
      {esCritico ? (
        <AlertTriangle className="h-3 w-3 shrink-0 animate-pulse text-rose-600 dark:text-rose-400" />
      ) : (
        <Clock className="h-3 w-3 shrink-0 opacity-80" />
      )}
      <span>{formato}</span>
      <span className="text-[10px] opacity-75 font-normal">({semaforo.label})</span>
    </div>
  );
};
