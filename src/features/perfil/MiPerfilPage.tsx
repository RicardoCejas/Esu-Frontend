import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { ROLE_HOME, ROLE_LABELS, USER_ROLES } from '@/lib/roles';
import { TwoFactorSetupModal } from '@/features/auth/TwoFactorSetupModal';
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
  Sparkles,
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
  { value: 'high-contrast', label: 'Alto Contraste', icon: Sparkles },
];

export const MiPerfilPage: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [is2FAOpen, setIs2FAOpen] = useState(false);

  const datos: DatoPerfil[] = [
    { icon: Fingerprint, label: 'DNI', value: user?.dni },
    { icon: Mail, label: 'Correo electrónico', value: user?.email },
    { icon: Phone, label: 'Teléfono', value: user?.telefono },
    { icon: ShieldCheck, label: 'Obra social', value: user?.obraSocial },
    { icon: BadgeCheck, label: 'Matrícula profesional', value: user?.matricula },
    { icon: Stethoscope, label: 'Especialidad', value: user?.especialidad },
  ].filter((d) => Boolean(d.value));

  const handleLogout = async () => {
    await logout();
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
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    aria-pressed={isActive}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Escala Tipográfica (Accesibilidad A11y)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold font-mono">
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`rounded-lg border py-1.5 transition cursor-pointer ${
                    fontSize === 'normal'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-foreground hover:bg-accent'
                  }`}
                >
                  Normal (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`rounded-lg border py-1.5 transition cursor-pointer text-sm ${
                    fontSize === 'large'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-foreground hover:bg-accent'
                  }`}
                >
                  Grande (A+)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`rounded-lg border py-1.5 transition cursor-pointer text-base ${
                    fontSize === 'xlarge'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-foreground hover:bg-accent'
                  }`}
                >
                  Extra (A++)
                </button>
              </div>
            </div>
          </section>

          {/* Seguridad (HU-42) */}
          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Seguridad</h2>
              <p className="text-xs text-muted-foreground">
                Protegé tu cuenta con verificación en dos pasos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIs2FAOpen(true)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2.5 text-xs font-semibold text-foreground transition hover:bg-accent"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span>Autenticación en dos pasos</span>
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${
                  user?.twoFactorEnabled ? 'bg-emerald-700' : 'bg-slate-500'
                }`}
              >
                {user?.twoFactorEnabled ? 'Activo' : 'Inactivo'}
              </span>
            </button>
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

      <TwoFactorSetupModal isOpen={is2FAOpen} onClose={() => setIs2FAOpen(false)} />
    </div>
  );
};
