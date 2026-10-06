import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  FileText,
  Users,
  Building2,
  Stethoscope,
  ShieldCheck,
  PlusCircle,
  Layers,
  ListOrdered
} from 'lucide-react';
import type { UserRole } from '@/types';

interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Rutas Paciente
  { title: 'Mis Turnos', path: '/dashboard/paciente', icon: Calendar, roles: ['PACIENTE'] },
  { title: 'Solicitar Turno', path: '/turnero', icon: PlusCircle, roles: ['PACIENTE'] },
  { title: 'Mi Historia Clínica (HCU)', path: '/dashboard/paciente/historial', icon: FileText, roles: ['PACIENTE'] },

  // Rutas Médico
  { title: 'Agenda Médica', path: '/dashboard/medico', icon: Calendar, roles: ['MEDICO'] },
  { title: 'Atención Clínica', path: '/dashboard/medico/atencion', icon: Stethoscope, roles: ['MEDICO'] },

  // Rutas Recepcionista
  { title: 'Sala de Espera', path: '/dashboard/recepcion', icon: Clock, roles: ['RECEPCIONISTA'] },
  { title: 'Padrón de Pacientes', path: '/dashboard/recepcion/pacientes', icon: Users, roles: ['RECEPCIONISTA', 'MEDICO', 'ADMIN'] },
  { title: 'Gestión de Turnos', path: '/dashboard/recepcion/turnos', icon: ListOrdered, roles: ['RECEPCIONISTA'] },

  // Rutas Administrador
  { title: 'Panel de Control', path: '/dashboard/admin', icon: Layers, roles: ['ADMIN'] },
  { title: 'Gestión de Usuarios', path: '/dashboard/admin/usuarios', icon: ShieldCheck, roles: ['ADMIN'] },
  { title: 'Centros y Especialidades', path: '/dashboard/admin/especialidades', icon: Building2, roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.rol || 'PACIENTE';

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 border-r border-border bg-card/40 backdrop-blur-sm flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Perfil Mini */}
        <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
              {user?.nombre.charAt(0)}
              {user?.apellido.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {user?.nombre} {user?.apellido}
              </span>
              <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
                Rol: {user?.rol}
              </span>
            </div>
          </div>
          {user?.matricula && (
            <div className="mt-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
              Matrícula: <span className="font-mono text-foreground">{user.matricula}</span>
            </div>
          )}
        </div>

        {/* Lista de Navegación Dinámica */}
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Módulos del Sistema
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard/paciente' || item.path === '/dashboard/medico' || item.path === '/dashboard/recepcion' || item.path === '/dashboard/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Info Institucional */}
      <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
          <img src="/logo-icon.png" alt="Luvia Logo" className="h-3.5 w-3.5 object-contain" />
          <span>Luvia v1.0.0</span>
        </div>
        <p className="text-[11px]">Cruz del Eje - Tu Salud, Unificada</p>
      </div>
    </aside>
  );
};
