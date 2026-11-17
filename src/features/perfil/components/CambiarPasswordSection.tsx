import React, { useState, useMemo } from 'react';
import { authService } from '@/api/authService';
import { useToast } from '@/context/ToastContext';
import { KeyRound, Lock, Eye, EyeOff, Check, X, ShieldCheck, Loader2 } from 'lucide-react';

export const CambiarPasswordSection: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Criterios de seguridad para la nueva contraseña
  const criteria = useMemo(() => {
    return {
      minLength: nuevaPassword.length >= 8,
      hasUpper: /[A-Z]/.test(nuevaPassword),
      hasLower: /[a-z]/.test(nuevaPassword),
      hasNumber: /[0-9]/.test(nuevaPassword),
      hasSymbol: /[^A-Za-z0-9]/.test(nuevaPassword),
    };
  }, [nuevaPassword]);

  const passedCount = useMemo(() => {
    return Object.values(criteria).filter(Boolean).length;
  }, [criteria]);

  const strength = useMemo(() => {
    if (nuevaPassword.length === 0) return { label: 'Sin ingresar', color: 'bg-slate-200', text: 'text-slate-400' };
    if (passedCount <= 2) return { label: 'Débil', color: 'bg-rose-500', text: 'text-rose-600' };
    if (passedCount === 3 || passedCount === 4) return { label: 'Media', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Muy Fuerte', color: 'bg-emerald-500', text: 'text-emerald-600' };
  }, [passedCount, nuevaPassword]);

  const passwordsMatch = nuevaPassword.length > 0 && nuevaPassword === confirmarPassword;
  const isFormValid = passedCount >= 4 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);

    if (!isFormValid) {
      setMensajeError('Por favor verifica que la nueva contraseña cumpla con los requisitos mínimos y coincida.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.cambiarPassword(passwordActual, nuevaPassword);
      setMensajeExito(res.message || 'Contraseña actualizada correctamente.');
      success('Contraseña modificada con éxito.');
      setPasswordActual('');
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al modificar la contraseña.';
      setMensajeError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Seguridad y Cambio de Contraseña</h2>
          <p className="text-xs text-slate-500">
            Actualiza tu contraseña periódicamente para mantener protegida tu historia clínica y recetas
          </p>
        </div>
      </div>

      {mensajeExito && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {mensajeError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium">
          <X className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{mensajeError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-xl">
        {/* Contraseña Actual */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Contraseña Actual
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type={showActual ? 'text' : 'password'}
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              placeholder="Ingresa tu clave actual (si iniciaste con Google déjalo en blanco)"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowActual(!showActual)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              tabIndex={-1}
            >
              {showActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Si te registraste con Google y nunca definiste una contraseña, puedes dejar este campo vacío.
          </p>
        </div>

        {/* Nueva Contraseña */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Nueva Contraseña</label>
            {nuevaPassword.length > 0 && (
              <span className={`text-[11px] font-bold ${strength.text}`}>
                Nivel: {strength.label}
              </span>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type={showNueva ? 'text' : 'password'}
              required
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowNueva(!showNueva)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              tabIndex={-1}
            >
              {showNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Barra de progreso de fortaleza */}
          {nuevaPassword.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-5 gap-1.5 h-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-full rounded-full transition-all duration-300 ${
                      passedCount >= level ? strength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Lista de requisitos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
                <div className={`flex items-center gap-1.5 ${criteria.minLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {criteria.minLength ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {criteria.hasUpper ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
                  <span>Una mayúscula (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {criteria.hasLower ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
                  <span>Una minúscula (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {criteria.hasNumber ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
                  <span>Un número (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasSymbol ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {criteria.hasSymbol ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
                  <span>Un símbolo (!@#$%...)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar Nueva Contraseña */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Reingresa la nueva clave"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmarPassword.length > 0 && !passwordsMatch && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">
              Las contraseñas no coinciden.
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Actualizando clave...</span>
              </>
            ) : (
              <span>Actualizar Contraseña</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
