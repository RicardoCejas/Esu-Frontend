import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LogIn,
  Lock,
  Mail,
  ShieldAlert,
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { TwoFactorChallengeModal } from './TwoFactorChallengeModal';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const redirectUrl = searchParams.get('redirect');

  const [emailOrDni, setEmailOrDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para desafío 2FA bloqueante (HU-42)
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [tempToken2FA, setTempToken2FA] = useState('');

  // Cargar credenciales recordadas (usuario y contraseña)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('esu_remember_login');
      const savedPass = localStorage.getItem('esu_remember_password');
      if (savedUser) {
        setEmailOrDni(savedUser);
        setRememberLogin(true);
      }
      if (savedPass) {
        setPassword(savedPass);
      }
    } catch {
      // Ignore
    }
  }, []);

  const redirectByRole = (rol: UserRole) => {
    if (redirectUrl && redirectUrl.startsWith('/')) {
      navigate(redirectUrl);
      return;
    }
    switch (rol) {
      case 'MEDICO':
        navigate('/dashboard/medico');
        break;
      case 'RECEPCIONISTA':
        navigate('/dashboard/recepcion');
        break;
      case 'ADMIN':
        navigate('/dashboard/admin');
        break;
      case 'PACIENTE':
      default:
        navigate('/dashboard/paciente');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (emailOrDni.toLowerCase().includes('dev@esu.gob.ar')) {
        localStorage.setItem('esu_dev_mode', 'true');
      }
      if (rememberLogin) {
        localStorage.setItem('esu_remember_login', emailOrDni.trim());
        if (password) {
          localStorage.setItem('esu_remember_password', password);
        }
      } else {
        localStorage.removeItem('esu_remember_login');
        localStorage.removeItem('esu_remember_password');
      }

      const authResponse = await login({
        email: emailOrDni || undefined,
        dni: emailOrDni || undefined,
        password: password || undefined,
      });

      if (authResponse.requires2FA && authResponse.tempToken) {
        setTempToken2FA(authResponse.tempToken);
        setIs2FAModalOpen(true);
        return;
      }

      if (authResponse.user) {
        redirectByRole(authResponse.user.rol);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión. Verifique sus credenciales.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const authResponse = await login({
        email: 'paciente.google@gmail.com',
        rolSimulado: 'PACIENTE',
      });
      if (authResponse.user) {
        redirectByRole(authResponse.user.rol);
      }
    } catch {
      setError('No se pudo iniciar sesión con Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 relative selection:bg-sky-600 selection:text-white"
      style={{ backgroundImage: `url('/auth-bg.webp')` }}
    >
      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] pointer-events-none" />

      <div className="w-full max-w-md space-y-4 relative z-10 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 transition px-2 py-1 rounded-md hover:bg-white/60"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <img src="/logo-icon.png" alt="Luvia Logo" className="h-14 w-14 object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-heading text-slate-900">
                Ingreso al Sistema
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Luvia • Cruz del Eje • Tu Salud, Unificada
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 px-4 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider relative">
              o ingresa con tu cuenta
            </span>
          </div>

          {redirectUrl && (
            <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-xs text-sky-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <LogIn className="h-4 w-4 text-sky-700 shrink-0" />
                <span>Identificación requerida para consultar turnos</span>
              </div>
              <p className="text-slate-600">
                Inicia sesión con tu cuenta o{' '}
                <Link
                  to={`/registro?redirect=${encodeURIComponent(redirectUrl)}`}
                  className="font-bold text-sky-700 underline"
                >
                  regístrate como nuevo paciente
                </Link>{' '}
                si aún no tienes usuario.
              </p>
            </div>
          )}

          {reason === 'inactivity' && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Tu sesión se cerró por inactividad preventiva para resguardar tus datos de salud.</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Correo electrónico o DNI
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="ej: 38123456 o usuario@email.com"
                  value={emailOrDni}
                  onChange={(e) => setEmailOrDni(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Contraseña</label>
                <Link
                  to="/recuperar-password"
                  className="text-[11px] font-semibold text-sky-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberLogin"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="rememberLogin" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                Recordar mi usuario y contraseña en este equipo
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>{isSubmitting ? 'Iniciando sesión...' : 'Ingresar a la Plataforma'}</span>
            </button>

            <div className="pt-1.5 text-center">
              <button
                type="button"
                onClick={() => {
                  setEmailOrDni('dev@esu.gob.ar');
                  setPassword('Dev12345!');
                  setRememberLogin(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/80 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition cursor-pointer"
              >
                <span>Cargar credenciales de Desarrollador (dev@esu.gob.ar)</span>
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 font-medium">
          ¿No tienes una cuenta de paciente?{' '}
          <Link
            to={redirectUrl ? `/registro?redirect=${encodeURIComponent(redirectUrl)}` : '/registro'}
            className="font-bold text-sky-700 hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>

      <TwoFactorChallengeModal
        isOpen={is2FAModalOpen}
        tempToken={tempToken2FA}
        onSuccess={(rol) => {
          setIs2FAModalOpen(false);
          redirectByRole(rol);
        }}
        onCancel={() => {
          setIs2FAModalOpen(false);
          setTempToken2FA('');
        }}
      />
    </div>
  );
};
