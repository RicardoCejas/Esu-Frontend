import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Link2, Save, Stethoscope, Trash2 } from 'lucide-react';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import { useEspecialidadDetalle } from './hooks/useEspecialidadDetalle';
import type { Profesional } from '@/types';

export const EspecialidadDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    centroId,
    especialidad,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    medicosCentro,
    otrosMedicosEspecialidad,
    loading,
    saving,
    loadError,
    nombreError,
    submitError,
    loadData,
    handleSave,
    handleDesvincularMedico,
    handleVincularMedico,
  } = useEspecialidadDetalle(id);

  const formRef = useRef<HTMLFormElement>(null);
  const [medicoToUnlink, setMedicoToUnlink] = useState<Profesional | null>(null);

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

  if (loadError || !especialidad) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/dashboard/recepcion/especialidades"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a Especialidades del Centro
        </Link>
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900 space-y-3">
          <p className="font-semibold">{loadError || 'No se pudo cargar la especialidad.'}</p>
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div>
        <Link
          to="/dashboard/recepcion/especialidades"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a Especialidades del Centro
        </Link>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          Especialidad: {especialidad.nombre}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editá la descripción institucional y administrá el staff médico asignado en esta sede.
        </p>
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
        className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs"
      >
        <fieldset className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Definición de la Especialidad
          </legend>

          <div>
            <label htmlFor="esp-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
              Nombre de Especialidad <span className="text-rose-700">*</span>
            </label>
            <input
              id="esp-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={Boolean(nombreError)}
              aria-describedby={nombreError ? 'esp-nombre-error' : undefined}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            />
            {nombreError && (
              <p id="esp-nombre-error" className="mt-1 text-xs font-medium text-rose-700">
                {nombreError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="esp-descripcion" className="block text-xs font-semibold text-foreground mb-1.5">
              Descripción Asistencial / Alcance
            </label>
            <textarea
              id="esp-descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Atención ambulatoria, seguimiento preventivo y derivación hospitalaria."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            />
          </div>
        </fieldset>

        <div className="flex justify-end border-t border-border pt-4">
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

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <h2 className="text-base font-bold text-foreground">
            Profesionales Asignados en esta Sede ({medicosCentro.length})
          </h2>
          <Link
            to="/dashboard/recepcion/medicos/nuevo"
            className="text-xs font-semibold text-sky-700 hover:underline"
          >
            + Alta de médico
          </Link>
        </div>

        {medicosCentro.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No hay médicos de esta especialidad vinculados a la sede actualmente.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {medicosCentro.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3.5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Stethoscope className="h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <Link
                      to={`/dashboard/recepcion/medicos/${m.id}`}
                      className="font-bold text-foreground hover:text-sky-700 hover:underline truncate block"
                    >
                      Dr./Dra. {m.nombre} {m.apellido}
                    </Link>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      Matrícula: {m.matricula}
                    </p>
                  </div>
                </div>

                {centroId && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setMedicoToUnlink(m)}
                    aria-label={`Desvincular a ${m.nombre} ${m.apellido} de la sede`}
                    title="Desvincular médico de la sede"
                    className="p-2 text-muted-foreground hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {centroId && otrosMedicosEspecialidad.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="text-sm font-bold text-foreground border-b border-border pb-2.5">
            Otros Profesionales de {especialidad.nombre} en la Red ({otrosMedicosEspecialidad.length})
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {otrosMedicosEspecialidad.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">
                    Dr./Dra. {m.nombre} {m.apellido}
                  </p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">Matrícula {m.matricula}</p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleVincularMedico(m)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-900 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Vincular
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <ModalConfirmacion
        isOpen={Boolean(medicoToUnlink)}
        onClose={() => setMedicoToUnlink(null)}
        onConfirm={async () => {
          if (medicoToUnlink) {
            await handleDesvincularMedico(medicoToUnlink);
          }
          setMedicoToUnlink(null);
        }}
        title="Desvincular profesional de la sede"
        description={`¿Confirmás desvincular al Dr./Dra. ${medicoToUnlink?.nombre ?? ''} ${medicoToUnlink?.apellido ?? ''} de este centro de salud?`}
        confirmText="Desvincular"
        cancelText="Cancelar"
        variant="danger"
        isLoading={saving}
      />
    </div>
  );
};
