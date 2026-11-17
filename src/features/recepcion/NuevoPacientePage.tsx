import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { useNuevoPaciente } from './hooks/useNuevoPaciente';

const OBRA_SOCIAL_OPTIONS = [
  'Particular / Sin Obra Social',
  'APROSS',
  'PAMI',
  'OSDE',
  'Swiss Medical',
  'OSPE',
  'OSECAC',
  'SIPSSA',
  'Otra',
];

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

export const NuevoPacientePage: React.FC = () => {
  const {
    returnTo,
    values,
    errors,
    submitError,
    saving,
    dniDuplicadoId,
    verificandoDni,
    setField,
    verificarDniExistente,
    handleSubmit,
  } = useNuevoPaciente();
  const formRef = useRef<HTMLFormElement>(null);

  const backHref =
    returnTo === 'turno'
      ? '/dashboard/recepcion/turnos/nuevo'
      : returnTo === 'sobreturno'
      ? '/dashboard/recepcion/kanban/sobreturno'
      : '/dashboard/recepcion/pacientes';

  const backLabel =
    returnTo === 'turno'
      ? 'Volver a Turno de Mostrador'
      : returnTo === 'sobreturno'
      ? 'Volver a Registrar Sobreturno'
      : 'Volver al Padrón de Pacientes';

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

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div>
        <Link
          to={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {backLabel}
        </Link>

        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          {values.altaRapidaSinEmail ? 'Alta Rápida de Paciente en Ventanilla' : 'Registrar Nuevo Paciente'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Empadroná al paciente con su cobertura y contacto para asignarle turnos de inmediato o habilitar su portal.
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
        <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={values.altaRapidaSinEmail}
            onChange={(e) => setField('altaRapidaSinEmail', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-600"
          />
          <span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <UserPlus className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
              Modo Alta Rápida en Mostrador (paciente sin correo declarado)
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Genera un identificador temporal en base al DNI para agilizar la atención presencial exigiendo solo teléfono.
            </span>
          </span>
        </label>

        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Identificación y Contacto
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="npac-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre <span className="text-rose-700">*</span>
              </label>
              <input
                id="npac-nombre"
                type="text"
                required
                autoComplete="given-name"
                value={values.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'npac-nombre-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.nombre && (
                <p id="npac-nombre-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="npac-apellido" className="block text-xs font-semibold text-foreground mb-1.5">
                Apellido <span className="text-rose-700">*</span>
              </label>
              <input
                id="npac-apellido"
                type="text"
                required
                autoComplete="family-name"
                value={values.apellido}
                onChange={(e) => setField('apellido', e.target.value)}
                aria-invalid={Boolean(errors.apellido)}
                aria-describedby={errors.apellido ? 'npac-apellido-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.apellido && (
                <p id="npac-apellido-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.apellido}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="npac-dni" className="block text-xs font-semibold text-foreground mb-1.5">
                DNI (sin puntos) <span className="text-rose-700">*</span>
              </label>
              <input
                id="npac-dni"
                type="text"
                inputMode="numeric"
                required
                value={values.dni}
                onChange={(e) => setField('dni', e.target.value.replace(/\D/g, ''))}
                onBlur={() => void verificarDniExistente()}
                aria-invalid={Boolean(errors.dni)}
                aria-describedby={errors.dni ? 'npac-dni-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {verificandoDni && (
                <p className="mt-1 text-[11px] text-muted-foreground animate-pulse">
                  Verificando existencia en padrón...
                </p>
              )}
              {errors.dni && (
                <p id="npac-dni-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.dni}
                </p>
              )}
              {dniDuplicadoId && (
                <div className="mt-1">
                  <Link
                    to={`/dashboard/recepcion/pacientes/${dniDuplicadoId}`}
                    className="text-xs font-bold text-sky-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ver ficha del paciente existente</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="npac-telefono" className="block text-xs font-semibold text-foreground mb-1.5">
                Teléfono / WhatsApp {values.altaRapidaSinEmail && <span className="text-rose-700">*</span>}
              </label>
              <input
                id="npac-telefono"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej: 3549-412345"
                value={values.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                aria-invalid={Boolean(errors.telefono)}
                aria-describedby={errors.telefono ? 'npac-telefono-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.telefono && (
                <p id="npac-telefono-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.telefono}
                </p>
              )}
            </div>

            {!values.altaRapidaSinEmail && (
              <div>
                <label htmlFor="npac-email" className="block text-xs font-semibold text-foreground mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  id="npac-email"
                  type="email"
                  autoComplete="email"
                  placeholder="paciente@correo.com"
                  value={values.email}
                  onChange={(e) => setField('email', e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'npac-email-error' : undefined}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                />
                {errors.email && (
                  <p id="npac-email-error" className="mt-1 text-xs font-medium text-rose-700">
                    {errors.email}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="npac-nacimiento" className="block text-xs font-semibold text-foreground mb-1.5">
                Fecha de Nacimiento
              </label>
              <input
                id="npac-nacimiento"
                type="date"
                value={values.fechaNacimiento}
                onChange={(e) => setField('fechaNacimiento', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Cobertura Médica y Datos Básicos
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="npac-obra-social" className="block text-xs font-semibold text-foreground mb-1.5">
                Obra Social / Prepaga
              </label>
              <select
                id="npac-obra-social"
                value={values.obraSocial}
                onChange={(e) => setField('obraSocial', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                {OBRA_SOCIAL_OPTIONS.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="npac-afiliado" className="block text-xs font-semibold text-foreground mb-1.5">
                Nro. de Afiliado
              </label>
              <input
                id="npac-afiliado"
                type="text"
                value={values.nroAfiliado}
                onChange={(e) => setField('nroAfiliado', e.target.value)}
                placeholder="Opcional si es Particular"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>

            <div>
              <label htmlFor="npac-sangre" className="block text-xs font-semibold text-foreground mb-1.5">
                Grupo Sanguíneo
              </label>
              <select
                id="npac-sangre"
                value={values.grupoSanguineo}
                onChange={(e) => setField('grupoSanguineo', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                <option value="">Sin especificar</option>
                {BLOOD_GROUPS.filter(Boolean).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Link
            to={backHref}
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
            {saving
              ? 'Registrando...'
              : returnTo === 'turno' || returnTo === 'sobreturno'
              ? 'Guardar y Continuar al Turno'
              : 'Guardar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
};
