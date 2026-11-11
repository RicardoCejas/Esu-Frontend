import React from 'react';
import { Clock } from 'lucide-react';
import { RecepcionTurnoRow } from './RecepcionTurnoRow';
import type { Turno } from '@/types';

interface RecepcionTurnosTableProps {
  turnos: Turno[];
  loading: boolean;
  mostrarFecha?: boolean;
  canCheckIn?: boolean;
  canCancelar?: boolean;
  onCheckIn: (turno: Turno) => void;
  onMarcarAusente: (turno: Turno) => void;
  onLlamar?: (turno: Turno) => void;
  onOpenCopago: (turno: Turno) => void;
  onOpenCancelar: (turno: Turno) => void;
}

export const RecepcionTurnosTable: React.FC<RecepcionTurnosTableProps> = ({
  turnos,
  loading,
  mostrarFecha = false,
  canCheckIn = true,
  canCancelar = true,
  onCheckIn,
  onMarcarAusente,
  onLlamar,
  onOpenCopago,
  onOpenCancelar,
}) => {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <div className="rounded-b-xl border border-border border-t-0 bg-card p-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
        <h3 className="text-sm font-bold text-foreground">No se encontraron turnos para los filtros seleccionados</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Intente modificar la búsqueda por DNI o restablezca los filtros de profesional.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-b-xl border border-border border-t-0 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">{mostrarFecha ? 'Fecha y Hora' : 'Hora'}</th>
              <th className="p-3.5">Paciente / DNI</th>
              <th className="p-3.5">Cobertura & Copago</th>
              <th className="p-3.5">Médico / Especialidad</th>
              <th className="p-3.5">Consultorio / Sede</th>
              <th className="p-3.5 text-center">Estado</th>
              <th className="p-3.5 text-right">Acciones de Ventanilla</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {turnos.map((t) => (
              <RecepcionTurnoRow
                key={t.id}
                turno={t}
                mostrarFecha={mostrarFecha}
                canCheckIn={canCheckIn}
                canCancelar={canCancelar}
                onCheckIn={onCheckIn}
                onMarcarAusente={onMarcarAusente}
                onLlamar={onLlamar}
                onOpenCopago={onOpenCopago}
                onOpenCancelar={onOpenCancelar}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
