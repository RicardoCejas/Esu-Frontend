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
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/20 p-4 sm:p-6 selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-teal-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio de sesión</span>
        </Link>

        <div className="rounded-3xl border border-teal-100 bg-card p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 shadow-inner">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
              Recuperar Contraseña
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Ingresa tu correo registrado para enviarte un enlace de restablecimiento seguro.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {feedbackMessage ? (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs text-emerald-900 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-emerald-950 mb-1">Solicitud procesada</p>
                  <p>{feedbackMessage}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                ¿No recibiste el correo? Revisa tu casilla de correo no deseado (spam) o intenta nuevamente en unos minutos.
              </p>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 transition"
              >
                Regresar a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Correo electrónico registrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="ej: usuario@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition shadow-inner"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Por seguridad, la plataforma nunca confirmará si una cuenta existe o no.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando enlace seguro...</span>
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
