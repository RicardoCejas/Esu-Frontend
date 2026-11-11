import React, { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CalendarPlus, Save, ShieldCheck } from 'lucide-react';
import { usePacienteDetalle } from './hooks/usePacienteDetalle';

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

export const PacienteDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    canEdit,
    paciente,
    turnos,
    values,
    errors,
    loading,
    saving,
    loadError,
    submitError,
    setField,
    loadData,
    handleSave,
  } = usePacienteDetalle(id);

  const formRef = useRef<HTMLFormElement>(null);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await handleSave();
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

  if (loadError || !paciente) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/dashboard/recepcion/pacientes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver al Padrón de Pacientes
        </Link>
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900 space-y-3">
          <p className="font-semibold">{loadError || 'Paciente no encontrado.'}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const ausentesCount = turnos.filter((t) => t.estado === 'AUSENTE').length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/dashboard/recepcion/pacientes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al Padrón de Pacientes
          </Link>

          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {paciente.apellido}, {paciente.nombre}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold text-white ${
                paciente.dniVerificado ? 'bg-emerald-700' : 'bg-amber-700'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {paciente.dniVerificado ? 'Identidad Verificada' : 'Contacto Incompleto'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            DNI {paciente.dni} · Cobertura: {paciente.obraSocial || 'Particular'}
          </p>
        </div>

        {canEdit && (
          <Link
            to={`/dashboard/recepcion/turnos/nuevo?dni=${encodeURIComponent(paciente.dni)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 self-start"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Dar Turno en Mostrador
          </Link>
        )}
      </div>

      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {submitError}
        </div>
      )}

      <form
        ref={formRef}
        noValidate
        onSubmit={onFormSubmit}
        className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-xs"
      >
        <fieldset disabled={!canEdit || saving} className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Contacto, Identidad y Cobertura Médica
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="pac-dni" className="block text-xs font-semibold text-foreground mb-1.5">
                DNI <span className="text-rose-700">*</span>
              </label>
              <input
                id="pac-dni"
                type="text"
                inputMode="numeric"
                value={values.dni}
                onChange={(e) => setField('dni', e.target.value)}
                aria-invalid={Boolean(errors.dni)}
                aria-describedby={errors.dni ? 'pac-dni-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums disabled:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.dni && (
                <p id="pac-dni-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.dni}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pac-telefono" className="block text-xs font-semibold text-foreground mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                id="pac-telefono"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                placeholder="Ej: 3549-456789"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>

            <div>
              <label htmlFor="pac-email" className="block text-xs font-semibold text-foreground mb-1.5">
                Correo Electrónico
              </label>
              <input
                id="pac-email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'pac-email-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.email && (
                <p id="pac-email-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pac-obra-social" className="block text-xs font-semibold text-foreground mb-1.5">
                Obra Social / Prepaga
              </label>
              <select
                id="pac-obra-social"
                value={
                  OBRA_SOCIAL_OPTIONS.includes(values.obraSocial) || !values.obraSocial
                    ? values.obraSocial
                    : 'Otra'
                }
                onChange={(e) => setField('obraSocial', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                <option value="">Seleccionar cobertura...</option>
                {OBRA_SOCIAL_OPTIONS.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pac-afiliado" className="block text-xs font-semibold text-foreground mb-1.5">
                Número de Afiliado
              </label>
              <input
                id="pac-afiliado"
                type="text"
                value={values.nroAfiliado}
                onChange={(e) => setField('nroAfiliado', e.target.value)}
                placeholder="Ej: 45-123456-00"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums disabled:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pac-nacimiento" className="block text-xs font-semibold text-foreground mb-1.5">
                  Fecha de Nac.
                </label>
                <input
                  id="pac-nacimiento"
                  type="date"
                  value={values.fechaNacimiento}
                  onChange={(e) => setField('fechaNacimiento', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground disabled:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                />
              </div>

              <div>
                <label htmlFor="pac-sangre" className="block text-xs font-semibold text-foreground mb-1.5">
                  Grupo Sang.
                </label>
                <select
                  id="pac-sangre"
                  value={values.grupoSanguineo}
                  onChange={(e) => setField('grupoSanguineo', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground disabled:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                >
                  <option value="">S/D</option>
                  {BLOOD_GROUPS.filter(Boolean).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        {canEdit && (
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Guardando...' : 'Actualizar Empadronamiento'}
            </button>
          </div>
        )}
      </form>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Calendar className="h-4 w-4 text-sky-700" aria-hidden="true" />
            Historial de Turnos y Asistencia ({turnos.length})
          </h2>
          {ausentesCount > 0 && (
            <span className="rounded-md bg-amber-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
              {ausentesCount} {ausentesCount === 1 ? 'ausencia registrada' : 'ausencias registradas'}
            </span>
          )}
        </div>

        {turnos.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            Este paciente todavía no registra turnos en el sistema.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Profesional / Especialidad</th>
                  <th className="p-3">Establecimiento</th>
                  <th className="p-3">Estado</th>
                  {canEdit && <th className="p-3 text-right">Gestión</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {turnos.slice(0, 15).map((t) => {
                  const canReschedule =
                    canEdit && t.estado !== 'CANCELADO' && t.estado !== 'COMPLETADO';
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition">
                      <td className="p-3 font-semibold tabular-nums text-foreground">
                        {t.fecha} · {t.hora} hs
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{t.profesionalNombre}</div>
                        <div className="text-[11px] text-muted-foreground">{t.especialidadNombre}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{t.centroSaludNombre}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
                            t.estado === 'COMPLETADO'
                              ? 'bg-emerald-700'
                              : t.estado === 'CANCELADO' || t.estado === 'AUSENTE'
                              ? 'bg-rose-700'
                              : 'bg-sky-700'
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-3 text-right">
                          {canReschedule ? (
                            <Link
                              to={`/dashboard/recepcion/turnos/${t.id}/reagendar`}
                              className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-muted"
                            >
                              Reagendar
                            </Link>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
