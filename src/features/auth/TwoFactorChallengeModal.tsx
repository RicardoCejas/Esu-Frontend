import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setIsBackupCode(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      setError(err instanceof Error ? err.message : 'No se pudo validar el código de seguridad.');
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
                maxLength={isBackupCode ? 8 : 6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                placeholder={isBackupCode ? '12345678' : '123456'}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsBackupCode((prev) => !prev);
              setCode('');
              setError(null);
            }}
            className="text-xs font-semibold text-sky-700 hover:underline"
          >
            {isBackupCode ? 'Usar código TOTP' : 'Usar un código de respaldo'}
          </button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando...' : 'Verificar e ingresar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
