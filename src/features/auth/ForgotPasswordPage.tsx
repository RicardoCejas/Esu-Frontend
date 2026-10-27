import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/api/authService';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación estricta de sintaxis de correo electrónico (HU-43)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un correo electrónico con formato válido (ejemplo: usuario@dominio.com).');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      // Feedback no revelador de cuentas para prevenir enumeración de usuarios (DoD HU-43)
      setFeedbackMessage(response.message);
    } catch {
      setFeedbackMessage(
        'Si el correo electrónico se encuentra registrado en nuestro sistema, recibirás un enlace con las instrucciones para restablecer tu contraseña.'
      );
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
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 transition px-2 py-1 rounded-md hover:bg-white/60"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio de sesión</span>
        </Link>

        <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-inner">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight font-heading text-slate-900">
              Recuperar Contraseña
            </h1>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Ingresa tu correo registrado para enviarte un enlace de restablecimiento seguro.
            </p>
          </div>

          {feedbackMessage ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Solicitud procesada</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {feedbackMessage}
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="block text-center text-xs font-bold text-emerald-800 hover:underline"
                >
                  Regresar a la pantalla de ingreso
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Enviar Enlace de Recuperación</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
