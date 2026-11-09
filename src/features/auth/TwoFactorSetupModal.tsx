import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Copy, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { authService, type TwoFactorSetupData } from '@/api/authService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  enabled: boolean;
  onClose: () => void;
  onStatusChange: (enabled: boolean) => void;
  onDisabled: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  enabled,
  onClose,
  onStatusChange,
  onDisabled,
}) => {
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadSetup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      setSetupData(await authService.setup2FA());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la configuración de 2FA.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setCode('');
    setPassword('');
    setError(null);
    setSuccess(false);
    setSetupData(null);
    if (!enabled) {
      void loadSetup();
    }
  }, [isOpen, enabled, loadSetup]);

  const copiar = async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopied(etiqueta);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  const handleActivar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Ingresá el código TOTP de 6 dígitos.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const isConfirmed = await authService.confirm2FA(code.trim());
      if (!isConfirmed) {
        setError('El código ingresado es incorrecto o ha expirado.');
        return;
      }
      setSuccess(true);
      onStatusChange(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo activar 2FA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesactivar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim() && !code.trim()) {
      setError('Ingresá tu contraseña o un código TOTP para desactivar 2FA.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authService.disable2FA(password.trim() || undefined, code.trim() || undefined);
      onStatusChange(false);
      onDisabled();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar 2FA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Autenticación de dos factores</DialogTitle>
              <DialogDescription>
                {enabled
                  ? 'Protegé tu cuenta con un segundo factor de seguridad.'
                  : 'Configurá una aplicación autenticadora para proteger tu cuenta.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {enabled ? (
          <form onSubmit={handleDesactivar} className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              2FA está activo. Para desactivarlo, confirmá con tu contraseña o un código TOTP vigente.
            </div>
            <div className="space-y-1.5">
              <label htmlFor="disable-2fa-password" className="text-xs font-bold text-foreground">
                Contraseña actual
              </label>
              <input
                id="disable-2fa-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="disable-2fa-code" className="text-xs font-bold text-foreground">
                Código TOTP
              </label>
              <input
                id="disable-2fa-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? 'Desactivando...' : 'Desactivar 2FA'}
              </Button>
            </DialogFooter>
          </form>
        ) : isLoading ? (
          <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generando configuración segura...
          </div>
        ) : setupData ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
              <img
                src={setupData.qrCodeUrl}
                alt="Código QR para configurar 2FA"
                className="mx-auto h-44 w-44 rounded-xl border border-border bg-white p-2"
              />
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-foreground">Secreto de configuración</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-lg bg-muted px-2.5 py-2 text-xs">
                      {setupData.secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copiar(setupData.secret, 'secreto')}
                    >
                      {copied === 'secreto' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Escaneá el QR o ingresá el secreto en Google Authenticator, Authy o una aplicación TOTP compatible.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">Códigos de respaldo</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copiar(setupData.backupCodes.join('\n'), 'codigos')}
                >
                  {copied === 'codigos' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-1">Copiar</span>
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-3 font-mono text-xs">
                {setupData.backupCodes.map((backupCode) => (
                  <span key={backupCode}>{backupCode}</span>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Guardalos en un lugar seguro. Cada código se puede usar una sola vez.
              </p>
            </div>

            <form onSubmit={handleActivar} className="space-y-3 border-t border-border pt-4">
              <div className="space-y-1.5">
                <label htmlFor="setup-2fa-code" className="text-xs font-bold text-foreground">
                  Confirmá el código de 6 dígitos
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="setup-2fa-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>
              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4" />
                  2FA quedó activado correctamente.
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cerrar
                </Button>
                <Button type="submit" disabled={isSubmitting || success}>
                  {isSubmitting ? 'Activando...' : 'Activar 2FA'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-rose-600" />
            <p className="text-sm text-muted-foreground">No se pudo generar la configuración.</p>
            <Button type="button" onClick={() => void loadSetup()}>Reintentar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
