import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { buildFloorOptions } from '@/lib/centroUtils';
import { useEditarSede, type SedeFormValues } from './hooks/useEditarSede';
import { SedeUbicacionSection } from './components/SedeUbicacionSection';
import { SedeServiciosSection } from './components/SedeServiciosSection';
import type { CentroSalud } from '@/types';

const TIPOS_EFECTOR: { value: CentroSalud['tipo']; label: string }[] = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CLINICA', label: 'Clínica' },
  { value: 'DISPENSARIO', label: 'Dispensario / CAPS' },
  { value: 'CONSULTORIO_PRIVADO', label: 'Consultorio Privado' },
];

export const EditarSedePage: React.FC = () => {
  const {
    values,
    errors,
    submitError,
    loading,
    saving,
    setField,
    setCoordinates,
    toggleEstudio,
    handleBlur,
    handleSubmit,
  } = useEditarSede();
  const formRef = useRef<HTMLFormElement>(null);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await handleSubmit();
    if (!ok) {
      window.requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalid?.focus();
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-700 border-t-transparent" />
      </div>
    );
  }

  const floorPreview = buildFloorOptions(Number(values.cantidadPlantas)).join(' · ');

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div>
        <Link
          to="/dashboard/recepcion/sede"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a Mi Sede y Consultorios
        </Link>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          Editar Información de la Sede
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualizá datos institucionales, cantidad de plantas físicas, ubicación en mapa y estudios habilitados.
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900"
        >
          {submitError}
        </div>
      )}

      <form
        ref={formRef}
        noValidate
        onSubmit={onFormSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs"
      >
        <fieldset className="space-y-4">
          <legend className="text-base font-bold text-foreground border-b border-border pb-2 w-full">
            Identificación, Estructura y Contacto
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="sede-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre Oficial del Establecimiento <span className="text-rose-700">*</span>
              </label>
              <input
                id="sede-nombre"
                type="text"
                required
                value={values.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                onBlur={() => handleBlur('nombre')}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'sede-nombre-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.nombre && (
                <p id="sede-nombre-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="sede-tipo" className="block text-xs font-semibold text-foreground mb-1.5">
                Tipo de Efector
              </label>
              <select
                id="sede-tipo"
                value={values.tipo}
                onChange={(e) => setField('tipo', e.target.value as SedeFormValues['tipo'])}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                {TIPOS_EFECTOR.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sede-plantas" className="block text-xs font-semibold text-foreground mb-1.5">
                Plantas / Pisos Físicos <span className="text-rose-700">*</span>
              </label>
              <input
                id="sede-plantas"
                type="number"
                min={1}
                max={30}
                required
                value={values.cantidadPlantas}
                onChange={(e) => setField('cantidadPlantas', e.target.value)}
                onBlur={() => handleBlur('cantidadPlantas')}
                aria-invalid={Boolean(errors.cantidadPlantas)}
                aria-describedby={errors.cantidadPlantas ? 'sede-plantas-error' : 'sede-plantas-help'}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.cantidadPlantas ? (
                <p id="sede-plantas-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.cantidadPlantas}
                </p>
              ) : (
                <p id="sede-plantas-help" className="mt-1 text-[11px] text-muted-foreground">
                  Habilita: {floorPreview}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="sede-ciudad" className="block text-xs font-semibold text-foreground mb-1.5">
                Ciudad / Localidad <span className="text-rose-700">*</span>
              </label>
              <input
                id="sede-ciudad"
                type="text"
                required
                autoComplete="address-level2"
                value={values.ciudad}
                onChange={(e) => setField('ciudad', e.target.value)}
                onBlur={() => handleBlur('ciudad')}
                aria-invalid={Boolean(errors.ciudad)}
                aria-describedby={errors.ciudad ? 'sede-ciudad-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.ciudad && (
                <p id="sede-ciudad-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.ciudad}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="sede-telefono" className="block text-xs font-semibold text-foreground mb-1.5">
                Teléfono de Contacto <span className="text-rose-700">*</span>
              </label>
              <input
                id="sede-telefono"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={values.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                onBlur={() => handleBlur('telefono')}
                aria-invalid={Boolean(errors.telefono)}
                aria-describedby={errors.telefono ? 'sede-telefono-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.telefono && (
                <p id="sede-telefono-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.telefono}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sede-direccion" className="block text-xs font-semibold text-foreground mb-1.5">
                Dirección Física <span className="text-rose-700">*</span>
              </label>
              <input
                id="sede-direccion"
                type="text"
                required
                autoComplete="street-address"
                value={values.direccion}
                onChange={(e) => setField('direccion', e.target.value)}
                onBlur={() => handleBlur('direccion')}
                aria-invalid={Boolean(errors.direccion)}
                aria-describedby={errors.direccion ? 'sede-direccion-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.direccion && (
                <p id="sede-direccion-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.direccion}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sede-horario" className="block text-xs font-semibold text-foreground mb-1.5">
                Horario de Atención al Público <span className="text-rose-700">*</span>
              </label>
              <input
                id="sede-horario"
                type="text"
                required
                placeholder="Ej: Lunes a Viernes 07:00 a 20:00 hs"
                value={values.horarioAtencion}
                onChange={(e) => setField('horarioAtencion', e.target.value)}
                onBlur={() => handleBlur('horarioAtencion')}
                aria-invalid={Boolean(errors.horarioAtencion)}
                aria-describedby={errors.horarioAtencion ? 'sede-horario-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.horarioAtencion && (
                <p id="sede-horario-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.horarioAtencion}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <SedeUbicacionSection
          values={values}
          errors={errors}
          onChangeField={setField}
          onBlurField={handleBlur}
          onPickMapCoords={setCoordinates}
        />

        <SedeServiciosSection
          values={values}
          errors={errors}
          onChangeField={setField}
          onToggleEstudio={toggleEstudio}
        />

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
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};
