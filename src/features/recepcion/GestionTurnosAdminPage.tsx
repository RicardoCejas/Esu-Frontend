import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import { useGestionTurnosAdmin } from './hooks/useGestionTurnosAdmin';
import { TurnosFiltersBar } from './components/TurnosFiltersBar';
import { TurnosAdminTable } from './components/TurnosAdminTable';
import { ReagendarTurnoModal } from './components/ReagendarTurnoModal';

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
    turnoAReagendar,
    setTurnoAReagendar,
    nuevaFecha,
    setNuevaFecha,
    nuevaHora,
    setNuevaHora,
    turnoACancelar,
    setTurnoACancelar,
    cargarTurnos,
    limpiarFiltros,
    handleConfirmarCancelacion,
    handleConfirmarReagendamiento,
    esRecepcionista,
    centroSaludNombre,
  } = useGestionTurnosAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {esRecepcionista && centroSaludNombre
            ? `Gestión de Turnos — ${centroSaludNombre}`
            : 'Gestión Central de Turnos'}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {esRecepcionista
            ? 'Supervisión de turnos de mostrador, reprogramación y cancelaciones del centro de salud.'
            : 'Supervisión global del sistema, reprogramación y cancelaciones administrativas.'}
        </p>
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
        onReagendar={(t) => {
          setTurnoAReagendar(t);
          setNuevaFecha(t.fecha ?? '');
          setNuevaHora(t.hora ?? '');
        }}
        onCancelar={(t) => setTurnoACancelar(t)}
      />

      {turnoAReagendar && (
        <ReagendarTurnoModal
          turno={turnoAReagendar}
          nuevaFecha={nuevaFecha}
          onNuevaFechaChange={setNuevaFecha}
          nuevaHora={nuevaHora}
          onNuevaHoraChange={setNuevaHora}
          isProcessing={isProcessing}
          onConfirm={handleConfirmarReagendamiento}
          onClose={() => setTurnoAReagendar(null)}
        />
      )}

      <ModalConfirmacion
        isOpen={Boolean(turnoACancelar)}
        onClose={() => setTurnoACancelar(null)}
        onConfirm={handleConfirmarCancelacion}
        title="Cancelar Turno Administrativamente"
        description={
          turnoACancelar
            ? `¿Desea cancelar el turno de ${turnoACancelar.pacienteNombre ?? 'el paciente'} para el día ${turnoACancelar.fecha ?? ''} a las ${turnoACancelar.hora ?? ''} hs? Esta acción anulará la reserva en el sistema.`
            : '¿Desea cancelar este turno?'
        }
        confirmText="Confirmar Cancelación"
        cancelText="Volver"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};
