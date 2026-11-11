import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Link2, Power, Save, Unlink } from 'lucide-react';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import { usePermissions } from '@/hooks/usePermissions';
import { useMedicoDetalle } from './hooks/useMedicoDetalle';
import { MedicoAgendaSection } from './components/MedicoAgendaSection';

export const MedicoDetallePage: React.FC = () => {
  const { can } = usePermissions();
  const canEditMedico = can('MEDICOS_ASIGNAR_CONSULTORIO');
  const { id } = useParams<{ id: string }>();
  const {
    activeCentroId,
    medico,
    values,
    errors,
    especialidades,
    centros,
    disponibilidades,
    bloqueos,
    proximosTurnos,
    loading,
    saving,
    loadError,
    submitError,
    setField,
    loadData,
    handleSave,
    handleToggleEstado,
    handleVincularCentro,
    handleDesvincularCentro,
  } = useMedicoDetalle(id);

  const formRef = useRef<HTMLFormElement>(null);
  const [selectedCentroToLink, setSelectedCentroToLink] = useState('');
  const [confirmToggleEstado, setConfirmToggleEstado] = useState(false);
  const [centroToUnlink, setCentroToUnlink] = useState<string | null>(null);

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

  if (loadError || !medico) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/dashboard/recepcion/medicos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a Médicos del Centro
        </Link>
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900 space-y-3">
          <p className="font-semibold">{loadError || 'No se pudo cargar el profesional.'}</p>
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

  const isActivo = medico.activo !== false;
  const linkedCentros = centros.filter((c) => medico.centrosSaludIds.includes(c.id));
  const availableCentrosToLink = centros.filter((c) => !medico.centrosSaludIds.includes(c.id));

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/dashboard/recepcion/medicos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver a Médicos del Centro
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dr./Dra. {medico.nombre} {medico.apellido}
            </h1>
            <span
              className={`rounded-md px-2.5 py-0.5 text-xs font-bold text-white ${
                isActivo ? 'bg-emerald-700' : 'bg-slate-600'
              }`}
            >
              {isActivo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {medico.especialidadNombre} · Matrícula {medico.matricula}
          </p>
        </div>

        {canEditMedico && (<button
          type="button"
          onClick={() => setConfirmToggleEstado(true)}
          disabled={saving}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
            isActivo ? 'border-rose-300 bg-card text-rose-700 hover:bg-rose-50' : 'border-emerald-300 bg-emerald-700 text-white hover:bg-emerald-800'
          }`}
        >
          <Power className="h-4 w-4" aria-hidden="true" />
          {isActivo ? 'Desactivar Profesional' : 'Reactivar Profesional'}
        </button>)}
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
        className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-xs"
      >
        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Datos Profesionales y Contacto
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="medico-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre <span className="text-rose-700">*</span>
              </label>
              <input
                id="medico-nombre"
                type="text"
                required
                value={values.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'medico-nombre-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.nombre && (
                <p id="medico-nombre-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="medico-apellido" className="block text-xs font-semibold text-foreground mb-1.5">
                Apellido <span className="text-rose-700">*</span>
              </label>
              <input
                id="medico-apellido"
                type="text"
                required
                value={values.apellido}
                onChange={(e) => setField('apellido', e.target.value)}
                aria-invalid={Boolean(errors.apellido)}
                aria-describedby={errors.apellido ? 'medico-apellido-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.apellido && (
                <p id="medico-apellido-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.apellido}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="medico-matricula" className="block text-xs font-semibold text-foreground mb-1.5">
                Matrícula Profesional <span className="text-rose-700">*</span>
              </label>
              <input
                id="medico-matricula"
                type="text"
                required
                value={values.matricula}
                onChange={(e) => setField('matricula', e.target.value)}
                aria-invalid={Boolean(errors.matricula)}
                aria-describedby={errors.matricula ? 'medico-matricula-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.matricula && (
                <p id="medico-matricula-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.matricula}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="medico-telefono" className="block text-xs font-semibold text-foreground mb-1.5">
                Teléfono de Guardia / Contacto
              </label>
              <input
                id="medico-telefono"
                type="tel"
                inputMode="tel"
                value={values.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                placeholder="Ej: 3549-412345"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="medico-especialidad" className="block text-xs font-semibold text-foreground mb-1.5">
                Especialidad Principal <span className="text-rose-700">*</span>
              </label>
              <select
                id="medico-especialidad"
                value={values.especialidadId}
                onChange={(e) => setField('especialidadId', e.target.value)}
                aria-invalid={Boolean(errors.especialidadId)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                <option value="">Seleccionar especialidad...</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {canEditMedico && (<div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>)}
      </form>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Building2 className="h-4 w-4 text-sky-700" aria-hidden="true" />
              Sedes de Atención Vinculadas ({linkedCentros.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Administrá en qué establecimientos puede atender turnos este profesional.
            </p>
          </div>

          {canEditMedico && availableCentrosToLink.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                aria-label="Seleccionar centro para vincular"
                value={selectedCentroToLink}
                onChange={(e) => setSelectedCentroToLink(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground"
              >
                <option value="">Vincular a otro centro...</option>
                {availableCentrosToLink.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedCentroToLink || saving}
                onClick={async () => {
                  if (!selectedCentroToLink) return;
                  const ok = await handleVincularCentro(selectedCentroToLink);
                  if (ok) setSelectedCentroToLink('');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-40 cursor-pointer"
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                Vincular
              </button>
            </div>
          )}
        </div>

        {linkedCentros.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Este profesional aún no tiene centros de salud vinculados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {linkedCentros.map((centro) => {
              const isCurrentCenter = centro.id === activeCentroId;
              return (
                <div
                  key={centro.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground truncate">{centro.nombre}</p>
                      {isCurrentCenter && (
                        <span className="rounded bg-sky-700 px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0">
                          Sede actual
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {centro.direccion} · {centro.ciudad}
                    </p>
                  </div>

                  {canEditMedico && (<button
                    type="button"
                    disabled={saving}
                    onClick={() => setCentroToUnlink(centro.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer shrink-0"
                  >
                    <Unlink className="h-3 w-3" aria-hidden="true" />
                    Desvincular
                  </button>)}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <MedicoAgendaSection
        disponibilidades={disponibilidades}
        bloqueos={bloqueos}
        proximosTurnos={proximosTurnos}
        activeCentroId={activeCentroId}
      />

      <ModalConfirmacion
        isOpen={confirmToggleEstado}
        onClose={() => setConfirmToggleEstado(false)}
        onConfirm={async () => {
          await handleToggleEstado();
          setConfirmToggleEstado(false);
        }}
        title={isActivo ? 'Desactivar profesional' : 'Reactivar profesional'}
        description={
          isActivo
            ? `¿Confirmás desactivar al Dr./Dra. ${medico.nombre} ${medico.apellido}? No aparecerá disponible para nuevos turnos.`
            : `¿Confirmás reactivar al Dr./Dra. ${medico.nombre} ${medico.apellido} para atención médica?`
        }
        confirmText={isActivo ? 'Desactivar' : 'Reactivar'}
        cancelText="Cancelar"
        variant={isActivo ? 'danger' : 'primary'}
        isLoading={saving}
      />

      <ModalConfirmacion
        isOpen={Boolean(centroToUnlink)}
        onClose={() => setCentroToUnlink(null)}
        onConfirm={async () => {
          if (centroToUnlink) {
            await handleDesvincularCentro(centroToUnlink);
          }
          setCentroToUnlink(null);
        }}
        title="Desvincular profesional de la sede"
        description="¿Confirmás desvincular al profesional de este establecimiento? Sus turnos ya emitidos no se borrarán automáticamente."
        confirmText="Desvincular"
        cancelText="Cancelar"
        variant="danger"
        isLoading={saving}
      />
    </div>
  );
};
