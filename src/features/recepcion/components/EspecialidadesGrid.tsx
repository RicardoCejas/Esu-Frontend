import React from 'react';
import { Layers, Users, ChevronRight } from 'lucide-react';
import type { Especialidad, Profesional } from '@/types';

interface EspecialidadesGridProps {
  especialidades: Especialidad[];
  getMedicosPorEspecialidad: (espId: string) => Profesional[];
  onSeleccionar: (esp: Especialidad) => void;
}

export const EspecialidadesGrid: React.FC<EspecialidadesGridProps> = ({
  especialidades,
  getMedicosPorEspecialidad,
  onSeleccionar,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {especialidades.map((esp) => {
        const medicosAsignados = getMedicosPorEspecialidad(esp.id);

        return (
          <div
            key={esp.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 hover:border-sky-500/50 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-50 text-sky-700 rounded-xl">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{esp.nombre}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{medicosAsignados.length} médicos activos</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {esp.descripcion || 'Servicio asistencial especializado de Cruz del Eje.'}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                Habilitada en sede
              </span>
              <button
                onClick={() => onSeleccionar(esp)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                <span>Ver Médicos</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {especialidades.length === 0 && (
        <div className="col-span-full border border-dashed border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
          No se encontraron especialidades activas.
        </div>
      )}
    </div>
  );
};
