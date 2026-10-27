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
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
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

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('esu_remember_register');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData((prev) => ({
          ...prev,
          nombre: parsed.nombre || '',
          apellido: parsed.apellido || '',
          dni: parsed.dni || '',
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

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.dni.trim() || !formData.email.trim()) {
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
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            email: formData.email,
            telefono: formData.telefono,
          })
        );
      } else {
        localStorage.removeItem('esu_remember_register');
      }

      await register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: formData.dni.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        rol: 'PACIENTE',
      });

      navigate('/verificar-email');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar la cuenta.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsSubmitting(true);
    try {
      await login({
        email: 'paciente.google@gmail.com',
        rolSimulado: 'PACIENTE',
      });
      navigate('/dashboard/paciente');
    } catch {
      setError('Error al registrarse con Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat p-2 sm:p-4 relative overflow-hidden selection:bg-sky-600 selection:text-white"
      style={{ backgroundImage: `url('/auth-bg.webp')` }}
    >
      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 my-auto">
        {/* Cabecera superior compacta */}
        <div className="flex items-center justify-between mb-2 px-1">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al inicio de sesión</span>
          </Link>
          <span className="text-[11px] text-slate-500 font-medium">Luvia • Cruz del Eje</span>
        </div>

        {/* Card compacta que no hace overflow en pantalla */}
        <div className="rounded-2xl border border-sky-100 bg-white/95 px-5 sm:px-7 py-4 sm:py-5 shadow-2xl backdrop-blur-sm space-y-3">
          {/* Encabezado compacto */}
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <img src="/logo-icon.png" alt="Luvia Logo" className="h-10 w-10 object-contain drop-shadow-xs shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
                Registro de Paciente
              </h1>
              <p className="text-[11px] text-slate-600 truncate">
                Crea tu cuenta para gestionar turnos y acceder a tu Historia Clínica Digital
              </p>
            </div>
          </div>

          {/* Botón de Google compacto */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Registrarse con Google</span>
          </button>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider relative">
              o con tus datos
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs text-rose-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
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

            {/* Fila 2: DNI y Teléfono */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">DNI (Sin puntos) *</label>
                <div className="relative">
                  <CreditCard className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="dni"
                    placeholder="38123456"
                    value={formData.dni}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="3549-123456"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                </div>
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

            {/* Fila 4: Doble Password (Contraseña y Confirmar Contraseña lado a lado) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Mín. 8 caract."
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-slate-700">Confirmar Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Repita contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-sky-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist compacto en línea (solo visible al escribir) */}
            {formData.password.length > 0 && (
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 text-[10px] flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
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
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-600 font-medium mt-2">
          ¿Ya tienes cuenta registrada?{' '}
          <Link to="/login" className="font-bold text-sky-700 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
