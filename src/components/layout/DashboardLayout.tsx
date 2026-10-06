import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ArrowLeft, Sun, Moon, Calendar } from 'lucide-react';
import type { UserRole, Turno } from '@/types';
import { turnosService } from '@/api/turnosService';

export const DashboardLayout: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  // HU-39: Selector de Tema (Modo Oscuro / Claro)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('esu_theme') === 'dark';
  });

  // HU-30: Indicador de Próximo Turno en Topbar
  const [proximoTurno, setProximoTurno] = useState<Turno | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('esu_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('esu_theme', 'light');
    }
  }, [isDarkMode]);

  // Carga del próximo turno para el paciente
  useEffect(() => {
    let isCurrent = true;
    if (user && (user.rol === 'PACIENTE' || user.rol === 'ADMIN')) {
      turnosService.getByPaciente(user.id).then((turnos) => {
        if (!isCurrent) return;
        const activo = turnos.find(
          (t) => t.estado === 'CONFIRMADO' || t.estado === 'EN_ESPERA' || t.estado === 'PENDIENTE'
        );
        setProximoTurno(activo || null);
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [user]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Topbar Superior */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src="/logo-icon.png" alt="Luvia Logo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-foreground font-heading">
                Luvia <span className="text-primary text-xs">Cruz del Eje</span>
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                Tu Salud, Unificada
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-input bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al Portal Público</span>
          </Link>

          {/* HU-30: Indicador de Próximo Turno en Topbar */}
          {proximoTurno && (
            <Link
              to="/dashboard/paciente"
              className="hidden lg:inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-medium hover:bg-primary/20 transition animate-in fade-in"
              title="Ver detalle del próximo turno en Cruz del Eje"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                <strong>Próximo Turno:</strong> {proximoTurno.fecha} ({proximoTurno.hora} hs) — {proximoTurno.profesionalNombre}
              </span>
            </Link>
          )}
        </div>

        {/* Controles de Sesión, Rol Rápido y Tema */}
        <div className="flex items-center gap-2.5">
          {/* HU-39: Selector de Tema (Modo Oscuro / Claro) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Selector interactivo de Rol para pruebas académicas */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <span className="px-1.5 text-muted-foreground font-medium hidden md:inline">Rol:</span>
            {(['PACIENTE', 'MEDICO', 'RECEPCIONISTA', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  switchRole(r);
                  if (r === 'PACIENTE') navigate('/dashboard/paciente');
                  else if (r === 'MEDICO') navigate('/dashboard/medico');
                  else if (r === 'RECEPCIONISTA') navigate('/dashboard/recepcion');
                  else if (r === 'ADMIN') navigate('/dashboard/admin');
                }}
                className={`rounded px-2 py-1 font-medium transition-all cursor-pointer ${
                  user?.rol === r
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Botón Salir */}
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Contenedor Principal: Sidebar + Contenido de la Pantalla */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
