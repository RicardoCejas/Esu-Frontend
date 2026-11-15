import React from 'react';
import { Building2 } from 'lucide-react';

interface ConsultorioFloorSelectorProps {
  floorOptions: string[];
  selectedFloor: string;
  onSelectFloor: (floor: string) => void;
}

export const ConsultorioFloorSelector: React.FC<ConsultorioFloorSelectorProps> = ({
  floorOptions,
  selectedFloor,
  onSelectFloor,
}) => (
  <fieldset className="space-y-2.5">
    <legend className="text-xs font-semibold text-foreground">
      Ubicación Física / Planta <span className="text-rose-700">*</span>
    </legend>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {floorOptions.map((floor) => {
        const selected = selectedFloor === floor;
        return (
          <label
            key={floor}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold cursor-pointer transition focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-1 ${
              selected
                ? 'border-sky-700 bg-sky-700 text-white'
                : 'border-border bg-background text-foreground hover:bg-muted/50'
            }`}
          >
            <input
              type="radio"
              name="consultorio-planta"
              value={floor}
              checked={selected}
              onChange={() => onSelectFloor(floor)}
              className="sr-only"
            />
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{floor}</span>
          </label>
        );
      })}
    </div>
    {floorOptions.length === 1 && (
      <p className="text-[11px] text-muted-foreground">
        La sede tiene configurada 1 planta física. Podés habilitar más pisos desde Editar Datos de Sede.
      </p>
    )}
  </fieldset>
);
