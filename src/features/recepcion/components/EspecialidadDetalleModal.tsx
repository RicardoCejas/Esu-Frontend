import React from 'react';
import { Layers, X, Stethoscope, Trash2 } from 'lucide-react';
import type { Especialidad, Profesional } from '@/types';

interface EspecialidadDetalleModalProps {
  especialidad: Especialidad | null;
  medicos: Profesional[];
  onCerrar: () => void;
  onDesvincularMedico: (prof: Profesional) => void;
}

export const EspecialidadDetalleModal: React.FC<EspecialidadDetalleModalProps> = ({
  especialidad,
  medicos,
  onCerrar,
  onDesvincularMedico,
}) => {
  if (!especialidad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            <h3 className="font-bold text-sm">Especialidad: {especialidad.nombre}</h3>
          </div>
          <button type="button" onClick={onCerrar} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Descripción Asistencial</h4>
            <p className="mt-1 text-foreground leading-relaxed">{especialidad.descripcion || 'Sin descripción adicional.'}</p>
          </div>

          <div className="pt-2">
            <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
              Médicos Asignados en esta Sede ({medicos.length})
            </h4>

            <div className="space-y-2">
              {medicos.map((m) => (
                <div key={m.id} className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Stethoscope className="h-4 w-4 text-sky-600" />
                    <div>
                      <p className="font-bold text-foreground">Dr. {m.nombre} {m.apellido}</p>
                      <p className="text-[11px] text-muted-foreground">Matrícula: {m.matricula}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDesvincularMedico(m)}
                    className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-lg transition"
                    title="Desvincular médico de la sede"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {medicos.length === 0 && (
                <p className="italic text-muted-foreground py-2">No hay médicos de esta especialidad asignados a esta sede.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-sky-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
