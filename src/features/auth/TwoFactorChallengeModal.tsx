import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { classifyApiError } from '@/api/apiErrors';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { UserRole } from '@/types';

interface TwoFactorChallengeModalProps {
  isOpen: boolean;
  tempToken: string;
  onSuccess: (rol: UserRole) => void;
  onCancel: () => void;
}

export const TwoFactorChallengeModal: React.FC<TwoFactorChallengeModalProps> = ({
  isOpen,
  tempToken,
  onSuccess,
  onCancel,
}) => {
  const { verify2FALogin } = useAuth();
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setIsBackupCode(false);
      setIsExpired(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isExpired) {
      onCancel();
      return;
    }
    const longitud = isBackupCode ? 8 : 6;
    if (!new RegExp(`^\\d{${longitud}}$`).test(code.trim())) {
      setError(isBackupCode
        ? 'Ingresá un código de respaldo de 8 dígitos.'
        : 'Ingresá el código TOTP de 6 dígitos.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await verify2FALogin(tempToken, code.trim(), isBackupCode);
      onSuccess(response.user.rol);
    } catch (err: unknown) {
      const classified = classifyApiError(err, 'No se pudo validar el código de seguridad.');
      const msg = (classified.message || '').toLowerCase();
      const expired =
        classified.status === 401 ||
        classified.status === 410 ||
        msg.includes('expir') ||
        msg.includes('vencid') ||
        (msg.includes('inválid') && (msg.includes('token') || msg.includes('desafío')));

      if (expired) {
        setIsExpired(true);
        setError('El token temporal del desafío ha expirado o no es válido. Por favor, volvé a iniciar sesión.');
      } else {
        setIsExpired(false);
        setError(classified.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Verificación en dos pasos</DialogTitle>
              <DialogDescription>
                Ingresá el código de tu aplicación autenticadora para completar el acceso.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="two-factor-code" className="text-xs font-bold text-foreground">
              {isBackupCode ? 'Código de respaldo' : 'Código de 6 dígitos'}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="two-factor-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                disabled={isSubmitting || isExpired}
                maxLength={isBackupCode ? 8 : 6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                placeholder={isBackupCode ? '12345678' : '123456'}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-sky-600 disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              {isExpired && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  className="mt-1 self-start border-rose-300 bg-white text-rose-800 hover:bg-rose-100"
                >
                  Volver a iniciar sesión
                </Button>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting || isExpired}
            onClick={() => {
              setIsBackupCode((prev) => !prev);
              setCode('');
              setError(null);
            }}
            className="text-xs font-semibold text-sky-700 hover:underline disabled:opacity-50"
          >
            {isBackupCode ? 'Usar código TOTP' : 'Usar un código de respaldo'}
          </button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {isExpired ? 'Cerrar' : 'Cancelar'}
            </Button>
            <Button type="submit" disabled={isSubmitting || isExpired}>
              {isSubmitting ? 'Verificando...' : 'Verificar e ingresar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
