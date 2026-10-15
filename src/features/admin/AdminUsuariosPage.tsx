import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_USERS } from '@/api/mockData';
import type { User, UserRole } from '@/types';
import { Search, UserPlus, UserX, CheckCircle, Shield, AlertTriangle } from 'lucide-react';

export const AdminUsuariosPage: React.FC = () => {
  // Inicializamos usuarios garantizando el campo activo (por defecto true si no viene)
  const [usuarios, setUsuarios] = useState<User[]>(() =>
    MOCK_USERS.map((u) => ({ ...u, activo: u.activo !== false }))
  );
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');

  // Estado para confirmación accesible de baja/reactivación
  const [usuarioAToggle, setUsuarioAToggle] = useState<{
    id: string;
    nombreCompleto: string;
    activo: boolean;
  } | null>(null);

  const handleCambiarRol = (id: string, nuevoRol: UserRole) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, rol: nuevoRol } : u))
    );
  };

  // HU-10: Baja Lógica / Inactivación y Reactivación de Usuarios
  const handleConfirmarToggle = () => {
    if (!usuarioAToggle) return;
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioAToggle.id ? { ...u, activo: !usuarioAToggle.activo } : u))
    );
    setUsuarioAToggle(null);
  };

  // HU-08 & HU-09: Filtrado combinado por texto, rol y estado activo/inactivo
  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.dni.includes(busqueda);

    const matchRol = filtroRol === 'TODOS' || u.rol === filtroRol;

    const matchEstado =
      filtroEstado === 'TODOS' ||
      (filtroEstado === 'ACTIVO' && u.activo !== false) ||
      (filtroEstado === 'INACTIVO' && u.activo === false);

    return matchBusqueda && matchRol && matchEstado;
  });

  const totalActivos = usuarios.filter((u) => u.activo !== false).length;
  const totalInactivos = usuarios.filter((u) => u.activo === false).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Gestión de Usuarios y Permisos (RBAC)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Alta administrativa, asignación de roles, baja lógica y control perimetral de accesos.
          </p>
        </div>

        {/* HU-06: Botón de Alta de Usuarios (Navega a página independiente) */}
        <Link
          to="/dashboard/admin/usuarios/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Nuevo Usuario</span>
        </Link>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por Nombre, DNI, Email o Matrícula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filtros HU-09: Estado Activo / Inactivo y Roles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Estado:</span>
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setFiltroEstado('TODOS')}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  filtroEstado === 'TODOS'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos ({usuarios.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('ACTIVO')}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  filtroEstado === 'ACTIVO'
                    ? 'bg-emerald-500/10 text-emerald-600 font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Activos ({totalActivos})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('INACTIVO')}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  filtroEstado === 'INACTIVO'
                    ? 'bg-destructive/10 text-destructive font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Inactivos ({totalInactivos})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Filtrar por Rol:</span>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1 text-xs font-semibold focus:ring-primary"
            >
              <option value="TODOS">Todos los Roles</option>
              <option value="PACIENTE">Pacientes</option>
              <option value="MEDICO">Médicos</option>
              <option value="RECEPCIONISTA">Recepción</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* HU-07: Tabla de Usuarios */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">DNI</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol Asignado</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Cambiar Rol</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No se encontraron usuarios que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const estaActivo = u.activo !== false;
                  return (
                    <tr key={u.id} className={`hover:bg-muted/30 transition ${!estaActivo ? 'opacity-60 bg-muted/10' : ''}`}>
                      <td className="p-4 font-bold text-foreground">
                        <div>
                          <span>{u.nombre} {u.apellido}</span>
                          {u.matricula && (
                            <span className="block text-[11px] font-mono text-primary font-normal">
                              {u.matricula}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono">{u.dni}</td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs ${
                            u.rol === 'ADMIN'
                              ? 'bg-purple-800'
                              : u.rol === 'MEDICO'
                              ? 'bg-sky-700'
                              : u.rol === 'RECEPCIONISTA'
                              ? 'bg-amber-600'
                              : 'bg-emerald-700'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>

                      {/* HU-09: Badge de Estado */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs ${
                            estaActivo ? 'bg-emerald-700' : 'bg-slate-700'
                          }`}
                        >
                          {estaActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.rol}
                          disabled={!estaActivo}
                          onChange={(e) => handleCambiarRol(u.id, e.target.value as UserRole)}
                          className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold focus:ring-primary disabled:opacity-50"
                        >
                          <option value="PACIENTE">PACIENTE</option>
                          <option value="MEDICO">MEDICO</option>
                          <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      {/* HU-10: Baja Lógica / Desactivar */}
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setUsuarioAToggle({ id: u.id, nombreCompleto: `${u.nombre} ${u.apellido}`, activo: estaActivo })}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                            estaActivo
                              ? 'text-rose-700 border border-rose-300 bg-rose-50 hover:bg-rose-700 hover:text-white dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-200'
                              : 'text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-700 hover:text-white dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-200'
                          }`}
                          title={estaActivo ? 'Dar de baja al usuario' : 'Reactivar usuario'}
                        >
                          {estaActivo ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              <span>Dar de Baja</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Reactivar</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Accesible de Confirmación de Baja / Reactivación */}
      {usuarioAToggle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${usuarioAToggle.activo ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {usuarioAToggle.activo ? 'Inactivar Usuario (Baja Lógica)' : 'Reactivar Usuario'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {usuarioAToggle.nombreCompleto}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {usuarioAToggle.activo
                ? 'El usuario perderá acceso inmediato para iniciar sesión en la plataforma y sus funciones quedarán suspendidas.'
                : 'El usuario recuperará sus permisos y podrá ingresar normalmente al sistema.'}
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUsuarioAToggle(null)}
                className="flex-1 rounded-lg border border-input bg-background py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarToggle}
                className={`flex-1 rounded-lg py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm ${
                  usuarioAToggle.activo
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {usuarioAToggle.activo ? 'Confirmar Baja' : 'Confirmar Reactivación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
