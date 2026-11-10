import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usuariosService } from '@/api/usuariosService';
import { centrosService } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { CentroSalud, User, Permiso } from '@/types';
import { permisosService } from '@/api/permisosService';
import { ModalGestionarPermisosUsuario } from './components/ModalGestionarPermisosUsuario';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertCircle,
  RefreshCw,
  Building2,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const AdminUsuariosPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [cuentaAToggle, setCuentaAToggle] = useState<User | null>(null);
  const [cuentaAEliminar, setCuentaAEliminar] = useState<User | null>(null);
  const [cuentaAPermisos, setCuentaAPermisos] = useState<User | null>(null);
  const [catalogoPermisos, setCatalogoPermisos] = useState<Permiso[]>([]);

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usuariosList, centrosList] = await Promise.all([
        usuariosService.getAll(),
        centrosService.getAll(),
      ]);

      setCentros(centrosList);

      // Mapear cada usuario sin inventar sedes aleatorias
      const mapped: User[] = usuariosList.map((u) => {
        const matchedCentro = u.centroSaludId
          ? centrosList.find((c) => String(c.id) === String(u.centroSaludId))
          : undefined;

        return {
          ...u,
          centroSaludNombre: matchedCentro?.nombre || u.centroSaludNombre || undefined,
        };
      });

      setUsuarios(mapped);
    } catch (err: unknown) {
      setLoadError(
        extractApiErrorMessage(err, 'No se pudieron cargar los usuarios del sistema desde el servidor.')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    permisosService.getCatalogo().then((data) => setCatalogoPermisos(data)).catch(() => {});
  }, [cargarDatos]);

  const handleConfirmarToggle = async () => {
    if (!cuentaAToggle) return;
    const nuevoEstado = !(cuentaAToggle.activo !== false);
    setIsUpdating(true);
    try {
      await usuariosService.cambiarEstado(cuentaAToggle.id, nuevoEstado);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === cuentaAToggle.id ? { ...u, activo: nuevoEstado } : u))
      );
      success(
        nuevoEstado
          ? `Usuario ${cuentaAToggle.email} reactivado correctamente.`
          : `Usuario ${cuentaAToggle.email} desactivado correctamente.`
      );
      setCuentaAToggle(null);
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo actualizar el estado del usuario.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!cuentaAEliminar) return;
    setIsUpdating(true);
    try {
      await usuariosService.eliminar(cuentaAEliminar.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== cuentaAEliminar.id));
      success(`Usuario ${cuentaAEliminar.email} eliminado del sistema.`);
      setCuentaAEliminar(null);
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo eliminar el usuario.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const term = busqueda.toLowerCase();
    const matchBusqueda =
      (u.nombre || '').toLowerCase().includes(term) ||
      (u.apellido || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.dni || '').includes(term) ||
      (u.centroSaludNombre || '').toLowerCase().includes(term);

    const matchRol =
      filtroRol === 'TODOS' ||
      u.rol === filtroRol ||
      (filtroRol === 'MEDICO' && (u.rol === 'MEDICO' || u.rol === 'PROFESIONAL'));

    const matchEstado =
      filtroEstado === 'TODOS' ||
      (filtroEstado === 'ACTIVO' && u.activo !== false) ||
      (filtroEstado === 'INACTIVO' && u.activo === false);

    return matchBusqueda && matchRol && matchEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
            <Users className="h-6 w-6 text-primary" />
            <span>Administración de Usuarios del Sistema</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestión centralizada de cuentas de administradores, médicos y personal de recepción.
          </p>
        </div>

        <Link
          to="/dashboard/admin/usuarios/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Nuevo Usuario</span>
        </Link>
      </div>

      {/* Banner Informativo */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-sky-200 shadow-xs">
        <Shield className="h-5 w-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sky-900 dark:text-sky-100">
            Control de Acceso y Gestión de Identidades (RBAC)
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Puedes habilitar o inhabilitar accesos en tiempo real, asignar centros de salud y dar de alta personal clínico e institucional.
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
            placeholder="Buscar por nombre, apellido, email, DNI o centro de salud..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro Rol */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">Rol:</span>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus:ring-2 focus:ring-primary"
              >
                <option value="TODOS">Todos los roles</option>
                <option value="RECEPCIONISTA">Recepción</option>
                <option value="MEDICO">Profesional Médico</option>
                <option value="ADMIN">Administrador</option>
                <option value="PACIENTE">Paciente</option>
              </select>
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">Estado:</span>
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
                    {est === 'TODOS' ? 'Todos' : est === 'ACTIVO' ? 'Activos' : 'Inactivos'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <span className="text-[11px] text-muted-foreground font-medium">
            {isLoading ? 'Cargando usuarios...' : `${usuariosFiltrados.length} usuarios encontrados`}
          </span>
        </div>
      </div>

      {/* Grid de Cuentas */}
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
      ) : usuariosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No se encontraron usuarios registrados con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {usuariosFiltrados.map((cuenta) => {
            const centroInfo = centros.find((c) => String(c.id) === String(cuenta.centroSaludId));
            const nombreCompleto = cuenta.nombre && cuenta.apellido
              ? `${cuenta.nombre} ${cuenta.apellido}`
              : cuenta.nombre || cuenta.email.split('@')[0];

            return (
              <div
                key={cuenta.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground leading-snug">
                          {nombreCompleto}
                        </h3>
                        <span className="inline-block mt-0.5 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {cuenta.rol}
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
                      {cuenta.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate font-mono">{cuenta.email}</span>
                    </p>
                    {cuenta.dni && (
                      <p className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>DNI: {cuenta.dni}</span>
                      </p>
                    )}
                    {(cuenta.telefono || centroInfo?.telefono) && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{cuenta.telefono || centroInfo?.telefono}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {cuenta.centroSaludNombre || centroInfo?.nombre || 'Sin sede asignada'}
                      </span>
                    </p>
                    {centroInfo?.direccion && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{centroInfo.direccion}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setCuentaAPermisos(cuenta)}
                    className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-input bg-background hover:bg-muted text-foreground transition cursor-pointer"
                    title="Asignar rol y permisos granulares"
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span>Permisos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCuentaAToggle(cuenta)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer border text-center ${
                      cuenta.activo !== false
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {cuenta.activo !== false ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCuentaAEliminar(cuenta)}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación Toggle Estado */}
      {cuentaAToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {cuentaAToggle.activo !== false ? 'Desactivar Usuario' : 'Reactivar Usuario'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cuentaAToggle.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {cuentaAToggle.activo !== false
                ? 'Al desactivar este usuario, no podrá iniciar sesión en la plataforma ni acceder a los recursos del sistema hasta su reactivación.'
                : 'Al reactivar este usuario, recuperará su acceso y permisos en el sistema.'}
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

      {/* Modal de Confirmación Eliminación */}
      {cuentaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Eliminar Usuario
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cuentaAEliminar.email} ({cuentaAEliminar.rol})
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esta acción dará de baja su cuenta y revocarás sus permisos en el sistema.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setCuentaAEliminar(null)}
                className="flex-1 rounded-xl border border-input py-2 text-xs font-semibold hover:bg-accent transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmarEliminar}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition disabled:opacity-50"
              >
                {isUpdating ? 'Eliminando...' : 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
      {cuentaAPermisos && (
        <ModalGestionarPermisosUsuario
          usuario={cuentaAPermisos}
          isOpen={Boolean(cuentaAPermisos)}
          onClose={() => setCuentaAPermisos(null)}
          onGuardado={(actualizado) => {
            setUsuarios((prev) =>
              prev.map((u) => (u.id === actualizado.id ? { ...u, ...actualizado } : u))
            );
            success(`Rol y permisos de ${actualizado.email} actualizados exitosamente.`);
          }}
          catalogoPermisos={catalogoPermisos}
          centros={centros}
        />
      )}
    </div>
  );
};
