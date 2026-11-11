import React, { useEffect, useId, useRef, useState } from 'react';
import { ShieldCheck, X, DollarSign, FileCheck, AlertCircle } from 'lucide-react';
import { turnosService } from '@/api/turnosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { Turno } from '@/types';

interface ModalVerificarCoberturaCopagoProps {
  turno: Turno | null;
  isOpen: boolean;
  onClose: () => void;
  onCopagoRegistrado: (turnoActualizado: Turno) => void;
}

const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'EXENTO', label: 'Exento' },
] as const;

type MetodoPago = (typeof METODOS_PAGO)[number]['value'];

export const ModalVerificarCoberturaCopago: React.FC<ModalVerificarCoberturaCopagoProps> = ({
  turno,
  isOpen,
  onClose,
  onCopagoRegistrado,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const obraSocialRef = useRef<HTMLSelectElement>(null);
  const obraSocialId = useId();
  const afiliadoId = useId();
  const carnetId = useId();
  const copagoId = useId();
  const bonoId = useId();

  const [obraSocial, setObraSocial] = useState(turno?.obraSocial || 'APROSS');
  const [numeroAfiliado, setNumeroAfiliado] = useState(turno?.numeroAfiliado || '');
  const [numeroBono, setNumeroBono] = useState(turno?.numeroBono || '');
  const [copagoMonto, setCopagoMonto] = useState<number>(turno?.copagoMonto ?? 0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [carnetValido, setCarnetValido] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Synchronize dialog top-layer state and reset form whenever a different turno opens
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const shouldShow = Boolean(isOpen && turno);
    if (shouldShow) {
      setObraSocial(turno?.obraSocial || 'APROSS');
      setNumeroAfiliado(turno?.numeroAfiliado || turno?.nroAfiliado || '');
      setNumeroBono(turno?.numeroBono || '');
      setCopagoMonto(turno?.copagoMonto ?? 0);
      setMetodoPago('EFECTIVO');
      setCarnetValido(true);
      setError('');

      if (!dialog.open) {
        dialog.showModal();
        obraSocialRef.current?.focus();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, turno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turno) return;
    setError('');

    if (obraSocial !== 'Particular / Sin Obra Social' && !numeroAfiliado.trim()) {
      setError('Ingrese el número de afiliado o credencial médica.');
      return;
    }

    try {
      setIsSubmitting(true);
      const montoFinal = metodoPago === 'EXENTO' ? 0 : Math.max(0, Number(copagoMonto) || 0);
      const updated = await turnosService.registrarCopago(turno.id, {
        obraSocial,
        numeroAfiliado: numeroAfiliado.trim(),
        copagoMonto: montoFinal,
        numeroBono:
          numeroBono.trim() || (metodoPago === 'EXENTO' ? 'AUTORIZADO-EXENTO' : 'SIN-BONO'),
        metodoPago,
      });

      if (updated) {
        onCopagoRegistrado(updated);
        onClose();
      }
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Error al asentar el copago o validación de cobertura.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-copago-title"
      closedby={isSubmitting ? 'none' : 'closerequest'}
      onCancel={(e) => {
        if (isSubmitting) {
          e.preventDefault();
          return;
        }
        onClose();
      }}
      onClose={() => {
        if (isOpen) onClose();
      }}
      className="m-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95"
    >
      {turno && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <h2 id="modal-copago-title" className="text-base font-bold text-foreground">
                  Cobertura y Copago
                </h2>
                <p className="text-xs text-muted-foreground">
                  Paciente: {turno.pacienteNombre || 'Sin nombre'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar diálogo de cobertura y copago"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-900 dark:text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <dl className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Especialidad:</dt>
              <dd className="font-semibold text-foreground">{turno.especialidadNombre || '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Profesional:</dt>
              <dd className="font-semibold text-foreground">{turno.profesionalNombre || '—'}</dd>
            </div>
          </dl>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label htmlFor={obraSocialId} className="block font-semibold text-foreground">
                Obra Social / Prepaga
              </label>
              <select
                ref={obraSocialRef}
                id={obraSocialId}
                name="obraSocial"
                value={obraSocial}
                onChange={(e) => {
                  setObraSocial(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="APROSS">APROSS</option>
                <option value="PAMI">PAMI</option>
                <option value="OSDE">OSDE</option>
                <option value="Swiss Medical">Swiss Medical</option>
                <option value="OSECAC">OSECAC</option>
                <option value="Particular / Sin Obra Social">Particular / Sin Cobertura</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor={afiliadoId} className="block font-semibold text-foreground">
                N° de Afiliado / Credencial
              </label>
              <input
                id={afiliadoId}
                name="numeroAfiliado"
                type="text"
                value={numeroAfiliado}
                onChange={(e) => {
                  setNumeroAfiliado(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ej. AP-992144-0"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={carnetId}
                checked={carnetValido}
                onChange={(e) => setCarnetValido(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor={carnetId} className="text-xs text-foreground cursor-pointer select-none">
                Carnet físico / digital verificado con DNI presentado
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="space-y-1">
                <label htmlFor={copagoId} className="block font-semibold text-foreground">
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    Copago ($)
                  </span>
                </label>
                <input
                  id={copagoId}
                  name="copagoMonto"
                  type="number"
                  min={0}
                  step={100}
                  disabled={metodoPago === 'EXENTO'}
                  value={metodoPago === 'EXENTO' ? 0 : copagoMonto}
                  onChange={(e) => setCopagoMonto(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor={bonoId} className="block font-semibold text-foreground">
                  <span className="inline-flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    N° Bono / Autorización
                  </span>
                </label>
                <input
                  id={bonoId}
                  name="numeroBono"
                  type="text"
                  value={numeroBono}
                  onChange={(e) => setNumeroBono(e.target.value)}
                  placeholder="Ej. BN-44910"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <fieldset className="space-y-1.5">
              <legend className="font-semibold text-foreground">Medio de Pago</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {METODOS_PAGO.map((m) => {
                  const selected = metodoPago === m.value;
                  return (
                    <label
                      key={m.value}
                      className={`flex items-center justify-center rounded-lg py-2 px-2 border text-[11px] font-semibold transition cursor-pointer focus-within:ring-2 focus-within:ring-primary ${
                        selected
                          ? 'border-primary bg-sky-700 text-white'
                          : 'border-input bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="metodoPago"
                        value={m.value}
                        checked={selected}
                        onChange={() => setMetodoPago(m.value)}
                        className="sr-only"
                      />
                      <span>{m.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-h-[38px] rounded-xl border border-input bg-background px-4 py-2 font-semibold text-foreground hover:bg-muted transition cursor-pointer disabled:opacity-50"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !carnetValido}
                className="min-h-[38px] rounded-xl bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Asentar Cobertura'}
              </button>
            </div>
          </form>
        </div>
      )}
    </dialog>
  );
};
