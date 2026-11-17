import React from 'react';
import { MapPin } from 'lucide-react';
import { CenterMapPicker } from '@/components/maps/CenterMapPicker';
import { parseCoordinatePair } from '@/lib/centroUtils';
import type { SedeFormErrors, SedeFormValues } from '../hooks/useEditarSede';

interface SedeUbicacionSectionProps {
  values: SedeFormValues;
  errors: SedeFormErrors;
  onChangeField: <K extends keyof SedeFormValues>(field: K, value: SedeFormValues[K]) => void;
  onBlurField: (field: keyof SedeFormValues) => void;
  onPickMapCoords: (lat: number, lng: number) => void;
}

export const SedeUbicacionSection: React.FC<SedeUbicacionSectionProps> = ({
  values,
  errors,
  onChangeField,
  onBlurField,
  onPickMapCoords,
}) => {
  const coords = parseCoordinatePair(values.latitud, values.longitud);

  return (
    <fieldset className="space-y-4">
      <legend className="flex items-center gap-2 text-base font-bold text-foreground border-b border-border pb-2 w-full">
        <MapPin className="h-4 w-4 text-sky-700" aria-hidden="true" />
        Geolocalización en Mapa Interactivo
      </legend>

      <p className="text-xs text-muted-foreground">
        Marcá la ubicación exacta de la sede haciendo clic en el mapa o arrastrando el marcador. Las coordenadas se reflejan en el Mapa Sanitario público.
      </p>

      <CenterMapPicker
        latitud={coords?.lat}
        longitud={coords?.lng}
        centerName={values.nombre}
        onChangeCoords={onPickMapCoords}
        heightClass="h-72"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sede-latitud" className="block text-xs font-semibold text-foreground mb-1.5">
            Latitud (ej. -30.7267)
          </label>
          <input
            id="sede-latitud"
            type="text"
            inputMode="decimal"
            value={values.latitud}
            onChange={(e) => onChangeField('latitud', e.target.value)}
            onBlur={() => onBlurField('latitud')}
            aria-invalid={Boolean(errors.latitud)}
            aria-describedby={errors.latitud ? 'sede-latitud-error' : undefined}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          />
          {errors.latitud && (
            <p id="sede-latitud-error" className="mt-1 text-xs font-medium text-rose-700">
              {errors.latitud}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sede-longitud" className="block text-xs font-semibold text-foreground mb-1.5">
            Longitud (ej. -64.8039)
          </label>
          <input
            id="sede-longitud"
            type="text"
            inputMode="decimal"
            value={values.longitud}
            onChange={(e) => onChangeField('longitud', e.target.value)}
            onBlur={() => onBlurField('longitud')}
            aria-invalid={Boolean(errors.longitud)}
            aria-describedby={errors.longitud ? 'sede-longitud-error' : undefined}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          />
          {errors.longitud && (
            <p id="sede-longitud-error" className="mt-1 text-xs font-medium text-rose-700">
              {errors.longitud}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
