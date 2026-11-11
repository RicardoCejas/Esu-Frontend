import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Search, UserPlus } from 'lucide-react';
import { useNuevoSobreturno } from './hooks/useNuevoSobreturno';

export const NuevoSobreturnoPage: React.FC = () => {
  const {
    limiteDiario,
    motivosDisponibles,
    profesionales,
    consultorios,
    profesionalId,
    setProfesionalId,
    consultorioSeleccionado,
    setConsultorioSeleccionado,
    sobreturnosCount,
    cupoAlcanzado,
    cuposRestantes,
    loadingCupo,
    dniBusqueda,
    setDniBusqueda,
    pacienteEncontrado,
    buscandoDni,
    dniError,
    nombre,
    setNombre,
    apellido,
    setApellido,
    dni,
    setDni,
    telefono,
    setTelefono,
    obraSocial,
    setObraSocial,
    motivo,
    setMotivo,
    observacion,
    setObservacion,
    loadingContext,
    saving,
    submitError,
    buscarPorDni,
    handleSubmit,
  } = useNuevoSobreturno();

  if (loadingContext) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
      </div>
    );
  }

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/dashboard/recepcion/kanban"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al Tablero Kanban
          </Link>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
            Registrar Sobreturno de Urgencia
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Admití demanda espontánea o urgencias en sala controlando el cupo máximo por profesional.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold text-white self-start ${
            cupoAlcanzado ? 'bg-rose-700' : 'bg-amber-700'
          }`}
        >
          <Flame className="h-4 w-4" aria-hidden="true" />
          <span className="tabular-nums">
            {loadingCupo
              ? 'Verificando cupo...'
              : `Cupos hoy: ${sobreturnosCount}/${limiteDiario} (${cuposRestantes} libre${
                  cuposRestantes === 1 ? '' : 's'
                })`}
          </span>
        </div>
      </div>

      {cupoAlcanzado && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">
          El profesional seleccionado alcanzó el límite diario de {limiteDiario} sobreturnos. Elegí otro médico de guardia o reprogramá para otra fecha.
        </div>
      )}

      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {submitError}
        </div>
      )}

      <form
        noValidate
        onSubmit={onFormSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs"
      >
        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            1. Profesional Médico y Consultorio Asignado
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="st-profesional" className="block text-xs font-semibold text-foreground mb-1.5">
                Profesional Médico <span className="text-rose-700">*</span>
              </label>
              <select
                id="st-profesional"
                value={profesionalId}
                onChange={(e) => setProfesionalId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    Dr./Dra. {p.nombre} {p.apellido} — {p.especialidadNombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="st-consultorio" className="block text-xs font-semibold text-foreground mb-1.5">
                Consultorio Destino
              </label>
              <select
                id="st-consultorio"
                value={consultorioSeleccionado}
                onChange={(e) => setConsultorioSeleccionado(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                <option value="">Asignación automática por sala</option>
                {consultorios.map((c) => {
                  const label = `${c.numero} (${c.planta})`;
                  return (
                    <option key={c.id} value={label}>
                      Consultorio {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            2. Paciente en Sala de Espera
          </legend>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="st-buscar-dni" className="block text-xs font-semibold text-foreground mb-1.5">
                Búsqueda rápida por DNI
              </label>
              <input
                id="st-buscar-dni"
                type="text"
                inputMode="numeric"
                placeholder="Ingresá DNI y buscá..."
                value={dniBusqueda}
                onChange={(e) => setDniBusqueda(e.target.value.replace(/\D/g, ''))}
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
              to={`/dashboard/recepcion/pacientes/nuevo?returnTo=sobreturno${dni ? `&dni=${dni}` : ''}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-sky-700 hover:bg-muted transition"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Empadronar Nuevo
            </Link>
          </div>

          {dniError && <p className="text-xs font-medium text-amber-800">{dniError}</p>}

          {pacienteEncontrado && (
            <div className="rounded-lg border border-emerald-300 bg-muted/40 p-3 text-xs font-semibold text-foreground">
              Paciente vinculado al padrón: {pacienteEncontrado.nombre} {pacienteEncontrado.apellido} (DNI {pacienteEncontrado.dni})
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="st-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre <span className="text-rose-700">*</span>
              </label>
              <input
                id="st-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label htmlFor="st-apellido" className="block text-xs font-semibold text-foreground mb-1.5">
                Apellido <span className="text-rose-700">*</span>
              </label>
              <input
                id="st-apellido"
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label htmlFor="st-dni" className="block text-xs font-semibold text-foreground mb-1.5">
                DNI <span className="text-rose-700">*</span>
              </label>
              <input
                id="st-dni"
                type="text"
                inputMode="numeric"
                required
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="st-telefono" className="block text-xs font-semibold text-foreground mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                id="st-telefono"
                type="tel"
                inputMode="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="st-obra-social" className="block text-xs font-semibold text-foreground mb-1.5">
                Obra Social / Cobertura
              </label>
              <input
                id="st-obra-social"
                type="text"
                value={obraSocial}
                onChange={(e) => setObraSocial(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            3. Motivo Clínico / Prioridad
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="st-motivo" className="block text-xs font-semibold text-foreground mb-1.5">
                Clasificación de Sobreturno
              </label>
              <select
                id="st-motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {motivosDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="st-observacion" className="block text-xs font-semibold text-foreground mb-1.5">
                Detalle / Síntoma breve (Opcional)
              </label>
              <input
                id="st-observacion"
                type="text"
                placeholder="Ej: Fiebre alta, derivado de guardia"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Link
            to="/dashboard/recepcion/kanban"
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || cupoAlcanzado}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Asignando Sobreturno...' : 'Registrar Sobreturno en Sala'}
          </button>
        </div>
      </form>
    </div>
  );
};
