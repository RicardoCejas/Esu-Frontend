import React from 'react';
import { Maximize2 } from 'lucide-react';
import { type CentroMapaPin } from '../mapaCentrosData';

interface MapaCentroPillsProps {
  centros: CentroMapaPin[];
  selectedId?: string;
  onResetCamera: () => void;
  onSelectCentro: (centro: CentroMapaPin) => void;
}

export const MapaCentroPills: React.FC<MapaCentroPillsProps> = ({
  centros,
  selectedId,
  onResetCamera,
  onSelectCentro,
}) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
    <button
      type="button"
      onClick={onResetCamera}
      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] transition cursor-pointer shadow-xs"
    >
      <Maximize2 className="h-3.5 w-3.5 text-[#0284C7]" aria-hidden="true" />
      <span>Ver toda la ciudad</span>
    </button>

    {centros.map((centro) => {
      const isSelected = selectedId === centro.id;
      return (
        <button
          key={centro.id}
          type="button"
          aria-pressed={isSelected}
          onClick={() => onSelectCentro(centro)}
          className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
            isSelected
              ? 'bg-[#0284C7] text-white border-[#0369A1] shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              centro.esGuardia ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          <span>{centro.nombreCorto}</span>
        </button>
      );
    })}
  </div>
);
