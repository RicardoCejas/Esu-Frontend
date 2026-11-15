import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  UserPlus,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { isGoogleAuthEnabled } from './googleGsi';
import { extractApiErrorMessage } from '@/api/endpoints';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

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

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberFields, setRememberFields] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleAuthEnabled = isGoogleAuthEnabled({
    VITE_GOOGLE_AUTH_ENABLED: import.meta.env.VITE_GOOGLE_AUTH_ENABLED,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('esu_remember_register');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData((prev) => ({
          ...prev,
          nombre: parsed.nombre || '',
          apellido: parsed.apellido || '',
          email: parsed.email || '',
          telefono: parsed.telefono || '',
        }));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
  const passwordsMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;
  const isPasswordValid = hasMinLength && hasNumber && hasUpperCase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      setError('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    if (!isPasswordValid) {
      setError('La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula y un número.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (rememberFields) {
        localStorage.setItem(
          'esu_remember_register',
          JSON.stringify({
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            email: formData.email.trim(),
            telefono: formData.telefono.trim(),
          })
        );
      } else {
        localStorage.removeItem('esu_remember_register');
      }

      await register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: '',
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        rol: 'PACIENTE',
        activo: true,
      });

      // Ingreso directo inmediato sin requerir confirmación por email
      navigate('/dashboard/paciente');
    } catch (err: unknown) {
      const message = extractApiErrorMessage(err, 'Error al registrar el paciente.');
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

      <main id="main-content" className="w-full max-w-lg space-y-3 relative z-10 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 hover:text-sky-800 transition px-3 py-1.5 rounded-xl hover:bg-white/80 shadow-xs"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Volver al inicio</span>
        </Link>

        <div className="rounded-3xl border border-sky-100 bg-white/95 p-5 sm:p-7 shadow-2xl backdrop-blur-sm space-y-4">
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <img src="/logo-icon.png" alt="Luvia Logo" width="48" height="48" className="h-12 w-12 object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Registro de Paciente
              </h1>
              <p className="text-[11px] text-slate-600">
                Crea tu cuenta ciudadana para gestionar turnos y acceder a tus recetas
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{error}</span>
                {error.toLowerCase().includes('registrado') && (
                  <p className="mt-0.5 font-medium">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="font-semibold text-rose-800 underline hover:text-rose-950">
                      Inicia sesión aquí
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Fila 1: Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">Nombre *</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">Apellido *</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Teléfono */}
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-slate-700">Teléfono (Opcional)</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Ej: 3549-123456"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            {/* Fila 3: Correo Electrónico */}
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-slate-700">Correo electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="juan.perez@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            {/* Fila 4: Doble Password */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-700 transition cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">Confirmar *</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-700 transition cursor-pointer p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist de requisitos de contraseña */}
            {formData.password.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] py-1 px-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className={`inline-flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  {hasMinLength ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
                  8+ letras
                </span>

                <span className={`inline-flex items-center gap-1 ${hasUpperCase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  {hasUpperCase ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
                  Mayúscula
                </span>

                <span className={`inline-flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  {hasNumber ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
                  Número
                </span>

                <span className={`inline-flex items-center gap-1 ${hasSpecialChar ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {hasSpecialChar ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <span className="text-slate-300">•</span>}
                  Especial (opc)
                </span>

                {formData.confirmPassword.length > 0 && (
                  <span className={`inline-flex items-center gap-1 font-bold ${passwordsMatch ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {passwordsMatch ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
                    {passwordsMatch ? 'Coinciden' : 'No coinciden'}
                  </span>
                )}
              </div>
            )}

            {/* Recordar campos en este equipo */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberFields"
                checked={rememberFields}
                onChange={(e) => setRememberFields(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 h-3.5 w-3.5 cursor-pointer"
              />
              <label htmlFor="rememberFields" className="text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                Recordar mis datos en este equipo
              </label>
            </div>

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid || (formData.confirmPassword.length > 0 && !passwordsMatch)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Registrando paciente...' : 'Crear Cuenta de Paciente'}</span>
            </button>

            {googleAuthEnabled && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2 font-bold text-slate-400">O registrarse con</span>
                  </div>
                </div>

                <GoogleAuthButton
                  mode="signup"
                  onSuccess={(user) => redirectByRole(user.rol)}
                  onError={(msg) => setError(msg)}
                />
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm sm:text-[15px] text-slate-700 font-medium mt-3">
          ¿Ya tienes cuenta registrada?{' '}
          <Link to="/login" className="font-bold text-sky-700 hover:text-sky-900 underline underline-offset-2">
            Inicia sesión aquí
          </Link>
        </p>
      </main>
    </div>
  );
};
