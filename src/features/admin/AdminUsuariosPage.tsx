import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from '@/api/endpoints';
import { centrosService } from '@/api/centrosService';
import type { CentroSalud, User, UserRole } from '@/types';
import {
  Building2,
  PlusCircle,
  Search,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface RawUsuarioDto {
  id: number | string;
  username?: string;
  email?: string;
  rol?: string;
  activo?: boolean;
  fechaDeAlta?: string;
}

export const AdminUsuariosPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [centrosUsuarios, setCentrosUsuarios] = useState<User[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [cuentaAToggle, setCuentaAToggle] = useState<User | null>(null);

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usuariosRes, centrosList] = await Promise.all([
        apiClient.get<RawUsuarioDto[]>(API_ENDPOINTS.usuarios.todos),
        centrosService.getAll(),
      ]);

      setCentros(centrosList);

      const rawList = Array.isArray(usuariosRes.data) ? usuariosRes.data : [];
      const mapped: User[] = rawList
        .filter((u: RawUsuarioDto) => {
          const rol = (u.rol || '').toUpperCase();
          return rol === 'RECEPCIONISTA' || rol === 'ADMIN' || rol === 'PROFESIONAL' || rol === 'MEDICO';
        })
        .map((u: RawUsuarioDto, idx: number) => {
          const email = u.email || u.username || '';
          const matchedCentro = centrosList[idx % Math.max(centrosList.length, 1)];
          const rolUpper = (u.rol || 'RECEPCIONISTA').toUpperCase();
          const rol: UserRole = rolUpper === 'MEDICO' || rolUpper === 'PROFESIONAL'
            ? 'MEDICO'
            : rolUpper === 'ADMIN'
            ? 'ADMIN'
            : 'RECEPCIONISTA';

          return {
            id: String(u.id),
            nombre: email.split('@')[0] || 'Usuario Institucional',
            apellido: rol,
            email,
            dni: String(u.id),
            telefono: matchedCentro?.telefono || '03549-422001',
            rol,
            centroSaludId: matchedCentro?.id,
            centroSaludNombre: matchedCentro?.nombre || email.split('@')[0],
            activo: u.activo !== false,
          };
        });

      setCentrosUsuarios(mapped);
    } catch (err) {
      setLoadError(
        extractApiErrorMessage(err, 'No se pudieron cargar las cuentas institucionales desde el servidor.')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleConfirmarToggle = async () => {
    if (!cuentaAToggle) return;
    const nuevoEstado = !(cuentaAToggle.activo !== false);
    setIsUpdating(true);
    try {
      await apiClient.patch(API_ENDPOINTS.usuarios.cambiarEstado(cuentaAToggle.id), null, {
        params: { activo: nuevoEstado },
      });
      setCentrosUsuarios((prev) =>
        prev.map((u) => (u.id === cuentaAToggle.id ? { ...u, activo: nuevoEstado } : u))
      );
      success(
        nuevoEstado
          ? `Cuenta ${cuentaAToggle.email} reactivada correctamente.`
          : `Cuenta ${cuentaAToggle.email} desactivada correctamente.`
      );
      setCuentaAToggle(null);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo actualizar el estado de la cuenta.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const cuentasFiltradas = centrosUsuarios.filter((u) => {
    const matchBusqueda =
      (u.centroSaludNombre || u.nombre).toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.telefono || '').includes(busqueda);

    const matchEstado =
      filtroEstado === 'TODOS' ||
      (filtroEstado === 'ACTIVO' && u.activo !== false) ||
      (filtroEstado === 'INACTIVO' && u.activo === false);

    return matchBusqueda && matchEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
            <Building2 className="h-6 w-6 text-primary" />
            <span>Cuentas de Centros de Salud</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            El administrador gestiona y crea las cuentas institucionales de los centros de salud de la red.
          </p>
        </div>

        <Link
          to="/dashboard/admin/usuarios/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Crear Cuenta de Centro de Salud</span>
        </Link>
      </div>

      {/* Banner Informativo de Arquitectura de Roles */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-sky-200 shadow-xs">
        <Shield className="h-5 w-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sky-900 dark:text-sky-100">
            Regla de Autonomía de Gestión Institucional
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Como <strong>Administrador General</strong> creas y habilitas las cuentas institucionales de cada centro de salud. Posteriormente, cada institución ingresa con su cuenta para <strong>agregar a los médicos de su plantel</strong>, <strong>crear sus accesos</strong> y <strong>administrar sus especialidades habilitadas</strong>.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar centro de salud por nombre, email institucional o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Estado de la Cuenta:</span>
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
              {(['TODOS', 'ACTIVO', 'INACTIVO'] as const).map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstado(est)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    filtroEstado === est
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {est === 'TODOS' ? 'Todos' : est === 'ACTIVO' ? 'Activas' : 'Inactivas'}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[11px] text-muted-foreground font-medium">
            {isLoading ? 'Cargando cuentas...' : `${cuentasFiltradas.length} cuentas institucionales registradas`}
          </span>
        </div>
      </div>

      {/* Grid de Cuentas de Centros de Salud */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-7 w-7 text-destructive" />
          <p className="text-xs text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reintentar</span>
          </button>
        </div>
      ) : cuentasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No se encontraron cuentas institucionales registradas con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cuentasFiltradas.map((cuenta) => {
            const centroInfo = centros.find((c) => c.id === cuenta.centroSaludId);
            return (
              <div
                key={cuenta.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground leading-snug">
                          {cuenta.centroSaludNombre || cuenta.nombre}
                        </h3>
                        <span className="inline-block mt-0.5 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {centroInfo?.tipo || cuenta.rol}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        cuenta.activo !== false
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cuenta.activo !== false ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate font-mono">{cuenta.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{cuenta.telefono || centroInfo?.telefono || '03549-422001'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{centroInfo?.direccion || 'Cruz del Eje, Córdoba'}</span>
                    </p>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setCuentaAToggle(cuenta)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      cuenta.activo !== false
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {cuenta.activo !== false ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación Toggle */}
      {cuentaAToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {cuentaAToggle.activo !== false ? 'Desactivar Cuenta Institucional' : 'Reactivar Cuenta Institucional'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cuentaAToggle.centroSaludNombre || cuentaAToggle.nombre}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {cuentaAToggle.activo !== false
                ? 'Al desactivar esta cuenta institucional, el personal del centro de salud no podrá iniciar sesión en la plataforma hasta su reactivación.'
                : 'Al reactivar esta cuenta, el centro de salud recuperará acceso para gestionar turnos y médicos.'}
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setCuentaAToggle(null)}
                className="flex-1 rounded-xl border border-input py-2 text-xs font-semibold hover:bg-accent transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmarToggle}
                className={`flex-1 rounded-xl py-2 text-xs font-bold text-white transition disabled:opacity-50 ${
                  cuentaAToggle.activo !== false ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isUpdating ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
