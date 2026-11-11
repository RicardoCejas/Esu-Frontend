import React, { useMemo, useState } from 'react';
import { Search, Stethoscope, UserPlus, X } from 'lucide-react';
import type { Profesional } from '@/types';

interface ModalVincularMedicoProps {
  isOpen: boolean;
  onClose: () => void;
  medicosDisponibles: Profesional[];
  onVincular: (profesionalId: string) => Promise<boolean>;
  centroNombre: string;
}

export const ModalVincularMedico: React.FC<ModalVincularMedicoProps> = ({
  isOpen,
  onClose,
  medicosDisponibles,
  onVincular,
  centroNombre,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [vincularId, setVincularId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return medicosDisponibles;
    return medicosDisponibles.filter((m) => {
      const target = `${m.nombre} ${m.apellido} ${m.especialidadNombre} ${m.matricula}`.toLowerCase();
      return target.includes(q);
    });
  }, [medicosDisponibles, busqueda]);

  if (!isOpen) return null;

  const handleVincularClick = async (id: string) => {
    setVincularId(id);
    const ok = await onVincular(id);
    setVincularId(null);
    if (ok) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-vincular-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 id="modal-vincular-titulo" className="text-base font-bold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>Vincular Médico Existente a la Sede</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Incorporá un profesional registrado en la red a <strong>{centroNombre}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            aria-label="Buscar médico por nombre o matrícula"
            placeholder="Buscar por nombre, especialidad o matrícula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input text-xs bg-background focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[300px]">
          {filtrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              <Stethoscope className="h-8 w-8 mx-auto mb-1.5 opacity-30" aria-hidden="true" />
              <p>No se encontraron médicos disponibles para vincular con este criterio.</p>
            </div>
          ) : (
            filtrados.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background hover:border-sky-500/40 transition text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">
                    Dr./Dra. {m.nombre} {m.apellido}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {m.especialidadNombre || 'Medicina General'} · Matrícula:{' '}
                    <span className="font-semibold text-foreground tabular-nums">{m.matricula}</span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={vincularId === m.id}
                  onClick={() => handleVincularClick(m.id)}
                  className="rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer shrink-0"
                >
                  {vincularId === m.id ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
