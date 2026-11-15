import React from 'react';
import { Microscope, Stethoscope } from 'lucide-react';
import { ESTUDIOS_DIAGNOSTICOS_CATALOGO } from '@/lib/centroUtils';
import type { SedeFormErrors, SedeFormValues } from '../hooks/useEditarSede';

interface SedeServiciosSectionProps {
  values: SedeFormValues;
  errors: SedeFormErrors;
  onChangeField: <K extends keyof SedeFormValues>(field: K, value: SedeFormValues[K]) => void;
  onToggleEstudio: (estudio: string) => void;
}

export const SedeServiciosSection: React.FC<SedeServiciosSectionProps> = ({
  values,
  errors,
  onChangeField,
  onToggleEstudio,
}) => {
  const opcionesEstudios = Array.from(
    new Set([...ESTUDIOS_DIAGNOSTICOS_CATALOGO, ...values.estudiosDisponibles])
  );

  return (
    <fieldset className="space-y-4">
      <legend className="flex items-center gap-2 text-base font-bold text-foreground border-b border-border pb-2 w-full">
        <Stethoscope className="h-4 w-4 text-sky-700" aria-hidden="true" />
        Servicios y Modalidades Habilitadas
      </legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
        <label className="flex items-start gap-2.5 rounded-lg border border-border bg-background p-3 cursor-pointer hover:bg-muted/40 transition">
          <input
            type="checkbox"
            checked={values.disponibleGuardia}
            onChange={(e) => onChangeField('disponibleGuardia', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-600"
          />
          <span>
            <span className="block text-xs font-bold text-foreground">Guardia 24 hs</span>
            <span className="block text-[11px] text-muted-foreground">Atención continua de urgencias</span>
          </span>
        </label>

        <label className="flex items-start gap-2.5 rounded-lg border border-border bg-background p-3 cursor-pointer hover:bg-muted/40 transition">
          <input
            type="checkbox"
            checked={values.permiteConsultas}
            onChange={(e) => onChangeField('permiteConsultas', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-600"
          />
          <span>
            <span className="block text-xs font-bold text-foreground">Consultas Externas</span>
            <span className="block text-[11px] text-muted-foreground">Turnos programados con especialistas</span>
          </span>
        </label>

        <label className="flex items-start gap-2.5 rounded-lg border border-border bg-background p-3 cursor-pointer hover:bg-muted/40 transition">
          <input
            type="checkbox"
            checked={values.permiteEstudios}
            onChange={(e) => onChangeField('permiteEstudios', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-600"
          />
          <span>
            <span className="block text-xs font-bold text-foreground">Estudios Diagnósticos</span>
            <span className="block text-[11px] text-muted-foreground">Laboratorio e imágenes médicas</span>
          </span>
        </label>
      </div>

      {values.permiteEstudios ? (
        <fieldset
          aria-describedby={errors.estudiosDisponibles ? 'sede-estudios-error' : 'sede-estudios-help'}
          className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
        >
          <legend className="flex items-center gap-1.5 px-1 text-xs font-bold text-foreground">
            <Microscope className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
            Estudios Diagnósticos Habilitados en Sede
          </legend>
          <p id="sede-estudios-help" className="text-xs text-muted-foreground">
            Seleccioná las prácticas diagnósticas disponibles en este efector. Solo los estudios tildados podrán solicitarse desde el turnero.
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {opcionesEstudios.map((estudio) => {
              const checked = values.estudiosDisponibles.includes(estudio);
              return (
                <label
                  key={estudio}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-semibold cursor-pointer transition ${
                    checked
                      ? 'border-sky-700 bg-background text-foreground ring-1 ring-sky-700'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEstudio(estudio)}
                    className="h-4 w-4 rounded border-border text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-600"
                  />
                  <span>{estudio}</span>
                </label>
              );
            })}
          </div>

          {errors.estudiosDisponibles && (
            <p id="sede-estudios-error" className="text-xs font-medium text-rose-700">
              {errors.estudiosDisponibles}
            </p>
          )}
        </fieldset>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          La sede está configurada solo para consultas médicas. Activá &quot;Estudios Diagnósticos&quot; para habilitar prácticas de laboratorio o imágenes.
        </p>
      )}
    </fieldset>
  );
};
