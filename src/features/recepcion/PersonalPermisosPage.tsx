import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, RotateCcw, Save, Shield } from 'lucide-react';
import { PermisosMatrixSelector } from '@/features/admin/components/PermisosMatrixSelector';
import { CENTER_STAFF_ALLOWED_ROLES } from './utils/centroStaffHelpers';
import { usePersonalPermisos } from './hooks/usePersonalPermisos';
import type { BackendUserRole } from '@/types';

export const PersonalPermisosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    scopedCentroNombre,
    targetUser,
    catalogoPermisos,
    rol,
    permisosSeleccionados,
    setPermisosSeleccionados,
    excludedPermissions,
    loading,
    saving,
    loadError,
    submitError,
    loadData,
    handleRolChange,
    applyRoleDefaults,
    handleSave,
  } = usePersonalPermisos(id);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-700 border-t-transparent" />
      </div>
    );
  }

  if (loadError || !targetUser) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/dashboard/recepcion/personal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a Personal del Centro
        </Link>
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900 space-y-3">
          <p className="font-semibold">{loadError || 'No se encontró la cuenta solicitada.'}</p>
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

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSave();
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

        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Rol y Permisos: {targetUser.nombre} {targetUser.apellido}
          </h1>
          <span
            className={`rounded-md px-2.5 py-0.5 text-xs font-bold text-white ${
              targetUser.activo !== false ? 'bg-emerald-700' : 'bg-slate-600'
            }`}
          >
            {targetUser.activo !== false ? 'Cuenta Activa' : 'Cuenta Inactiva'}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {targetUser.email} {targetUser.dni ? `· DNI ${targetUser.dni}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs font-medium text-foreground">
        <Building2 className="h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
        <span>
          Sede operativa:{' '}
          <strong>{scopedCentroNombre || targetUser.centroSaludNombre || 'Sede actual'}</strong>
        </span>
      </div>

      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {submitError}
        </div>
      )}

      <form
        onSubmit={onFormSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs"
      >
        <fieldset className="space-y-3">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Rol Operativo en la Sede
          </legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CENTER_STAFF_ALLOWED_ROLES.map((opt) => {
              const selected = rol === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border p-3.5 text-xs font-semibold cursor-pointer transition ${
                    selected
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-border bg-background text-foreground hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="edit-staff-rol"
                    value={opt.value}
                    checked={selected}
                    onChange={() => handleRolChange(opt.value as BackendUserRole)}
                    className="h-4 w-4 accent-white"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Shield className="h-4 w-4 text-sky-700" aria-hidden="true" />
              Permisos Granulares del Integrante
            </h2>
            <button
              type="button"
              onClick={applyRoleDefaults}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Aplicar plantilla del rol
            </button>
          </div>

          {catalogoPermisos.length > 0 ? (
            <PermisosMatrixSelector
              catalogo={catalogoPermisos}
              selectedPermisos={permisosSeleccionados}
              onChange={setPermisosSeleccionados}
              rolBase={rol === 'PROFESIONAL' ? 'MEDICO' : rol}
              disabled={saving}
              excludePermissionCodes={excludedPermissions}
            />
          ) : (
            <p className="text-xs text-muted-foreground py-4">
              No hay catálogo de permisos disponible para editar en este momento.
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
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Guardando...' : 'Guardar Rol y Permisos'}
          </button>
        </div>
      </form>
    </div>
  );
};
