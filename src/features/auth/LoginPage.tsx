import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Activity, LogIn, Lock, Mail, ShieldAlert, ArrowLeft, User, Stethoscope, UserCheck, Shield } from 'lucide-react';
import type { UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [emailOrDni, setEmailOrDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectByRole = (rol: UserRole) => {
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
      const user = await login({
        email: emailOrDni || undefined,
        dni: emailOrDni || undefined,
        password: password || undefined,
      });

      // Redirección inteligente según el rol registrado en la BD / Mocks
      redirectByRole(user.rol);
    } catch {
      setError('Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      const user = await login({ rolSimulado: role });
      redirectByRole(user.rol);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/20 p-4 sm:p-6 selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Volver */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-teal-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Card de Login */}
        <div className="rounded-3xl border border-teal-100 bg-card p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <img src="/logo-icon.png" alt="Luvia Logo" className="h-16 w-16 object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
                Ingreso al Sistema Luvia
              </h1>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                Tu Salud, Unificada • Cruz del Eje
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario Principal Único: DNI / Email + Contraseña */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Correo electrónico o DNI
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="ej: 38123456 o usuario@email.com"
                  value={emailOrDni}
                  onChange={(e) => setEmailOrDni(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition shadow-inner"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                El sistema detectará automáticamente tu perfil (Paciente, Médico o Administración).
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Contraseña</label>
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Por favor contacte a la mesa de ayuda de Cruz del Eje o ingrese con su DNI.');
                  }}
                  className="text-[11px] font-semibold text-teal-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Ingresar al Sistema'}</span>
            </button>
          </form>

          {/* Acceso Rápido 1-Clic para Evaluación de la Cátedra */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Acceso Rápido para Evaluación:
              </p>
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                1 Clic
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('PACIENTE')}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2.5 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-foreground transition cursor-pointer"
              >
                <User className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="truncate">👤 Paciente</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('MEDICO')}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2.5 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-foreground transition cursor-pointer"
              >
                <Stethoscope className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="truncate">🩺 Médico</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('RECEPCIONISTA')}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2.5 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-foreground transition cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="truncate">📋 Recepción</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2.5 hover:border-teal-500 hover:bg-teal-50/50 font-semibold text-foreground transition cursor-pointer"
              >
                <Shield className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="truncate">🛡️ Administrador</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ¿No tienes una cuenta de paciente?{' '}
          <Link to="/registro" className="font-bold text-teal-700 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
