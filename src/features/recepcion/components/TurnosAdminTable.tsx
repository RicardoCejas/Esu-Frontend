import React from 'react';
import type { Turno } from '@/types';
import { Calendar } from 'lucide-react';
import { TurnoAdminRow } from './TurnoAdminRow';

export interface TurnosAdminTableProps {
  turnos: Turno[];
  isLoading: boolean;
  isProcessing: boolean;
  onCancelar: (t: Turno) => void;
  onCheckIn?: (t: Turno) => void;
  onMarcarAusente?: (t: Turno) => void;
  canCancelar?: boolean;
  canReagendar?: boolean;
  canCheckIn?: boolean;
}

export const TurnosAdminTable: React.FC<TurnosAdminTableProps> = ({
  turnos,
  isLoading,
  isProcessing,
  onCancelar,
  onCheckIn = () => {},
  onMarcarAusente = () => {},
  canCancelar = true,
  canReagendar = true,
  canCheckIn = true,
}) => {
  return (
    <div className="rounded-b-xl border border-border border-t-0 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" aria-label="Listado administrativo de turnos">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr>
              <th scope="col" className="p-3.5">Fecha & Hora</th>
              <th scope="col" className="p-3.5">Código</th>
              <th scope="col" className="p-3.5">Paciente & DNI</th>
              <th scope="col" className="p-3.5">Profesional</th>
              <th scope="col" className="p-3.5">Consultorio / Centro</th>
              <th scope="col" className="p-3.5">Estado</th>
              <th scope="col" className="p-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-700 border-t-transparent" />
                    <span>Cargando turnos de la sede...</span>
                  </div>
                </td>
              </tr>
            ) : turnos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">
                      No se encontraron turnos registrados
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      No hay citas médicas que coincidan con la búsqueda o el rango de fechas seleccionado.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              turnos.map((t) => (
                <TurnoAdminRow
                  key={t.id}
                  turno={t}
                  isProcessing={isProcessing}
                  canCancelar={canCancelar}
                  canReagendar={canReagendar}
                  canCheckIn={canCheckIn}
                  onCancelar={onCancelar}
                  onCheckIn={onCheckIn}
                  onMarcarAusente={onMarcarAusente}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
