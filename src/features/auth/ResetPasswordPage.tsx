import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/api/authService';
import { Lock, Check, X, ArrowLeft, CheckCircle2, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || 'demo-token';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cálculo en tiempo real de criterios de fortaleza de contraseña (HU-43)
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSymbol: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const strengthScore = useMemo(() => {
    const checks = Object.values(passwordCriteria);
    const passed = checks.filter(Boolean).length;
    return passed; // 0 a 5
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 2) return { text: 'Débil', color: 'bg-rose-500', textColor: 'text-rose-600' };
    if (strengthScore === 3 || strengthScore === 4) return { text: 'Moderada', color: 'bg-amber-500', textColor: 'text-amber-600' };
    return { text: 'Muy Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  }, [strengthScore]);

  const isFormValid = strengthScore >= 4 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'El enlace de recuperación es inválido o ha expirado.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/20 p-4 sm:p-6 selection:bg-sky-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-sky-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al login</span>
        </Link>

        <div className="rounded-3xl border border-sky-100 bg-card p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
              Nueva Contraseña
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Define una nueva clave robusta para proteger tu cuenta médica.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-foreground">¡Contraseña Actualizada!</h3>
              <p className="text-xs text-muted-foreground">
                Tu clave ha sido restablecida correctamente. Redirigiendo a la pantalla de inicio de sesión...
              </p>
              <Link
                to="/login"
                className="inline-block rounded-full bg-sky-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition"
              >
                Ingresar Ahora
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 transition shadow-inner"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Indicador de Fortaleza en Tiempo Real (DoD HU-43) */}
                {newPassword && (
                  <div className="space-y-2 pt-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Nivel de seguridad:</span>
                      <span className={`font-bold ${strengthLabel.textColor}`}>{strengthLabel.text}</span>
                    </div>
                    <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 transition-all duration-300 ${
                            level <= strengthScore ? strengthLabel.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Checklist interactivo */}
                    <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMinLength ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {passwordCriteria.hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Mínimo 8 caracteres</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpperCase ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {passwordCriteria.hasUpperCase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Una mayúscula</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {passwordCriteria.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Al menos un número</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSymbol ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {passwordCriteria.hasSymbol ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Un símbolo especial</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 transition shadow-inner"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-destructive">Las contraseñas ingresadas no coinciden.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando contraseña...</span>
                  </>
                ) : (
                  <span>Restablecer y Guardar Contraseña</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
