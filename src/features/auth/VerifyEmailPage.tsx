import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '@/api/authService';
import { useAuth } from '@/context/AuthContext';
import { MailCheck, RefreshCw, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccessfully, setVerifiedSuccessfully] = useState(false);

  // Cuenta regresiva estricta de 60 segundos para reenvío (DoD HU-43)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Si viene con token en la URL, verificar automáticamente
  useEffect(() => {
    if (token) {
      setIsVerifying(true);
      authService
        .verifyEmail(token)
        .then(() => {
          setVerifiedSuccessfully(true);
          updateUser({ emailVerified: true });
          setTimeout(() => navigate('/dashboard/paciente'), 3500);
        })
        .catch(() => setError('El enlace de verificación ha expirado o no es válido.'))
        .finally(() => setIsVerifying(false));
    }
  }, [token, navigate, updateUser]);

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError(null);
    try {
      const response = await authService.resendVerificationEmail(user?.email);
      setFeedback(response.message);
      setCountdown(60);
      setCanResend(false);
    } catch {
      setError('Error al solicitar el reenvío del correo.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/20 p-4 sm:p-6 selection:bg-sky-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-sky-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al portal principal</span>
        </Link>

        <div className="rounded-3xl border border-sky-100 bg-card p-6 sm:p-8 shadow-xl space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <MailCheck className="h-8 w-8" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
              {verifiedSuccessfully ? '¡Correo Verificado!' : 'Verifica tu Correo'}
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
              {verifiedSuccessfully
                ? 'Tu dirección de correo ha sido confirmada con éxito.'
                : `Hemos enviado un enlace de confirmación a ${user?.email || 'tu casilla de correo registrada'}.`}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive text-left">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {feedback && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 text-left">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              <p className="text-xs">Confirmando titularidad de la cuenta...</p>
            </div>
          ) : verifiedSuccessfully ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Serás redirigido a tu portal de salud en unos segundos.
              </p>
              <Link
                to="/dashboard/paciente"
                className="inline-block rounded-full bg-sky-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition"
              >
                Ir al Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Por razones de seguridad clínica, debes confirmar la titularidad de tu email para acceder a tus órdenes médicas y recibir avisos de turnos.
              </p>

              {/* Botón con cuenta regresiva de 60 segundos (DoD HU-43) */}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-700 py-3 text-xs font-bold text-sky-700 hover:bg-sky-700 hover:text-white transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Reenviando...</span>
                  </>
                ) : canResend ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reenviar correo de verificación</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reenviar en {countdown}s</span>
                  </>
                )}
              </button>

              <div className="pt-2">
                <Link
                  to="/dashboard/paciente"
                  className="text-xs font-semibold text-muted-foreground hover:text-sky-700 transition"
                >
                  Continuar temporalmente al portal →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
