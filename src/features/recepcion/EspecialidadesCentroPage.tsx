import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useEspecialidadesCentro } from './hooks/useEspecialidadesCentro';
import { EspecialidadesGrid } from './components/EspecialidadesGrid';
import { DoorOpen, Search, RefreshCw, UserPlus } from 'lucide-react';

export const EspecialidadesCentroPage: React.FC = () => {
  const { user } = useAuth();
  const { canAny } = usePermissions();
  const esp = useEspecialidadesCentro(user?.centroSaludId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Especialidades del Centro</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Servicios médicos habilitados y profesionales vinculados en esta sede.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canAny(['MEDICOS_ASIGNAR_CONSULTORIO']) && (
            <Link
              to="/dashboard/recepcion/medicos"
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-input bg-card text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              <UserPlus className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>Vincular Médicos a Especialidades</span>
            </Link>
          )}

          {canAny(['CONSULTORIOS_VER', 'CONSULTORIOS_ADMINISTRAR']) && (
            <Link
              to="/dashboard/recepcion/sede"
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-input bg-card text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              <DoorOpen className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Gestionar Consultorios</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => esp.setFiltroSede('habilitadas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              esp.filtroSede === 'habilitadas'
                ? 'border-sky-600 bg-sky-700 text-white font-bold'
                : 'border-input bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Habilitadas en Sede ({esp.totalHabilitadas})
          </button>
          <button
            type="button"
            onClick={() => esp.setFiltroSede('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              esp.filtroSede === 'todas'
                ? 'border-sky-600 bg-sky-700 text-white font-bold'
                : 'border-input bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Catálogo Completo ({esp.totalCatalogo})
          </button>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              aria-label="Buscar especialidades del centro"
              placeholder="Buscar especialidad..."
              value={esp.busqueda}
              onChange={(e) => esp.setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-input text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => esp.recargar()}
            aria-label="Actualizar especialidades"
            title="Actualizar datos"
            className="min-h-[36px] p-2 border border-input bg-card rounded-xl text-muted-foreground hover:bg-muted cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {esp.loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <EspecialidadesGrid
          especialidades={esp.especialidades}
          getMedicosPorEspecialidad={esp.getMedicosPorEspecialidad}
        />
      )}
    </div>
  );
};
