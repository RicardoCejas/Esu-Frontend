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
import { GoogleAuthButton } from './components/GoogleAuthButton';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const redirectUrl = searchParams.get('redirect');

  const [emailOrDni, setEmailOrDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDevRole, setSelectedDevRole] = useState<UserRole>('ADMIN');

  // Cargar usuario recordado
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('esu_remember_login');
      if (savedUser) {
        setEmailOrDni(savedUser);
        setRememberLogin(true);
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
      if (rememberLogin) {
        localStorage.setItem('esu_remember_login', emailOrDni.trim());
      } else {
        localStorage.removeItem('esu_remember_login');
      }

      const authResponse = await login({
        email: emailOrDni || undefined,
        dni: emailOrDni || undefined,
        password: password || undefined,
      });

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
                Recordar mi usuario en este equipo
              </label>
            </div>

            {/* Selector interactivo para testing de roles con dev@esu.gob.ar */}
            {emailOrDni.trim().toLowerCase() === 'dev@esu.gob.ar' && (
              <div className="rounded-xl border border-sky-300 bg-sky-50/90 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-sky-900">
                  <span>Modo Desarrollador Activo</span>
                  <span className="text-sky-600 font-mono">dev@esu.gob.ar</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Seleccione el rol del sistema a probar:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {(['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedDevRole(r)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                        selectedDevRole === r
                          ? 'bg-sky-700 text-white shadow-xs'
                          : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>{isSubmitting ? 'Iniciando sesión...' : 'Ingresar a la Plataforma'}</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 font-bold text-slate-400">O continuar con</span>
              </div>
            </div>

            <GoogleAuthButton
              onSuccess={(user) => redirectByRole(user.rol)}
              onError={(msg) => setError(msg)}
            />
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
    </div>
  );
};
