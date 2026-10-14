import React, { useState } from 'react';
import { MOCK_USERS } from '@/api/mockData';
import { authService } from '@/api/authService';
import type { User, UserRole } from '@/types';
import { Search, UserPlus, X, UserX, CheckCircle, Shield } from 'lucide-react';

export const AdminUsuariosPage: React.FC = () => {
  // Inicializamos usuarios garantizando el campo activo (por defecto true si no viene)
  const [usuarios, setUsuarios] = useState<User[]>(() =>
    MOCK_USERS.map((u) => ({ ...u, activo: u.activo !== false }))
  );
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');

  // Estado para Modal de Alta Administrativa (HU-06)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    rol: 'PACIENTE' as UserRole,
    matricula: '',
    especialidad: '',
  });

  const handleCambiarRol = (id: string, nuevoRol: UserRole) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, rol: nuevoRol } : u))
    );
  };

  // HU-10: Baja Lógica / Inactivación y Reactivación de Usuarios
  const handleToggleEstado = (id: string, nombreCompleto: string, estadoActual: boolean) => {
    const accion = estadoActual ? 'dar de baja (inactivar)' : 'reactivar';
    if (window.confirm(`¿Está seguro de que desea ${accion} al usuario ${nombreCompleto}?`)) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, activo: !estadoActual } : u))
      );
    }
  };

  // HU-06: Guardar nuevo usuario (persiste en MySQL en backend /api/auth/registro)
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const idGenerado = `u-admin-${Date.now()}`;
    const usuarioCreado: User = {
      id: idGenerado,
      nombre: nuevoUsuario.nombre.trim(),
      apellido: nuevoUsuario.apellido.trim(),
      dni: nuevoUsuario.dni.trim(),
      email: nuevoUsuario.email.trim(),
      telefono: nuevoUsuario.telefono.trim() || undefined,
      rol: nuevoUsuario.rol,
      matricula: nuevoUsuario.rol === 'MEDICO' ? nuevoUsuario.matricula.trim() : undefined,
      especialidad: nuevoUsuario.rol === 'MEDICO' ? nuevoUsuario.especialidad.trim() : undefined,
      activo: true,
    };

    try {
      await authService.register({
        nombre: usuarioCreado.nombre,
        apellido: usuarioCreado.apellido,
        email: usuarioCreado.email,
        dni: usuarioCreado.dni,
        telefono: usuarioCreado.telefono,
        rol: usuarioCreado.rol,
        password: 'password123',
      });
    } catch {
      // Si el backend no responde, continúa con el estado local
    }

    setUsuarios((prev) => [usuarioCreado, ...prev]);
    setIsModalOpen(false);
    setNuevoUsuario({
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      rol: 'PACIENTE',
      matricula: '',
      especialidad: '',
    });
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

        {/* HU-06: Botón de Alta de Usuarios */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Nuevo Usuario</span>
        </button>
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
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            u.rol === 'ADMIN'
                              ? 'bg-purple-500/10 text-purple-600'
                              : u.rol === 'MEDICO'
                              ? 'bg-blue-500/10 text-blue-600'
                              : u.rol === 'RECEPCIONISTA'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>

                      {/* HU-09: Badge de Estado */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                            estaActivo
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border-border'
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
                          onClick={() => handleToggleEstado(u.id, `${u.nombre} ${u.apellido}`, estaActivo)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                            estaActivo
                              ? 'text-destructive border border-destructive/20 hover:bg-destructive hover:text-white'
                              : 'text-emerald-600 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
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

      {/* HU-06: Modal de Alta Administrativa de Usuarios */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Alta de Usuario en Plataforma</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    placeholder="Ej. Lucas"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Apellido</label>
                  <input
                    type="text"
                    required
                    value={nuevoUsuario.apellido}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    placeholder="Ej. Gómez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">DNI</label>
                  <input
                    type="text"
                    required
                    value={nuevoUsuario.dni}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, dni: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
                    placeholder="Sin puntos"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Teléfono</label>
                  <input
                    type="tel"
                    value={nuevoUsuario.telefono}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    placeholder="03549-..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={nuevoUsuario.email}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                  placeholder="usuario@salud.gob.ar"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Rol Asignado en el Sistema</label>
                <select
                  value={nuevoUsuario.rol}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value as UserRole })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                >
                  <option value="PACIENTE">PACIENTE (Portal de turnos y recetas)</option>
                  <option value="MEDICO">MÉDICO (Agenda y atención clínica)</option>
                  <option value="RECEPCIONISTA">RECEPCIONISTA (Admisión y sala de espera)</option>
                  <option value="ADMIN">ADMIN (Control global del sistema)</option>
                </select>
              </div>

              {nuevoUsuario.rol === 'MEDICO' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="space-y-1">
                    <label className="font-semibold text-blue-700">Matrícula Médica (MP)</label>
                    <input
                      type="text"
                      required
                      value={nuevoUsuario.matricula}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, matricula: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
                      placeholder="Ej: MP-45123"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-blue-700">Especialidad Principal</label>
                    <input
                      type="text"
                      required
                      value={nuevoUsuario.especialidad}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, especialidad: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                      placeholder="Ej: Pediatría"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-input py-2.5 font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer"
                >
                  Dar de Alta Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
