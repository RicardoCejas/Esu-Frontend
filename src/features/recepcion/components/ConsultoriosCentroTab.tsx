import React, { useState } from 'react';
import { DoorOpen, Plus, Trash2 } from 'lucide-react';
import type { ConsultorioItem } from '@/api/centrosService';

interface ConsultoriosCentroTabProps {
  consultorios: ConsultorioItem[];
  onCrear: (data: { numero: string; planta: string; especialidadAsignada?: string }) => void;
  onEliminar: (c: ConsultorioItem) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const ConsultoriosCentroTab: React.FC<ConsultoriosCentroTabProps> = ({
  consultorios,
  onCrear,
  onEliminar,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [numero, setNumero] = useState('');
  const [planta, setPlanta] = useState('Planta Baja');
  const [especialidad, setEspecialidad] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) return;
    onCrear({ numero, planta, especialidadAsignada: especialidad });
    setNumero('');
    setEspecialidad('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Consultorios Físicos de la Sede</h3>
          <p className="text-xs text-muted-foreground">Infraestructura habilitada para atención presencial y guardias.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nuevo Consultorio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {consultorios.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl">
                <DoorOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Consultorio {c.numero}</h4>
                <p className="text-xs text-muted-foreground">{c.planta}</p>
                {c.especialidadAsignada && (
                  <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {c.especialidadAsignada}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onEliminar(c)}
              className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              title="Dar de baja consultorio"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {consultorios.length === 0 && (
          <div className="col-span-full border border-dashed border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
            No hay consultorios registrados para esta sede médica.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-foreground">Registrar Consultorio Físico</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Número / Identificador</label>
                <input type="text" placeholder="Ej: 104 o Sala A" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full mt-1 p-2 rounded-xl border border-input text-xs" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Planta / Piso</label>
                <select value={planta} onChange={(e) => setPlanta(e.target.value)} className="w-full mt-1 p-2 rounded-xl border border-input text-xs">
                  <option value="Planta Baja">Planta Baja</option>
                  <option value="1° Piso">1° Piso</option>
                  <option value="2° Piso">2° Piso</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Especialidad Preferencial (Opcional)</label>
                <input type="text" placeholder="Ej: Pediatría" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="w-full mt-1 p-2 rounded-xl border border-input text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
