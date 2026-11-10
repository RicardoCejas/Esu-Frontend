import React from 'react';
import {
  Heart,
  Baby,
  Stethoscope,
  Eye,
  Smile,
  Activity,
  Brain,
  Users,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { Especialidad, Profesional } from '@/types';

interface EspecialidadesGridProps {
  especialidades: Especialidad[];
  getMedicosPorEspecialidad: (espId: string) => Profesional[];
  onSeleccionar: (esp: Especialidad) => void;
}

const getSpecialtyIcon = (nombre: string): LucideIcon => {
  const n = nombre.toLowerCase();
  if (n.includes('cardio')) return Heart;
  if (n.includes('pedia')) return Baby;
  if (n.includes('oftalmo') || n.includes('ojo')) return Eye;
  if (n.includes('odonto') || n.includes('dental')) return Smile;
  if (n.includes('neuro') || n.includes('psiqu') || n.includes('psico')) return Brain;
  if (n.includes('trauma') || n.includes('kine')) return Activity;
  return Stethoscope;
};

export const EspecialidadesGrid: React.FC<EspecialidadesGridProps> = ({
  especialidades,
  getMedicosPorEspecialidad,
  onSeleccionar,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {especialidades.map((esp) => {
        const medicosAsignados = getMedicosPorEspecialidad(esp.id);
        const IconComponent = getSpecialtyIcon(esp.nombre);

        return (
          <div
            key={esp.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 hover:border-primary/50 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary">
                    <IconComponent className="h-4 w-4" />
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
              <span className="text-[10px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded shadow-xs">
                Habilitada en sede
              </span>
              <button
                type="button"
                onClick={() => onSeleccionar(esp)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
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
