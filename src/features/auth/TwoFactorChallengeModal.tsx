import React, { useState } from 'react';
import { authService } from '@/api/authService';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, KeyRound, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '@/types';

interface TwoFactorChallengeModalProps {
  isOpen: boolean;
  tempToken: string;
  onSuccess: (role: UserRole) => void;
  onCancel: () => void;
}

export const TwoFactorChallengeModal: React.FC<TwoFactorChallengeModalProps> = ({
  isOpen,
  tempToken,
  onSuccess,
  onCancel,
}) => {
  const { updateUser } = useAuth();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim();
    if (!useBackupCode && cleanCode.length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos de tu app autenticadora.');
      return;
    }
    if (useBackupCode && cleanCode.length !== 8) {
      setError('El código de respaldo debe tener exactamente 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authData = await authService.verify2FALogin(tempToken, cleanCode, useBackupCode);
      updateUser(authData.user);
      onSuccess(authData.user.rol);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Código incorrecto o expirado.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-teal-200/50 bg-card p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-inner">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold font-heading text-foreground">
            Verificación en Dos Pasos
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {useBackupCode
              ? 'Ingresa uno de tus códigos de respaldo de emergencia (8 dígitos)'
              : 'Ingresa el código temporal de 6 dígitos generado por tu app autenticadora'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <input
              type="text"
              maxLength={useBackupCode ? 8 : 6}
              placeholder={useBackupCode ? 'ej: 82947192' : '000000'}
              value={code}
              onChange={(e) =>
                setCode(useBackupCode ? e.target.value.toUpperCase().slice(0, 8) : e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className="w-full text-center tracking-[0.35em] font-mono text-2xl py-3 rounded-2xl border border-input bg-background focus:ring-2 focus:ring-teal-500 focus:outline-none transition shadow-inner"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (useBackupCode ? code.length !== 8 : code.length !== 6)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Verificar y Continuar</span>
              </>
            )}
          </button>
        </form>

        {/* Opción de contingencia: código de respaldo de 8 dígitos (DoD HU-42) */}
        <div className="border-t border-border pt-4 text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
              setError(null);
            }}
            className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
          >
            {useBackupCode
              ? '← Volver a ingresar código TOTP de 6 dígitos'
              : '¿No tienes acceso a tu app autenticadora? Usar código de respaldo de 8 dígitos'}
          </button>

          <div>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Cancelar y volver al login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
