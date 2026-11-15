import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';
import { profesionalesService } from '@/api/profesionalesService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useEspecialidadesCentro } from './hooks/useEspecialidadesCentro';
import { EspecialidadesGrid } from './components/EspecialidadesGrid';
import { DoorOpen, Search, RefreshCw, UserPlus, Plus, X } from 'lucide-react';

export const EspecialidadesCentroPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { canAny } = usePermissions();
  const esp = useEspecialidadesCentro(user?.centroSaludId);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [creando, setCreando] = useState(false);

  const handleCrearEspecialidad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNombre.trim()) return;
    setCreando(true);
    try {
      await profesionalesService.createEspecialidad({
        nombre: nuevaNombre.trim(),
        descripcion: nuevaDesc.trim() || 'Atención médica especializada.',
      });
      success(`Especialidad "${nuevaNombre.trim()}" creada correctamente.`);
      setNuevaNombre('');
      setNuevaDesc('');
      setModalOpen(false);
      esp.recargar();
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo crear la especialidad médica.'));
    } finally {
      setCreando(false);
    }
  };

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
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Nueva Especialidad</span>
          </button>

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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Nueva Especialidad Médica</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCrearEspecialidad} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nombre de la Especialidad *</label>
                <input
                  type="text"
                  required
                  value={nuevaNombre}
                  onChange={(e) => setNuevaNombre(e.target.value)}
                  placeholder="ej: Cardiología Infantil"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                  placeholder="Descripción breve del servicio asistencial..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={creando}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creando}
                  className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                >
                  {creando ? 'Guardando...' : 'Crear Especialidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
