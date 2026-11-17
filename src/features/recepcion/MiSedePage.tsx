import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import { useMiSede } from './hooks/useMiSede';
import { SedeInfoCard } from './components/SedeInfoCard';
import { ConsultoriosCentroTab } from './components/ConsultoriosCentroTab';

export const MiSedePage: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const canManageSede = can('CONSULTORIOS_ADMINISTRAR');
  const sede = useMiSede(user?.centroSaludId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Sede y Consultorios</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Datos institucionales de contacto, horarios e infraestructura física de consultorios.
          </p>
        </div>
        <button
          type="button"
          onClick={sede.cargarDatos}
          disabled={sede.loading}
          aria-label="Actualizar datos de la sede"
          className="min-h-[38px] inline-flex items-center justify-center rounded-xl border border-input bg-card hover:bg-muted px-3 py-2 text-xs font-semibold text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-primary ${sede.loading ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {sede.errorCarga && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 p-4 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span>{sede.errorCarga}</span>
          </div>
          <button
            type="button"
            onClick={sede.cargarDatos}
            className="rounded-lg bg-rose-700 hover:bg-rose-800 px-3 py-1.5 font-semibold text-white cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {sede.loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="h-7 w-7 text-primary animate-spin" aria-hidden="true" />
          <p className="text-xs font-semibold text-muted-foreground">Cargando información de la sede...</p>
        </div>
      ) : (
        <>
          {sede.centro && (
            <SedeInfoCard
              centro={sede.centro}
              consultoriosCount={sede.consultorios.length}
              canManageSede={canManageSede}
            />
          )}

          <div className="rounded-xl border border-border bg-card p-6">
            <ConsultoriosCentroTab
              consultorios={sede.consultorios}
              canManageSede={canManageSede}
              togglingId={sede.togglingId}
              onToggleEstado={sede.toggleEstadoConsultorio}
              onEliminar={(c) => sede.setConsultorioAEliminar(c)}
            />
          </div>
        </>
      )}

      <ModalConfirmacion
        isOpen={!!sede.consultorioAEliminar}
        onClose={() => sede.setConsultorioAEliminar(null)}
        onConfirm={sede.confirmarEliminarConsultorio}
        title="Dar de baja consultorio"
        description={`¿Confirmás dar de baja el Consultorio ${sede.consultorioAEliminar?.numero ?? ''}? Dejará de figurar para asignaciones de agenda.`}
        confirmText="Dar de baja"
        cancelText="Cancelar"
        variant="danger"
        isLoading={sede.isSaving}
      />
    </div>
  );
};
