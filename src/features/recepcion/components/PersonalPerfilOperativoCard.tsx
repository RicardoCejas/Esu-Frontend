import React from 'react';
import { KeyRound, Save, UserCheck } from 'lucide-react';

export interface PerfilOperativoValues {
  nombre: string;
  apellido: string;
  dni: string;
}

export type PerfilOperativoErrors = Partial<Record<keyof PerfilOperativoValues, string>>;

interface PersonalPerfilOperativoCardProps {
  values: PerfilOperativoValues;
  errors: PerfilOperativoErrors;
  savingPerfil: boolean;
  revokingSessions: boolean;
  isSelf: boolean;
  onFieldChange: <K extends keyof PerfilOperativoValues>(field: K, value: string) => void;
  onSavePerfil: (e: React.FormEvent<HTMLFormElement>) => void;
  onRequestRevokeSessions: () => void;
}

export const PersonalPerfilOperativoCard: React.FC<PersonalPerfilOperativoCardProps> = ({
  values,
  errors,
  savingPerfil,
  revokingSessions,
  isSelf,
  onFieldChange,
  onSavePerfil,
  onRequestRevokeSessions,
}) => {
  return (
    <section
      aria-labelledby="perfil-operativo-legend"
      className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5"
    >
      <form noValidate onSubmit={onSavePerfil} className="space-y-4">
        <fieldset className="space-y-4">
          <legend
            id="perfil-operativo-legend"
            className="flex w-full items-center gap-2 border-b border-border pb-2 text-base font-bold text-foreground"
          >
            <UserCheck className="h-4 w-4 text-sky-700" aria-hidden="true" />
            <span>Datos Operativos e Identidad en Sede</span>
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="edit-staff-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre <span aria-hidden="true" className="text-rose-700">*</span>
              </label>
              <input
                id="edit-staff-nombre"
                name="nombre"
                type="text"
                required
                value={values.nombre}
                onChange={(e) => onFieldChange('nombre', e.target.value)}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'edit-staff-nombre-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.nombre && (
                <p id="edit-staff-nombre-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="edit-staff-apellido" className="block text-xs font-semibold text-foreground mb-1.5">
                Apellido <span aria-hidden="true" className="text-rose-700">*</span>
              </label>
              <input
                id="edit-staff-apellido"
                name="apellido"
                type="text"
                required
                value={values.apellido}
                onChange={(e) => onFieldChange('apellido', e.target.value)}
                aria-invalid={Boolean(errors.apellido)}
                aria-describedby={errors.apellido ? 'edit-staff-apellido-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.apellido && (
                <p id="edit-staff-apellido-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.apellido}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="edit-staff-dni" className="block text-xs font-semibold text-foreground mb-1.5">
                DNI (7 u 8 dígitos)
              </label>
              <input
                id="edit-staff-dni"
                name="dni"
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder="Ej: 32123456"
                value={values.dni}
                onChange={(e) => onFieldChange('dni', e.target.value)}
                aria-invalid={Boolean(errors.dni)}
                aria-describedby={errors.dni ? 'edit-staff-dni-error' : 'edit-staff-dni-help'}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.dni ? (
                <p id="edit-staff-dni-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.dni}
                </p>
              ) : (
                <p id="edit-staff-dni-help" className="mt-1 text-[11px] text-muted-foreground">
                  Opcional. Solo números sin puntos.
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onRequestRevokeSessions}
            disabled={revokingSessions || isSelf}
            title={isSelf ? 'Usá Mi Perfil para cerrar tus otras sesiones.' : 'Invalidar tokens activos de este usuario'}
            className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <KeyRound className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            <span>{revokingSessions ? 'Revocando...' : 'Revocar Sesiones Activas'}</span>
          </button>

          <button
            type="submit"
            disabled={savingPerfil}
            className="min-h-[38px] inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{savingPerfil ? 'Guardando...' : 'Guardar Datos Básicos'}</span>
          </button>
        </div>
      </form>
    </section>
  );
};
