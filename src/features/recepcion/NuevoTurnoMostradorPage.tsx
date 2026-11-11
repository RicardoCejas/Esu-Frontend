import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarCheck, Search, UserPlus } from 'lucide-react';
import { useNuevoTurnoMostrador } from './hooks/useNuevoTurnoMostrador';

const OBRA_SOCIAL_OPTIONS = [
  'Particular / Sin Obra Social',
  'APROSS',
  'PAMI',
  'OSDE',
  'Swiss Medical',
  'OSPE',
  'OSECAC',
  'Otra',
];

export const NuevoTurnoMostradorPage: React.FC = () => {
  const {
    centroNombre,
    hoy,
    profesionales,
    consultorios,
    dniBusqueda,
    setDniBusqueda,
    paciente,
    buscandoDni,
    dniError,
    profesionalId,
    setProfesionalId,
    consultorioNumero,
    setConsultorioNumero,
    fecha,
    setFecha,
    hora,
    setHora,
    horaManual,
    setHoraManual,
    slotsDisponibles,
    loadingSlots,
    obraSocial,
    setObraSocial,
    copagoMonto,
    setCopagoMonto,
    numeroBono,
    setNumeroBono,
    motivoConsulta,
    setMotivoConsulta,
    loadingContext,
    saving,
    submitError,
    buscarPorDni,
    handleSubmit,
  } = useNuevoTurnoMostrador();

  if (loadingContext) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-700 border-t-transparent" />
      </div>
    );
  }

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div>
        <Link
          to="/dashboard/recepcion"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver al Panel de Recepción
        </Link>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          Nuevo Turno Presencial de Mostrador
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Asigná turnos presenciales en tu establecimiento consultando la disponibilidad real de cada profesional.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs font-medium text-foreground">
        <Building2 className="h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
        <span>
          Sede operativa bloqueada: <strong>{centroNombre}</strong>
        </span>
      </div>

      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {submitError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
          1. Identificación del Paciente
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="tm-dni" className="block text-xs font-semibold text-foreground mb-1.5">
              Buscar paciente por DNI <span className="text-rose-700">*</span>
            </label>
            <input
              id="tm-dni"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 38445123"
              value={dniBusqueda}
              onChange={(e) => setDniBusqueda(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void buscarPorDni();
                }
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            />
          </div>
          <button
            type="button"
            disabled={buscandoDni}
            onClick={() => void buscarPorDni()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            {buscandoDni ? 'Buscando...' : 'Buscar DNI'}
          </button>
          <Link
            to={`/dashboard/recepcion/pacientes/nuevo?returnTo=turno${dniBusqueda ? `&dni=${dniBusqueda}` : ''}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-sky-700 hover:bg-muted transition"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Alta Rápida Paciente
          </Link>
        </div>

        {dniError && (
          <p role="alert" className="text-xs font-medium text-rose-700">
            {dniError}
          </p>
        )}

        {paciente && (
          <div className="rounded-lg border border-emerald-300 bg-muted/40 p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold text-foreground">
                {paciente.apellido}, {paciente.nombre}
              </p>
              <p className="text-muted-foreground tabular-nums">
                DNI {paciente.dni} · Tel: {paciente.telefono || 'Sin especificar'}
              </p>
            </div>
            <span className="rounded-md bg-emerald-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
              Paciente seleccionado
            </span>
          </div>
        )}
      </section>

      <form
        noValidate
        onSubmit={onFormSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs"
      >
        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            2. Profesional, Consultorio y Horario Disponible
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="tm-profesional" className="block text-xs font-semibold text-foreground mb-1.5">
                Profesional Médico de la Sede <span className="text-rose-700">*</span>
              </label>
              <select
                id="tm-profesional"
                value={profesionalId}
                onChange={(e) => setProfesionalId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                {profesionales.length === 0 && (
                  <option value="">No hay médicos activos en esta sede</option>
                )}
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    Dr./Dra. {p.nombre} {p.apellido} — {p.especialidadNombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tm-consultorio" className="block text-xs font-semibold text-foreground mb-1.5">
                Consultorio / Box
              </label>
              <select
                id="tm-consultorio"
                value={consultorioNumero}
                onChange={(e) => setConsultorioNumero(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                {consultorios.length === 0 && <option value="101">Consultorio 101 (Planta Baja)</option>}
                {consultorios.map((c) => (
                  <option key={c.id} value={c.numero}>
                    Cons. {c.numero} ({c.planta})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tm-fecha" className="block text-xs font-semibold text-foreground mb-1.5">
                Fecha de Atención <span className="text-rose-700">*</span>
              </label>
              <input
                id="tm-fecha"
                type="date"
                min={hoy}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-semibold text-foreground mb-1.5">
                Horarios Disponibles Reales
              </span>
              {loadingSlots ? (
                <p className="text-xs text-muted-foreground py-2">Consultando agenda del profesional...</p>
              ) : slotsDisponibles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {slotsDisponibles.map((slot) => {
                    const selected = hora === slot;
                    return (
                      <label
                        key={slot}
                        className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-bold tabular-nums cursor-pointer transition ${
                          selected
                            ? 'border-sky-700 bg-sky-700 text-white'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tm-slot"
                          value={slot}
                          checked={selected}
                          onChange={() => {
                            setHora(slot);
                            setHoraManual('');
                          }}
                          className="sr-only"
                        />
                        {slot} hs
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id="tm-hora-manual"
                    type="time"
                    value={horaManual}
                    onChange={(e) => setHoraManual(e.target.value)}
                    aria-label="Horario manual de mostrador"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Sin grilla libre automática para esta fecha; ingresá hora de mostrador manual.
                  </span>
                </div>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            3. Cobertura, Copago y Motivo
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="tm-obra-social" className="block text-xs font-semibold text-foreground mb-1.5">
                Obra Social
              </label>
              <select
                id="tm-obra-social"
                value={obraSocial}
                onChange={(e) => setObraSocial(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {OBRA_SOCIAL_OPTIONS.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tm-copago" className="block text-xs font-semibold text-foreground mb-1.5">
                Copago Cobrado ($)
              </label>
              <input
                id="tm-copago"
                type="number"
                min={0}
                value={copagoMonto}
                onChange={(e) => setCopagoMonto(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="tm-bono" className="block text-xs font-semibold text-foreground mb-1.5">
                Nro. de Bono / Recibo
              </label>
              <input
                id="tm-bono"
                type="text"
                value={numeroBono}
                onChange={(e) => setNumeroBono(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="tm-motivo" className="block text-xs font-semibold text-foreground mb-1.5">
                Motivo / Observación de Ingreso
              </label>
              <input
                id="tm-motivo"
                type="text"
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Link
            to="/dashboard/recepcion"
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !paciente || profesionales.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Confirmando...' : 'Confirmar Turno Presencial'}
          </button>
        </div>
      </form>
    </div>
  );
};
