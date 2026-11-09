import React from 'react';
import { Stethoscope, X, Edit2, Trash2, Save, Calendar, Clock, BadgeCheck } from 'lucide-react';
import type { Profesional, Especialidad } from '@/types';

interface MedicoFichaModalProps {
  medico: Profesional | null;
  modoEdicion: boolean;
  onCerrar: () => void;
  onEditar: () => void;
  onDesvincular: (m: Profesional) => void;
  onSubmit: (e: React.FormEvent) => void;
  editNombre: string;
  setEditNombre: (v: string) => void;
  editApellido: string;
  setEditApellido: (v: string) => void;
  editMatricula: string;
  setEditMatricula: (v: string) => void;
  editEspId: string;
  setEditEspId: (v: string) => void;
  editDias: string[];
  onToggleDia: (dia: string) => void;
  editDuracion: number;
  setEditDuracion: (v: number) => void;
  especialidades: Especialidad[];
  diasDisponibles: string[];
}

export const MedicoFichaModal: React.FC<MedicoFichaModalProps> = ({
  medico,
  modoEdicion,
  onCerrar,
  onEditar,
  onDesvincular,
  onSubmit,
  editNombre,
  setEditNombre,
  editApellido,
  setEditApellido,
  editMatricula,
  setEditMatricula,
  editEspId,
  setEditEspId,
  editDias,
  onToggleDia,
  editDuracion,
  setEditDuracion,
  especialidades,
  diasDisponibles,
}) => {
  if (!medico) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            <h3 className="font-bold text-sm">Ficha Profesional: Dr. {medico.nombre} {medico.apellido}</h3>
          </div>
          <button type="button" onClick={onCerrar} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {modoEdicion ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
                  <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full mt-1 p-2 rounded-xl border border-input text-xs" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Apellido</label>
                  <input type="text" value={editApellido} onChange={(e) => setEditApellido(e.target.value)} className="w-full mt-1 p-2 rounded-xl border border-input text-xs" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Matrícula</label>
                  <input type="text" value={editMatricula} onChange={(e) => setEditMatricula(e.target.value)} className="w-full mt-1 p-2 rounded-xl border border-input text-xs" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Especialidad</label>
                  <select value={editEspId} onChange={(e) => setEditEspId(e.target.value)} className="w-full mt-1 p-2 rounded-xl border border-input text-xs">
                    {especialidades.map((esp) => (
                      <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Días de Atención en el Centro</label>
                <div className="flex flex-wrap gap-2">
                  {diasDisponibles.map((dia) => (
                    <button type="button" key={dia} onClick={() => onToggleDia(dia)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${editDias.includes(dia) ? 'bg-sky-600 text-white border-sky-600' : 'bg-muted/40 text-muted-foreground border-border'}`}>
                      {dia}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Duración de Turno (Minutos)</label>
                <input type="number" min={10} max={60} step={5} value={editDuracion} onChange={(e) => setEditDuracion(Number(e.target.value))} className="w-full mt-1 p-2 rounded-xl border border-input text-xs" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
                <BadgeCheck className="h-4 w-4" />
                <span>Matrícula Provincial: {medico.matricula}</span>
              </div>
              <p><span className="font-semibold text-muted-foreground">Especialidad:</span> {medico.especialidadNombre}</p>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-semibold">Días:</span> {medico.diasAtencion?.join(', ') || 'Sin configurar'}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="font-semibold">Slot:</span> {medico.duracionTurnoMin ?? 20} min</div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button type="button" onClick={() => onDesvincular(medico)} className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-semibold">
              <Trash2 className="h-4 w-4" />
              Desvincular del Centro
            </button>
            <div className="flex items-center gap-2">
              {modoEdicion ? (
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold text-xs shadow-xs hover:bg-sky-700 transition">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              ) : (
                <button type="button" onClick={onEditar} className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold text-xs shadow-xs hover:bg-sky-700 transition">
                  <Edit2 className="h-4 w-4" />
                  Editar Datos
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
