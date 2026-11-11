import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import { usePersonalCentro } from './hooks/usePersonalCentro';
import { PersonalCentroFiltersBar } from './components/PersonalCentroFiltersBar';
import { PersonalCentroTable } from './components/PersonalCentroTable';

export const PersonalCentroPage: React.FC = () => {
  const { user } = useAuth();
  const state = usePersonalCentro(user);
  const toggleActivo = state.cuentaAToggle?.activo !== false;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Personal del Centro</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cuentas de recepción y profesionales vinculadas a {user?.centroSaludNombre || 'esta institución'}.
          </p>
        </div>
        <Link
          to="/dashboard/recepcion/personal/nuevo"
          className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 px-4 py-2 text-xs font-semibold text-white transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span>Nuevo Integrante</span>
        </Link>
      </div>

      <PersonalCentroFiltersBar
        busqueda={state.busqueda}
        onBusquedaChange={state.setBusqueda}
        filtroRol={state.filtroRol}
        onFiltroRolChange={state.setFiltroRol}
        filtroEstado={state.filtroEstado}
        onFiltroEstadoChange={state.setFiltroEstado}
        isLoading={state.isLoading}
        onRefresh={state.cargarDatos}
      />

      {state.loadError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 p-4 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" aria-hidden="true" />
          <span>{state.loadError}</span>
        </div>
      )}

      {state.isLoading ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <RefreshCw className="h-7 w-7 text-primary animate-spin" aria-hidden="true" />
          <p className="text-xs font-semibold text-muted-foreground">Cargando personal de la sede...</p>
        </div>
      ) : (
        <PersonalCentroTable
          staff={state.personalFiltrado}
          currentUser={user}
          onToggleEstado={state.setCuentaAToggle}
          onEliminar={state.setCuentaAEliminar}
        />
      )}
      <ModalConfirmacion isOpen={!!state.cuentaAToggle} onClose={() => state.setCuentaAToggle(null)} onConfirm={state.confirmarToggleEstado} title={toggleActivo ? 'Desactivar cuenta' : 'Reactivar cuenta'} description={`¿Confirmás ${toggleActivo ? 'desactivar' : 'reactivar'} el acceso de ${state.cuentaAToggle?.email ?? ''}?`} confirmText={toggleActivo ? 'Desactivar' : 'Reactivar'} variant="warning" isLoading={state.isSaving} />
      <ModalConfirmacion isOpen={!!state.cuentaAEliminar} onClose={() => state.setCuentaAEliminar(null)} onConfirm={state.confirmarEliminar} title="Eliminar cuenta del centro" description={`¿Confirmás eliminar permanentemente la cuenta ${state.cuentaAEliminar?.email ?? ''}?`} confirmText="Eliminar" variant="danger" isLoading={state.isSaving} />
    </div>
  );
};
