import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserCheck, LogOut } from 'lucide-react';
import type { UserRole } from '@/types';

export const PublicNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Quiénes Somos', path: '/#quienes-somos' },
    { name: 'Especialidades', path: '/#especialidades' },
    { name: 'Turnero Online', path: '/turnero' },
  ];

  const getDashboardPath = (rol?: UserRole) => {
    switch (rol) {
      case 'MEDICO':
        return '/dashboard/medico';
      case 'RECEPCIONISTA':
        return '/dashboard/recepcion';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'PACIENTE':
      default:
        return '/dashboard/paciente';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (path.includes('#')) {
      e.preventDefault();
      const hash = path.split('#')[1];
      if (location.pathname === '/') {
        const elem = document.getElementById(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const elem = document.getElementById(hash);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sky-200/70 bg-[#edf5fa]/95 backdrop-blur supports-[backdrop-filter]:bg-[#edf5fa]/80 shadow-xs">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <img src="/logo-icon.png" alt="Luvia Logo" className="h-10 w-10 object-contain drop-shadow-xs" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading leading-tight">
              Luvia <span className="text-xs font-bold text-sky-600">Cruz del Eje</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold leading-none">
              Tu Salud, Unificada
            </span>
          </div>
        </Link>

        {/* Links de Navegación Pública */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path && !link.path.includes('#');
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={`transition-colors hover:text-sky-600 cursor-pointer ${
                  isActive ? 'text-sky-700 font-bold border-b-2 border-sky-600 pb-0.5' : ''
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Estado de Sesión — visible e informativo */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Botón Mi Portal */}
              <Link
                to={getDashboardPath(user.rol)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-800 transition cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Mi Portal</span>
              </Link>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-800 transition cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
