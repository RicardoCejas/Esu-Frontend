import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { pacientesService } from '@/api/pacientesService';

interface ModalVerificarCarnetQRProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalVerificarCarnetQR: React.FC<ModalVerificarCarnetQRProps> = ({
  isOpen,
  onClose,
}) => {
  const [payload, setPayload] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<'VALIDO' | 'INVALIDO' | null>(null);

  if (!isOpen) return null;

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.trim()) return;
    setVerificando(true);
    setResultado(null);
    try {
      const esValido = await pacientesService.verificarCarnet(payload.trim());
      setResultado(esValido ? 'VALIDO' : 'INVALIDO');
    } catch {
      setResultado('INVALIDO');
    } finally {
      setVerificando(false);
    }
  };

  const handleReset = () => {
    setPayload('');
    setResultado(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <h3 className="font-bold text-sm text-foreground">Verificador Criptográfico de Carnet QR</h3>
          </div>
          <button type="button" onClick={handleReset} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Ingresá o escaneá el código QR del carnet digital del paciente para verificar su firma criptográfica HMAC en el servidor.
        </p>

        <form onSubmit={handleVerificar} className="space-y-3">
          <div>
            <label htmlFor="qr-payload-input" className="block text-xs font-semibold text-foreground mb-1">
              Contenido QR / Token:
            </label>
            <textarea
              id="qr-payload-input"
              rows={3}
              required
              placeholder="Pegá o escaneá el texto del código QR aquí..."
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={verificando || !payload.trim()}
            className="w-full py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition cursor-pointer"
          >
            {verificando ? 'Verificando con Servidor...' : 'Verificar Autenticidad'}
          </button>
        </form>

        {resultado === 'VALIDO' && (
          <div className="p-3 rounded-xl border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5 text-xs font-semibold animate-in zoom-in-95">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Firma digital válida. El carnet corresponde a un paciente activo y verificado en la red ESU.</span>
          </div>
        )}

        {resultado === 'INVALIDO' && (
          <div className="p-3 rounded-xl border border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-center gap-2.5 text-xs font-semibold animate-in zoom-in-95">
            <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>Carnet inválido o firma alterada. Rechazá la credencial y solicitá documento de identidad oficial.</span>
          </div>
        )}
      </div>
    </div>
  );
};
