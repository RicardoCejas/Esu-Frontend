import React, { useState, useRef, useEffect } from 'react';
import {
  FileCheck,
  PenTool,
  X,
  Eraser,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { clinicaService } from '@/api/clinicaService';
import type { ConsentimientoInformado } from '@/types';

interface InformedConsentModalProps {
  pacienteId: string | number;
  profesionalId: string | number;
  pacienteNombre?: string;
  abierto: boolean;
  onCerrar: () => void;
  onConsentimientoFirmado?: (consentimiento: ConsentimientoInformado) => void;
  procedimientoInicial?: string;
}

const TEXTO_LEGAL_BASE = `De conformidad con lo dispuesto por la Ley Nacional N° 26.529 de Derechos del Paciente en su Relación con los Profesionales e Instituciones de la Salud, y su Decreto Reglamentario N° 1089/2012:

1. Declaro haber recibido información suficiente, clara, precisa y adecuada respecto al procedimiento médico propuesto, sus objetivos, beneficios esperados, alternativas terapéuticas viables y eventuales riesgos, molestias y efectos adversos previsibles.
2. He tenido la oportunidad de formular todas las preguntas necesarias, habiendo sido evacuadas satisfactoriamente por el profesional actuante.
3. Comprendo que este consentimiento puede ser revocado en cualquier momento antes de la realización del acto médico.
4. Manifiesto en forma libre y voluntaria mi plena conformidad con la práctica médica precedentemente descripta, estampando a continuación mi firma digital manuscrita con plena validez probatoria.`;

export const InformedConsentModal: React.FC<InformedConsentModalProps> = ({
  pacienteId,
  profesionalId,
  pacienteNombre = 'Paciente',
  abierto,
  onCerrar,
  onConsentimientoFirmado,
  procedimientoInicial = 'Procedimiento Médico Invasivo / Quirúrgico Menor',
}) => {
  const [procedimiento, setProcedimiento] = useState(procedimientoInicial);
  const [textoLegal, setTextoLegal] = useState(TEXTO_LEGAL_BASE);
  const [metodoFirma, setMetodoFirma] = useState<'CANVAS' | 'PIN'>('CANVAS');
  const [pin, setPin] = useState('');
  const [firmando, setFirmando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [constanciaGenerada, setConstanciaGenerada] = useState<ConsentimientoInformado | null>(null);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tieneFirmaEnCanvas, setTieneFirmaEnCanvas] = useState(false);

  useEffect(() => {
    if (abierto) {
      setConstanciaGenerada(null);
      setErrorMsg(null);
      setTieneFirmaEnCanvas(false);
      setPin('');
    }
  }, [abierto]);

  useEffect(() => {
    if (abierto && metodoFirma === 'CANVAS' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [abierto, metodoFirma]);

  if (!abierto) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setTieneFirmaEnCanvas(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const limpiarCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTieneFirmaEnCanvas(false);
  };

  const handleFirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let firmaData = '';
    if (metodoFirma === 'CANVAS') {
      if (!tieneFirmaEnCanvas || !canvasRef.current) {
        setErrorMsg('Por favor estampe su firma manuscrita sobre el recuadro digital.');
        return;
      }
      firmaData = canvasRef.current.toDataURL('image/png');
    } else {
      if (!pin.trim() || pin.length < 4) {
        setErrorMsg('El PIN de confirmación de identidad debe contener al menos 4 dígitos.');
        return;
      }
      firmaData = `PIN_CONFIRMADO:${pin.trim()}`;
    }

    setFirmando(true);
    try {
      const resp = await clinicaService.firmarConsentimiento({
        pacienteId,
        profesionalId,
        procedimiento: procedimiento.trim(),
        textoLegal,
        firmaDigitalBase64: firmaData,
      });

      setConstanciaGenerada(resp);
      if (onConsentimientoFirmado) onConsentimientoFirmado(resp);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'No se pudo registrar la firma inmutable.');
    } finally {
      setFirmando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Consentimiento Informado Digital
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Formalización y firma inalterable en conformidad con la Ley Nacional 26.529
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de estado claro (DoD: Firmado o Pendiente de conformidad) */}
            {constanciaGenerada ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Firmado (Ley 26.529)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                <AlertCircle className="h-3.5 w-3.5" /> Pendiente de Conformidad
              </span>
            )}

            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {constanciaGenerada ? (
          /* Constancia Inmutable Generada */
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-foreground">
                Consentimiento Asentado e Inmutable
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                La constancia ha sido incorporada al expediente de {pacienteNombre} con sellado criptográfico.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-slate-50 dark:bg-slate-900/60 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="font-semibold text-muted-foreground">Procedimiento:</span>
                <span className="font-bold text-foreground">{constanciaGenerada.procedimiento}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="font-semibold text-muted-foreground">Profesional:</span>
                <span className="font-semibold text-foreground">{constanciaGenerada.profesionalNombre}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <span className="font-semibold text-muted-foreground">IP de Registro:</span>
                <span className="font-mono text-foreground">{constanciaGenerada.ipFirma}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="font-semibold text-muted-foreground block">Sello Criptográfico SHA-256:</span>
                <p className="font-mono text-[10px] break-all bg-background p-2 rounded-lg border border-border text-primary font-bold">
                  {constanciaGenerada.hashIntegridadSha256}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
              >
                Finalizar y Continuar Consulta
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Aceptación y Firma */
          <form onSubmit={handleFirmar} className="space-y-4 overflow-y-auto pr-1">
            {errorMsg && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Procedimiento Quirúrgico o Diagnóstico Invasivo *
              </label>
              <input
                type="text"
                required
                value={procedimiento}
                onChange={e => setProcedimiento(e.target.value)}
                placeholder="Ej: Endoscopía alta, Biopsia cutánea, Cirugía menor..."
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Texto Legal Completo con Scroll */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Texto Legal del Consentimiento</span>
                <span className="text-[10px] font-mono text-muted-foreground">Ley 26.529 Art. 5 a 10</span>
              </label>
              <textarea
                rows={5}
                value={textoLegal}
                onChange={e => setTextoLegal(e.target.value)}
                className="w-full rounded-xl border border-input bg-slate-50 dark:bg-slate-900/40 p-3 text-xs leading-relaxed text-foreground font-mono focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Selector de Método de Conformidad */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Modalidad de Firma o Aceptación
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoFirma('CANVAS')}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    metodoFirma === 'CANVAS'
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <PenTool className="h-4 w-4" />
                  <span>Firma Manuscrita en Pantalla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoFirma('PIN')}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    metodoFirma === 'PIN'
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Confirmación por PIN / Biometría</span>
                </button>
              </div>
            </div>

            {/* Lienzo Canvas para Firma */}
            {metodoFirma === 'CANVAS' ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Firme en el lienzo blanco con el dedo o puntero:
                  </span>
                  <button
                    type="button"
                    onClick={limpiarCanvas}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                  >
                    <Eraser className="h-3 w-3" /> Limpiar firma
                  </button>
                </div>
                <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex justify-center shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair touch-none w-full max-w-[480px] h-[150px]"
                  />
                </div>
              </div>
            ) : (
              /* Confirmación por PIN */
              <div className="rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40 p-4 space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Ingrese el PIN de Seguridad del Paciente
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="PIN de 4 a 6 dígitos"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm tracking-widest text-center font-mono focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={firmando}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{firmando ? 'Sellando con SHA-256...' : 'Formalizar Aceptación Inmutable'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
