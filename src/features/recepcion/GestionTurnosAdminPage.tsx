import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, CalendarPlus, Flame, Building2 } from 'lucide-react';
import { ModalCancelarMostrador } from './components/ModalCancelarMostrador';
import { useGestionTurnosAdmin } from './hooks/useGestionTurnosAdmin';
import { TurnosFiltersBar } from './components/TurnosFiltersBar';
import { TurnosAdminTable } from './components/TurnosAdminTable';
import { usePermissions } from '@/hooks/usePermissions';

export const GestionTurnosAdminPage: React.FC = () => {
  const {
    turnosFiltrados,
    isLoading,
    loadError,
    isProcessing,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    turnoACancelar,
    setTurnoACancelar,
    cargarTurnos,
    limpiarFiltros,
    handleTurnoCancelado,
    handleCheckIn,
    handleMarcarAusente,
    esRecepcionista,
    centroSaludNombre,
  } = useGestionTurnosAdmin();
  const { can } = usePermissions();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {esRecepcionista ? 'Gestión de Turnos' : 'Gestión Central de Turnos'}
            </h1>
            {centroSaludNombre && (
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                <Building2 className="h-3 w-3" />
                <span>{centroSaludNombre}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {esRecepcionista
              ? 'Supervisión de turnos de mostrador, reprogramación, sala de espera y cancelaciones de la sede.'
              : 'Supervisión global del sistema, reprogramación y cancelaciones administrativas.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {can('SOBRETURNOS_CREAR') && (
            <Link
              to="/dashboard/recepcion/turnos/sobreturno"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-3.5 py-2 text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
            >
              <Flame className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              <span>Sobreturno</span>
            </Link>
          )}

          {can('TURNOS_CREAR') && (
            <Link
              to="/dashboard/recepcion/turnos/nuevo"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Nuevo Turno</span>
            </Link>
          )}
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={cargarTurnos}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      <div className="shadow-xs rounded-xl overflow-hidden">
        <TurnosFiltersBar
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtroEstado={filtroEstado}
          onFiltroEstadoChange={setFiltroEstado}
          fechaDesde={fechaDesde}
          onFechaDesdeChange={setFechaDesde}
          fechaHasta={fechaHasta}
          onFechaHastaChange={setFechaHasta}
          onLimpiarFiltros={limpiarFiltros}
        />

        <TurnosAdminTable
          turnos={turnosFiltrados}
          isLoading={isLoading}
          isProcessing={isProcessing}
          onCancelar={(t) => setTurnoACancelar(t)}
          onCheckIn={handleCheckIn}
          onMarcarAusente={handleMarcarAusente}
          canCancelar={can('TURNOS_CANCELAR')}
          canReagendar={can('TURNOS_REAGENDAR')}
          canCheckIn={can('SALA_ESPERA_GESTIONAR')}
        />
      </div>

      <ModalCancelarMostrador
        turno={turnoACancelar}
        isOpen={Boolean(turnoACancelar)}
        onClose={() => setTurnoACancelar(null)}
        onCancelado={handleTurnoCancelado}
      />
    </div>
  );
};
