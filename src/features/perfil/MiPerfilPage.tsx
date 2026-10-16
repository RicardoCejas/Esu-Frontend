import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { ROLE_HOME, ROLE_LABELS, USER_ROLES } from '@/lib/roles';
import {
  Mail,
  Phone,
  Fingerprint,
  ShieldCheck,
  BadgeCheck,
  Stethoscope,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import type { UserRole } from '@/types';

interface DatoPerfil {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
];

export const MiPerfilPage: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const datos: DatoPerfil[] = [
    { icon: Fingerprint, label: 'DNI', value: user?.dni },
    { icon: Mail, label: 'Correo electrónico', value: user?.email },
    { icon: Phone, label: 'Teléfono', value: user?.telefono },
    { icon: ShieldCheck, label: 'Obra social', value: user?.obraSocial },
    { icon: BadgeCheck, label: 'Matrícula profesional', value: user?.matricula },
    { icon: Stethoscope, label: 'Especialidad', value: user?.especialidad },
  ].filter((d) => Boolean(d.value));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (rol: UserRole) => {
    switchRole(rol);
    navigate(ROLE_HOME[rol]);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Perfil</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Consultá tus datos personales, ajustá la apariencia del sistema y gestioná tu sesión.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Identidad */}
        <section className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <header className="flex items-center gap-4 border-b border-border p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-lg font-bold text-white">
              {user?.nombre?.charAt(0)}
              {user?.apellido?.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground">
                {user?.nombre} {user?.apellido}
              </h2>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <span className="mt-1.5 inline-block rounded-md bg-sky-700 px-2 py-0.5 text-[11px] font-bold text-white">
                {user?.rol ? ROLE_LABELS[user.rol] : '—'}
              </span>
            </div>
          </header>

          <div className="divide-y divide-border">
            {datos.map((dato) => {
              const Icon = dato.icon;
              return (
                <div key={dato.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <span className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {dato.label}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">{dato.value}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Preferencias y sesión */}
        <div className="space-y-6">
          {/* Apariencia */}
          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Apariencia</h2>
              <p className="text-xs text-muted-foreground">Elegí el tema de la interfaz.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    aria-pressed={isActive}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Modo demostración */}
          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Modo demostración</h2>
              <p className="text-xs text-muted-foreground">
                Cambiá de rol para revisar los módulos del sistema.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {USER_ROLES.map((rol) => {
                const isActive = user?.rol === rol;
                return (
                  <button
                    key={rol}
                    type="button"
                    onClick={() => handleSwitchRole(rol)}
                    aria-pressed={isActive}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {ROLE_LABELS[rol]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sesión */}
          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Sesión</h2>
              <p className="text-xs text-muted-foreground">
                Cerrá sesión en este dispositivo.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-rose-800"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
