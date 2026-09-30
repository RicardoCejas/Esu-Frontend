import React, { useState } from 'react';
import { MOCK_USERS } from '@/api/mockData';
import type { User, UserRole } from '@/types';
import { Search } from 'lucide-react';

export const AdminUsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>(MOCK_USERS);
  const [busqueda, setBusqueda] = useState('');

  const handleCambiarRol = (id: string, nuevoRol: UserRole) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, rol: nuevoRol } : u))
    );
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.dni.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestión de Usuarios y Permisos (RBAC)
          </h1>
          <p className="text-xs text-muted-foreground">
            Asignación de roles, permisos perimetrales y control de accesos.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por Nombre, DNI, Email o Rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">DNI</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol Asignado</th>
                <th className="p-4 text-right">Modificar Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="p-4 font-bold text-foreground">
                    {u.nombre} {u.apellido}
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
                  <td className="p-4 text-right">
                    <select
                      value={u.rol}
                      onChange={(e) => handleCambiarRol(u.id, e.target.value as UserRole)}
                      className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold focus:ring-primary"
                    >
                      <option value="PACIENTE">PACIENTE</option>
                      <option value="MEDICO">MEDICO</option>
                      <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
