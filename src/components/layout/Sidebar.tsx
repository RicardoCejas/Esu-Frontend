import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  FileText,
  Users,
  Building2,
  Stethoscope,
  ShieldCheck,
  Layers,
  ListOrdered,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Pill,
  FileCheck,
  User,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { useProximoTurno } from '@/hooks/useProximoTurno';
import { ROLE_LABELS } from '@/lib/roles';

interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Rutas Paciente (Portal de Salud Unificado)
  { title: 'Turnos', path: '/dashboard/paciente', icon: Calendar, roles: ['PACIENTE'] },
  { title: 'Mi Historia Clínica (HCU)', path: '/dashboard/paciente/historial', icon: FileText, roles: ['PACIENTE'] },
  { title: 'Mis Recetas / Medicación', path: '/dashboard/paciente/recetas', icon: Pill, roles: ['PACIENTE'] },
  { title: 'Estudios y Resultados', path: '/dashboard/paciente/estudios', icon: FileCheck, roles: ['PACIENTE'] },
  { title: 'Centros y Dispensarios', path: '/dashboard/paciente/centros', icon: Building2, roles: ['PACIENTE'] },
  { title: 'Perfil y Contacto', path: '/dashboard/perfil', icon: User, roles: ['PACIENTE'] },

  // Rutas Médico
  { title: 'Agenda Médica', path: '/dashboard/medico', icon: Calendar, roles: ['MEDICO'] },
  { title: 'Atención Clínica', path: '/dashboard/medico/atencion', icon: Stethoscope, roles: ['MEDICO'] },

  // Rutas Recepcionista (HU-53, HU-54, HU-55)
  { title: 'Recepción (Daily Board)', path: '/dashboard/recepcion', icon: Clock, roles: ['RECEPCIONISTA', 'ADMIN'] },
  { title: 'Tablero Kanban Espera', path: '/dashboard/recepcion/kanban', icon: Layers, roles: ['RECEPCIONISTA', 'MEDICO', 'ADMIN'] },
  { title: 'Padrón de Pacientes', path: '/dashboard/recepcion/pacientes', icon: Users, roles: ['RECEPCIONISTA', 'MEDICO', 'ADMIN'] },
  { title: 'Gestión de Turnos', path: '/dashboard/recepcion/turnos', icon: ListOrdered, roles: ['RECEPCIONISTA', 'ADMIN'] },

  // Rutas Administrador (HU-56 & HU-70)
  { title: 'Dashboard y Métricas', path: '/dashboard/admin', icon: Layers, roles: ['ADMIN'] },
  { title: 'Ocupación y Ausentismo', path: '/dashboard/admin/ocupacion-ausentismo', icon: TrendingUp, roles: ['ADMIN'] },
  { title: 'Sedes y Consultorios', path: '/dashboard/admin/sedes', icon: Building2, roles: ['ADMIN'] },
  { title: 'Gestión de Usuarios', path: '/dashboard/admin/usuarios', icon: ShieldCheck, roles: ['ADMIN'] },
  { title: 'Centros y Especialidades', path: '/dashboard/admin/especialidades', icon: Building2, roles: ['ADMIN'] },
];

const INDEX_PATHS = ['/dashboard/paciente', '/dashboard/medico', '/dashboard/recepcion', '/dashboard/admin'];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.rol || 'PACIENTE';
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));
  const proximoTurno = useProximoTurno(user?.id, userRole === 'PACIENTE' || userRole === 'ADMIN');

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      {/* Marca y acceso al Portal Público */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-3.5">
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg transition hover:opacity-90"
        >
          <img src="/logo-icon.png" alt="ESU" className="h-9 w-9 shrink-0 object-contain" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-sm font-bold leading-tight text-foreground">
              ESU <span className="text-xs text-primary">Cruz del Eje</span>
            </span>
            <span className="truncate text-[10px] leading-none text-muted-foreground">
              Ecosistema de Salud Unificado
            </span>
          </div>
        </Link>
        <Link
          to="/"
          title="Volver al Portal Público"
          aria-label="Volver al Portal Público"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-input text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Módulos del Sistema
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={INDEX_PATHS.includes(item.path)}
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

        {/* Próximo Turno (HU-30) */}
        {proximoTurno && (
          <Link
            to="/dashboard/paciente"
            className="block rounded-lg border border-border bg-background p-3 transition hover:border-primary/50"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-700 dark:text-sky-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Próximo Turno
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-foreground">
              {proximoTurno.fecha} · {proximoTurno.hora} hs
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {proximoTurno.profesionalNombre}
            </p>
          </Link>
        )}
      </nav>

      {/* Perfil de usuario → página de perfil */}
      <div className="border-t border-border p-3">
        <NavLink
          to="/dashboard/perfil"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg border p-2.5 transition ${
              isActive
                ? 'border-primary/50 bg-accent'
                : 'border-border bg-background hover:bg-accent'
            }`
          }
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-700 text-sm font-bold text-white">
            {user?.nombre?.charAt(0)}
            {user?.apellido?.charAt(0)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {user?.nombre} {user?.apellido}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.rol ? ROLE_LABELS[user.rol] : ''}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </NavLink>
      </div>
    </aside>
  );
};
