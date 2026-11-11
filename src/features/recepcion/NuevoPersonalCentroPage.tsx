import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, RotateCcw, UserPlus } from 'lucide-react';
import { PermisosMatrixSelector } from '@/features/admin/components/PermisosMatrixSelector';
import { CENTER_STAFF_ALLOWED_ROLES } from './utils/centroStaffHelpers';
import { useNuevoPersonalCentro } from './hooks/useNuevoPersonalCentro';

export const NuevoPersonalCentroPage: React.FC = () => {
  const {
    centroNombre,
    catalogoPermisos,
    loadingCatalogo,
    values,
    permisos,
    setPermisos,
    errors,
    submitError,
    saving,
    excludedPermissions,
    setField,
    resetRoleDefaults,
    handleSubmit,
  } = useNuevoPersonalCentro();
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div>
        <Link
          to="/dashboard/recepcion/personal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a Personal del Centro
        </Link>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          Nuevo Integrante del Centro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Creá una cuenta vinculada automáticamente a tu centro y personalizá sus permisos operativos desde el alta.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs font-medium text-foreground">
        <Building2 className="h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
        <span>
          Sede asignada automáticamente: <strong>{centroNombre || 'Sede actual'}</strong>
        </span>
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
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Identidad y Credenciales de Acceso
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="staff-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre <span className="text-rose-700">*</span>
              </label>
              <input
                id="staff-nombre"
                type="text"
                required
                value={values.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'staff-nombre-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.nombre && (
                <p id="staff-nombre-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-apellido" className="block text-xs font-semibold text-foreground mb-1.5">
                Apellido <span className="text-rose-700">*</span>
              </label>
              <input
                id="staff-apellido"
                type="text"
                required
                value={values.apellido}
                onChange={(e) => setField('apellido', e.target.value)}
                aria-invalid={Boolean(errors.apellido)}
                aria-describedby={errors.apellido ? 'staff-apellido-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.apellido && (
                <p id="staff-apellido-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.apellido}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-email" className="block text-xs font-semibold text-foreground mb-1.5">
                Correo Electrónico Institucional <span className="text-rose-700">*</span>
              </label>
              <input
                id="staff-email"
                type="email"
                required
                autoComplete="email"
                placeholder="usuario@esu.gob.ar"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'staff-email-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.email && (
                <p id="staff-email-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-dni" className="block text-xs font-semibold text-foreground mb-1.5">
                DNI (Opcional)
              </label>
              <input
                id="staff-dni"
                type="text"
                inputMode="numeric"
                value={values.dni}
                onChange={(e) => setField('dni', e.target.value)}
                aria-invalid={Boolean(errors.dni)}
                aria-describedby={errors.dni ? 'staff-dni-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.dni && (
                <p id="staff-dni-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.dni}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-pass" className="block text-xs font-semibold text-foreground mb-1.5">
                Contraseña Inicial <span className="text-rose-700">*</span>
              </label>
              <input
                id="staff-pass"
                type="password"
                required
                autoComplete="new-password"
                value={values.password}
                onChange={(e) => setField('password', e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'staff-pass-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.password && (
                <p id="staff-pass-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-pass2" className="block text-xs font-semibold text-foreground mb-1.5">
                Confirmar Contraseña <span className="text-rose-700">*</span>
              </label>
              <input
                id="staff-pass2"
                type="password"
                required
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'staff-pass2-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.confirmPassword && (
                <p id="staff-pass2-error" className="mt-1 text-xs font-medium text-rose-700">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Perfil Institucional en la Sede
          </legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CENTER_STAFF_ALLOWED_ROLES.map((roleOpt) => {
              const selected = values.rol === roleOpt.value;
              return (
                <label
                  key={roleOpt.value}
                  className={`flex items-center gap-3 rounded-lg border p-3.5 text-xs font-semibold cursor-pointer transition ${
                    selected
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-border bg-background text-foreground hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="staff-rol"
                    value={roleOpt.value}
                    checked={selected}
                    onChange={() => setField('rol', roleOpt.value as 'RECEPCIONISTA' | 'PROFESIONAL')}
                    className="h-4 w-4 accent-white"
                  />
                  <span>{roleOpt.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
            <h2 className="text-base font-bold text-foreground">Matriz de Permisos Iniciales (RBAC)</h2>
            <button
              type="button"
              onClick={resetRoleDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restablecer plantilla del rol
            </button>
          </div>

          {loadingCatalogo ? (
            <p className="text-xs text-muted-foreground py-4">Cargando catálogo de permisos...</p>
          ) : catalogoPermisos.length > 0 ? (
            <PermisosMatrixSelector
              catalogo={catalogoPermisos}
              selectedPermisos={permisos}
              onChange={setPermisos}
              rolBase={values.rol === 'PROFESIONAL' ? 'MEDICO' : 'RECEPCIONISTA'}
              disabled={saving}
              excludePermissionCodes={excludedPermissions}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Se asignarán los permisos base correspondientes al perfil elegido.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Link
            to="/dashboard/recepcion/personal"
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Creando...' : 'Crear Cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
};
