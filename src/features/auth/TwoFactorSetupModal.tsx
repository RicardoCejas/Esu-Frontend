import React, { useState, useEffect } from 'react';
import { authService, type TwoFactorSetupData } from '@/api/authService';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Copy, Check, AlertTriangle, Key, Loader2, X } from 'lucide-react';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [code, setCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setCode('');
      setIsLoading(true);
      authService
        .setup2FA()
        .then((data) => setSetupData(data))
        .catch(() => setError('Error al generar la clave secreta de 2FA.'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Por favor ingresa un código numérico de 6 dígitos.');
      return;
    }

    setError(null);
    setIsVerifying(true);
    try {
      await authService.confirm2FA(code.trim());
      updateUser({ twoFactorEnabled: true });
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Código de verificación incorrecto.';
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-card p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground">
              Autenticación en Dos Pasos (2FA)
            </h2>
            <p className="text-xs text-muted-foreground">
              Protege tu cuenta con Google Authenticator o Authy
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            <p className="text-xs">Generando credencial criptográfica TOTP...</p>
          </div>
        ) : success ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">¡2FA Activado Exitosamente!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Tu cuenta de {user?.rol} ahora cuenta con un segundo factor de autenticación obligatorio al iniciar sesión.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-full bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-700 transition cursor-pointer"
            >
              Finalizar y Volver
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Paso 1: Escaneo de QR */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-bold text-foreground">
                Paso 1: Escanea el código QR con tu aplicación autenticadora
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center py-2">
                {setupData?.qrCodeUrl && (
                  <div className="p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <img
                      src={setupData.qrCodeUrl}
                      alt="Código QR 2FA TOTP"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                )}
                <div className="space-y-2 text-xs text-muted-foreground max-w-xs">
                  <p>
                    Abre <strong>Google Authenticator</strong> o <strong>Authy</strong> en tu teléfono y escanea la imagen.
                  </p>
                  <p className="text-[11px]">
                    ¿No puedes escanear el QR? Copia esta clave manual en tu app:
                  </p>
                  <div className="flex items-center gap-1.5 bg-background p-2 rounded-xl border border-input font-mono text-[11px] select-all">
                    <Key className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">{setupData?.secret}</span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="ml-auto text-sky-700 hover:text-sky-900 cursor-pointer"
                      title="Copiar clave"
                    >
                      {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 2: Códigos de Respaldo */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">
                  Paso 2: Guarda tus códigos de respaldo de emergencia (8 dígitos)
                </span>
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  {copiedCodes ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCodes ? 'Copiados' : 'Copiar todos'}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-800">
                Podrás usar cada código una sola vez si pierdes acceso a tu teléfono celular:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-center text-xs font-semibold text-amber-950">
                {setupData?.backupCodes.map((codeItem, idx) => (
                  <span key={idx} className="bg-muted text-foreground py-1 px-1.5 rounded-lg border border-border">
                    {codeItem}
                  </span>
                ))}
              </div>
            </div>

            {/* Paso 3: Confirmación Reactiva con Input de 6 Dígitos */}
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Paso 3: Ingresa el código de 6 dígitos generado por tu app
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="ej: 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-sky-600 focus:outline-none transition"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-bold hover:bg-muted transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || code.length !== 6}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-sky-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {isVerifying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirmar y Activar 2FA</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
