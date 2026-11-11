import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Save } from 'lucide-react';
import type { Especialidad } from '@/types';
import type { ConsultorioFormErrors, ConsultorioFormValues } from '../utils/consultorioFormTypes';
import { ConsultorioFloorSelector } from './ConsultorioFloorSelector';

export type { ConsultorioFormErrors, ConsultorioFormValues };

interface ConsultorioFormFieldsProps {
  values: ConsultorioFormValues;
  errors: ConsultorioFormErrors;
  especialidades: Especialidad[];
  floorOptions: string[];
  existingCount: number;
  submitError: string | null;
  saving: boolean;
  submitLabel: string;
  savingLabel: string;
  submitIcon?: React.ReactNode;
  onChangeField: <K extends keyof ConsultorioFormValues>(field: K, value: ConsultorioFormValues[K]) => void;
  onBlurNumero: () => void;
  onSubmit: () => Promise<boolean>;
}

export const ConsultorioFormFields: React.FC<ConsultorioFormFieldsProps> = ({
  values, errors, especialidades, floorOptions, existingCount, submitError, saving,
  submitLabel, savingLabel, submitIcon, onChangeField, onBlurNumero, onSubmit,
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await onSubmit();
    if (!ok) {
      window.requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
    }
  };

  return (
    <form ref={formRef} noValidate onSubmit={onFormSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs">
      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="consultorio-numero" className="block text-xs font-semibold text-foreground mb-1.5">
            Número / Código de Consultorio <span className="text-rose-700">*</span>
          </label>
          <input
            id="consultorio-numero"
            type="text"
            required
            placeholder="Ej: 104, Box A, Guardia 1"
            value={values.numero}
            onChange={(e) => onChangeField('numero', e.target.value)}
            onBlur={onBlurNumero}
            aria-invalid={Boolean(errors.numero)}
            aria-describedby={errors.numero ? 'consultorio-numero-error' : 'consultorio-numero-help'}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          />
          {errors.numero ? (
            <p id="consultorio-numero-error" className="mt-1 text-xs font-medium text-rose-700">{errors.numero}</p>
          ) : (
            <p id="consultorio-numero-help" className="mt-1 text-[11px] text-muted-foreground">
              Actualmente hay {existingCount} consultorio(s) cargados en la sede.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="consultorio-especialidad" className="block text-xs font-semibold text-foreground mb-1.5">
            Especialidad Predominante
          </label>
          <select
            id="consultorio-especialidad"
            value={values.especialidadAsignada}
            onChange={(e) => onChangeField('especialidadAsignada', e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <option value="">Uso General / Polivalente</option>
            {especialidades.map((esp) => (
              <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Permite filtrar rápidamente el tablero Kanban y los boxes disponibles.
          </p>
        </div>
      </div>

      <ConsultorioFloorSelector floorOptions={floorOptions} selectedFloor={values.planta} onSelectFloor={(floor) => onChangeField('planta', floor)} />

      <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/20 p-3.5 cursor-pointer">
        <input
          type="checkbox"
          checked={values.activo}
          onChange={(e) => onChangeField('activo', e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-600"
        />
        <span>
          <span className="block text-xs font-bold text-foreground">Consultorio habilitado para atención inmediata</span>
          <span className="block text-[11px] text-muted-foreground">
            Si lo desmarcás, quedará pausado y no se sugerirá al asignar agendas o turnos de mostrador.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <Link
          to="/dashboard/recepcion/sede"
          className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          {submitIcon ?? <Save className="h-4 w-4" aria-hidden="true" />}
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
};
