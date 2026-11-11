import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usuariosService } from '@/api/usuariosService';
import { centrosService } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { CentroSalud, User } from '@/types';
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
  Stethoscope,
  ShieldCheck,
  User as UserIcon,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  IdCard,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

type ModoVista = 'lista' | 'tarjetas';

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
  const [modoVista, setModoVista] = useState<ModoVista>('lista');

  const [cuentaAToggle, setCuentaAToggle] = useState<User | null>(null);
  const [cuentaAEliminar, setCuentaAEliminar] = useState<User | null>(null);

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usuariosList, centrosList] = await Promise.all([
        usuariosService.getAll(),
        centrosService.getAll(),
      ]);

      setCentros(centrosList);

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

  // Contadores por rol
  const conteosPorRol = useMemo(() => {
    const admin = usuarios.filter((u) => u.rol === 'ADMIN').length;
    const medico = usuarios.filter((u) => u.rol === 'MEDICO' || u.rol === 'PROFESIONAL').length;
    const recepcion = usuarios.filter((u) => u.rol === 'RECEPCIONISTA').length;
    const paciente = usuarios.filter((u) => u.rol === 'PACIENTE').length;
    return {
      TODOS: usuarios.length,
      ADMIN: admin,
      MEDICO: medico,
      RECEPCIONISTA: recepcion,
      PACIENTE: paciente,
    };
  }, [usuarios]);

  // Filtrado general
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const term = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !term ||
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
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  // Grupos por cada rol para la visualización organizada
  const gruposRoles = useMemo(() => {
    const grupos = [
      {
        id: 'ADMIN',
        titulo: 'Administradores del Sistema',
        descripcion: 'Cuentas con control total, gestión de sedes, centros y permisos institucionales',
        icono: ShieldCheck,
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
        usuarios: usuariosFiltrados.filter((u) => u.rol === 'ADMIN'),
      },
      {
        id: 'MEDICO',
        titulo: 'Profesionales Médicos',
        descripcion: 'Médicos de planta y especialistas con agenda de atención y firma de evoluciones',
        icono: Stethoscope,
        badgeColor: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
        usuarios: usuariosFiltrados.filter((u) => u.rol === 'MEDICO' || u.rol === 'PROFESIONAL'),
      },
      {
        id: 'RECEPCIONISTA',
        titulo: 'Personal de Recepción y Ventanilla',
        descripcion: 'Operadores de admisión, acreditación en sala de espera y asignación de turnos',
        icono: Building2,
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        usuarios: usuariosFiltrados.filter((u) => u.rol === 'RECEPCIONISTA'),
      },
      {
        id: 'PACIENTE',
        titulo: 'Pacientes Registrados',
        descripcion: 'Ciudadanos habilitados para reserva de turnos, recetas y portal de salud',
        icono: UserIcon,
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        usuarios: usuariosFiltrados.filter((u) => u.rol === 'PACIENTE'),
      },
    ];

    if (filtroRol === 'TODOS') {
      return grupos.filter((g) => g.usuarios.length > 0);
    }
    return grupos.filter((g) => g.id === filtroRol);
  }, [usuariosFiltrados, filtroRol]);

  const getRolBadge = (rol?: string) => {
    switch (rol) {
      case 'ADMIN':
        return {
          label: 'ADMINISTRADOR',
          className: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/70 dark:text-purple-200',
        };
      case 'MEDICO':
      case 'PROFESIONAL':
        return {
          label: 'MÉDICO',
          className: 'bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950/70 dark:text-sky-200',
        };
      case 'RECEPCIONISTA':
        return {
          label: 'RECEPCIÓN',
          className: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/70 dark:text-amber-200',
        };
      case 'PACIENTE':
      default:
        return {
          label: 'PACIENTE',
          className: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-200',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Principal con letra clara y grande */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3 font-heading">
            <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <span>Administración de Usuarios del Sistema</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestión centralizada de cuentas por roles: administradores, profesionales médicos, personal de recepción y pacientes.
          </p>
        </div>

        <Link
          to="/dashboard/admin/usuarios/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Nuevo Usuario</span>
        </Link>
      </div>

      {/* Banner Informativo */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-sky-200 bg-sky-50/80 p-4.5 text-sm text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200 shadow-xs">
        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sm sm:text-base text-sky-900 dark:text-sky-100">
            Control de Acceso y Gestión de Identidades (RBAC)
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Habilitá o desactivá accesos en tiempo real, asigná centros de salud y organizá el personal del sistema por cada rol operativo.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span className="font-medium">{loadError}</span>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Barra de Filtros y Selector de Lista por Rol */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        {/* Buscador grande y claro */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, email, DNI o centro de salud..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-12 pr-4 py-3 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        {/* LISTA DE PESTAÑAS POR CADA ROL */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Seleccionar lista de rol:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'TODOS', label: 'Todos los Roles', icono: Users, count: conteosPorRol.TODOS },
              { id: 'ADMIN', label: 'Administradores', icono: ShieldCheck, count: conteosPorRol.ADMIN },
              { id: 'MEDICO', label: 'Médicos', icono: Stethoscope, count: conteosPorRol.MEDICO },
              { id: 'RECEPCIONISTA', label: 'Recepción', icono: Building2, count: conteosPorRol.RECEPCIONISTA },
              { id: 'PACIENTE', label: 'Pacientes', icono: UserIcon, count: conteosPorRol.PACIENTE },
            ].map((tab) => {
              const TabIcon = tab.icono;
              const isSelected = filtroRol === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFiltroRol(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <TabIcon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-extrabold ${
                      isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background text-muted-foreground border border-border/80'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controles de Estado y Modo de Vista */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60 text-xs sm:text-sm">
          {/* Filtro Estado */}
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-muted-foreground text-xs sm:text-sm">Estado de Cuenta:</span>
            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
              {(['TODOS', 'ACTIVO', 'INACTIVO'] as const).map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstado(est)}
                  className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                    filtroEstado === est
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {est === 'TODOS' ? 'Todos' : est === 'ACTIVO' ? 'Activos' : 'Inactivos'}
                </button>
              ))}
            </div>
          </div>

          {/* Selector Modo Vista y Conteo */}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {isLoading ? 'Cargando...' : `${usuariosFiltrados.length} usuarios`}
            </span>

            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setModoVista('lista')}
                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  modoVista === 'lista'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vista en Lista detallada"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>

              <button
                type="button"
                onClick={() => setModoVista('tarjetas')}
                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  modoVista === 'tarjetas'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor de Listas por Rol */}
      {isLoading ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground">Cargando usuarios del sistema...</span>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-base font-bold text-foreground">No se encontraron usuarios</p>
          <p className="text-sm text-muted-foreground">
            No hay registros que coincidan con la búsqueda o el rol seleccionado.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {gruposRoles.map((grupo) => {
            const GrupoIcon = grupo.icono;

            return (
              <section key={grupo.id} className="space-y-3.5">
                {/* Encabezado de la Lista de cada Rol */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b-2 border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <GrupoIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading">
                          {grupo.titulo}
                        </h2>
                        <span className="rounded-full bg-primary/15 text-primary px-3 py-0.5 text-xs font-extrabold">
                          {grupo.usuarios.length}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {grupo.descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vista en Lista (Modo por defecto: súper clara, legible y ordenada) */}
                {modoVista === 'lista' ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                    <div className="divide-y divide-border/60">
                      {grupo.usuarios.map((cuenta) => {
                        const centroInfo = centros.find((c) => String(c.id) === String(cuenta.centroSaludId));
                        const nombreCompleto =
                          cuenta.nombre && cuenta.apellido
                            ? `${cuenta.nombre} ${cuenta.apellido}`
                            : cuenta.nombre || cuenta.email.split('@')[0];
                        const badgeInfo = getRolBadge(cuenta.rol);
                        const isActivo = cuenta.activo !== false;

                        return (
                          <div
                            key={cuenta.id}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-muted/30 transition"
                          >
                            {/* Información Principal con letra grande */}
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40 shrink-0 mt-0.5">
                                <GrupoIcon className="h-6 w-6" />
                              </div>

                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base sm:text-lg font-bold text-foreground leading-snug">
                                    {nombreCompleto}
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-extrabold border ${badgeInfo.className}`}
                                  >
                                    {badgeInfo.label}
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-extrabold ${
                                      isActivo
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    }`}
                                  >
                                    {isActivo ? (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Activo</span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="h-3.5 w-3.5" />
                                        <span>Inactivo</span>
                                      </>
                                    )}
                                  </span>
                                </div>

                                {/* Datos secundarios con tipografía 14px (text-sm) muy legible */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 pt-1 text-sm text-foreground/80 font-medium">
                                  <p className="flex items-center gap-2 truncate">
                                    <Mail className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate font-mono">{cuenta.email}</span>
                                  </p>

                                  {cuenta.dni ? (
                                    <p className="flex items-center gap-2">
                                      <IdCard className="h-4 w-4 text-primary shrink-0" />
                                      <span>DNI: {cuenta.dni}</span>
                                    </p>
                                  ) : (
                                    <p className="flex items-center gap-2 text-muted-foreground text-xs">
                                      <IdCard className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                                      <span>Sin DNI registrado</span>
                                    </p>
                                  )}

                                  <p className="flex items-center gap-2 truncate">
                                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate">
                                      {cuenta.centroSaludNombre || centroInfo?.nombre || 'Sin sede asignada'}
                                    </span>
                                  </p>

                                  {(cuenta.telefono || centroInfo?.telefono) && (
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-primary shrink-0" />
                                      <span>{cuenta.telefono || centroInfo?.telefono}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => setCuentaAToggle(cuenta)}
                                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border ${
                                  isActivo
                                    ? 'border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                    : 'border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                }`}
                              >
                                {isActivo ? 'Desactivar' : 'Reactivar'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setCuentaAEliminar(cuenta)}
                                className="p-2 rounded-xl border border-border text-muted-foreground hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Vista en Tarjetas Amplias con letra grande */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {grupo.usuarios.map((cuenta) => {
                      const centroInfo = centros.find((c) => String(c.id) === String(cuenta.centroSaludId));
                      const nombreCompleto =
                        cuenta.nombre && cuenta.apellido
                          ? `${cuenta.nombre} ${cuenta.apellido}`
                          : cuenta.nombre || cuenta.email.split('@')[0];
                      const badgeInfo = getRolBadge(cuenta.rol);
                      const isActivo = cuenta.activo !== false;

                      return (
                        <div
                          key={cuenta.id}
                          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/50 transition-all space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100 shrink-0">
                                  <GrupoIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-base sm:text-lg text-foreground leading-snug">
                                    {nombreCompleto}
                                  </h3>
                                  <span
                                    className={`inline-block mt-1 rounded-md px-2.5 py-0.5 text-xs font-bold border ${badgeInfo.className}`}
                                  >
                                    {badgeInfo.label}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${
                                  isActivo
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                }`}
                              >
                                {isActivo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm text-foreground/80 font-medium pt-2 border-t border-border/60">
                              <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate font-mono">{cuenta.email}</span>
                              </p>
                              {cuenta.dni && (
                                <p className="flex items-center gap-2">
                                  <IdCard className="h-4 w-4 text-primary shrink-0" />
                                  <span>DNI: {cuenta.dni}</span>
                                </p>
                              )}
                              {(cuenta.telefono || centroInfo?.telefono) && (
                                <p className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-primary shrink-0" />
                                  <span>{cuenta.telefono || centroInfo?.telefono}</span>
                                </p>
                              )}
                              <p className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">
                                  {cuenta.centroSaludNombre || centroInfo?.nombre || 'Sin sede asignada'}
                                </span>
                              </p>
                              {centroInfo?.direccion && (
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span className="truncate">{centroInfo.direccion}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Botones de Acción */}
                          <div className="pt-3 border-t border-border flex items-center justify-between gap-2.5">
                            <button
                              type="button"
                              onClick={() => setCuentaAToggle(cuenta)}
                              className={`flex-1 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border ${
                                isActivo
                                  ? 'border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                  : 'border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              }`}
                            >
                              {isActivo ? 'Desactivar' : 'Activar'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setCuentaAEliminar(cuenta)}
                              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
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
              </section>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación Toggle Estado */}
      {cuentaAToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-7 w-7 text-amber-500 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {cuentaAToggle.activo !== false ? 'Desactivar Usuario' : 'Reactivar Usuario'}
                </h3>
                <p className="text-sm font-mono text-muted-foreground">
                  {cuentaAToggle.email}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {cuentaAToggle.activo !== false
                ? 'Al desactivar este usuario, no podrá iniciar sesión en la plataforma ni acceder a los recursos del sistema hasta su reactivación.'
                : 'Al reactivar este usuario, recuperará su acceso y permisos en el sistema.'}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setCuentaAToggle(null)}
                className="flex-1 rounded-xl border border-input py-2.5 text-sm font-bold hover:bg-accent transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmarToggle}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${
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
              <AlertCircle className="h-7 w-7 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Eliminar Usuario
                </h3>
                <p className="text-sm font-mono text-muted-foreground">
                  {cuentaAEliminar.email} ({cuentaAEliminar.rol})
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esta acción dará de baja su cuenta y revocarás sus permisos en el sistema.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setCuentaAEliminar(null)}
                className="flex-1 rounded-xl border border-input py-2.5 text-sm font-bold hover:bg-accent transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmarEliminar}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 transition disabled:opacity-50"
              >
                {isUpdating ? 'Eliminando...' : 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
