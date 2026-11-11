import React from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LocateFixed, MapPin } from 'lucide-react';
import { useCenterMapPicker } from './useCenterMapPicker';

export interface CenterMapPickerProps {
  latitud?: number;
  longitud?: number;
  centerName?: string;
  onChangeCoords?: (lat: number, lng: number) => void;
  heightClass?: string;
  readOnly?: boolean;
}

export const CenterMapPicker: React.FC<CenterMapPickerProps> = ({
  latitud,
  longitud,
  centerName,
  onChangeCoords,
  heightClass = 'h-72',
  readOnly = false,
}) => {
  const { containerRef, mapError, handleCenterCity } = useCenterMapPicker({
    latitud,
    longitud,
    readOnly,
    onChangeCoords,
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <MapPin className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
          <span>
            {readOnly
              ? `Ubicación registrada${centerName ? `: ${centerName}` : ''}`
              : 'Hacé clic en el mapa o arrastrá el pin para marcar la sede'}
          </span>
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={handleCenterCity}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <LocateFixed className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
            <span>Centrar en Cruz del Eje</span>
          </button>
        )}
      </div>

      {mapError ? (
        <div
          className={`flex items-center justify-center rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground ${heightClass}`}
        >
          No se pudo inicializar la vista de mapa interactivo en este navegador. Podés ingresar latitud y longitud manualmente.
        </div>
      ) : (
        <div
          ref={containerRef}
          role="region"
          aria-label={`Mapa de ubicación de ${centerName || 'la sede'}`}
          className={`w-full rounded-xl border border-border overflow-hidden bg-muted/20 ${heightClass}`}
        />
      )}
    </div>
  );
};
