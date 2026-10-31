import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, Stethoscope, Building2, Shield, Code2 } from 'lucide-react';
import type { UserRole } from '@/types';

export const DevRoleSwitcher: React.FC = () => {
  const { user, switchRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // El panel de desarrollador solo debe figurar si el usuario está activamente autenticado en la cuenta dev
  const isDev =
    isAuthenticated &&
    !!user &&
    (user.isDeveloper === true ||
      user.email === 'dev@esu.gob.ar' ||
      user.email?.toLowerCase().startsWith('dev@') ||
      (localStorage.getItem('esu_dev_mode') === 'true' && user.email?.toLowerCase().includes('dev')));

  if (!isDev) {
    return null;
  }

  const roles: { id: UserRole; label: string; path: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'PACIENTE', label: 'Paciente', path: '/dashboard/paciente', icon: User },
    { id: 'MEDICO', label: 'Médico', path: '/dashboard/medico', icon: Stethoscope },
    { id: 'RECEPCIONISTA', label: 'Centro Médico', path: '/dashboard/recepcion', icon: Building2 },
    { id: 'ADMIN', label: 'Administrador', path: '/dashboard/admin', icon: Shield },
  ];

  const handleSwitch = (role: UserRole, path: string) => {
    switchRole(role);
    navigate(path);
  };

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-sky-300/60 bg-slate-900/95 text-white px-3 py-1 text-xs shadow-md backdrop-blur-xs">
      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 mr-1 shrink-0">
        <Code2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Modo Dev:</span>
      </div>

      <div className="flex items-center gap-1">
        {roles.map((r) => {
          const isActive = user?.rol === r.id;
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSwitch(r.id, r.path)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={`Ver vistas y funciones de ${r.label}`}
            >
              <Icon className="h-3 w-3" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
