import React, { useState } from 'react';
import { ShieldCheck, X, DollarSign, FileCheck, AlertCircle } from 'lucide-react';
import { turnosService } from '@/api/turnosService';
import type { Turno } from '@/types';

interface ModalVerificarCoberturaCopagoProps {
  turno: Turno | null;
  isOpen: boolean;
  onClose: () => void;
  onCopagoRegistrado: (turnoActualizado: Turno) => void;
}

export const ModalVerificarCoberturaCopago: React.FC<ModalVerificarCoberturaCopagoProps> = ({
  turno,
  isOpen,
  onClose,
  onCopagoRegistrado,
}) => {
  const [obraSocial, setObraSocial] = useState(turno?.obraSocial || 'APROSS');
  const [numeroAfiliado, setNumeroAfiliado] = useState(turno?.numeroAfiliado || '');
  const [numeroBono, setNumeroBono] = useState(turno?.numeroBono || '');
  const [copagoMonto, setCopagoMonto] = useState<number>(turno?.copagoMonto ?? 0);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'EXENTO'>('EFECTIVO');
  const [carnetValido, setCarnetValido] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !turno) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (obraSocial !== 'Particular / Sin Obra Social' && !numeroAfiliado.trim()) {
      setError('Ingrese el número de afiliado / credencial médica.');
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await turnosService.registrarCopago(turno.id, {
        obraSocial,
        numeroAfiliado: numeroAfiliado.trim(),
        copagoMonto: metodoPago === 'EXENTO' ? 0 : Number(copagoMonto),
        numeroBono: numeroBono.trim() || (metodoPago === 'EXENTO' ? 'AUTORIZADO-EXENTO' : 'SIN-BONO'),
      });

      if (updated) {
        onCopagoRegistrado(updated);
        onClose();
      }
    } catch {
      setError('Error al asentar el copago o validación de cobertura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Cobertura y Copago</h2>
              <p className="text-xs text-muted-foreground">Paciente: {turno.pacienteNombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Especialidad:</span>
              <span className="font-semibold text-foreground">{turno.especialidadNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profesional:</span>
              <span className="font-semibold text-foreground">{turno.profesionalNombre}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Obra Social / Prepaga</label>
            <select
              value={obraSocial}
              onChange={(e) => setObraSocial(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="APROSS">APROSS</option>
              <option value="PAMI">PAMI</option>
              <option value="OSDE">OSDE</option>
              <option value="Swiss Medical">Swiss Medical</option>
              <option value="OSECAC">OSECAC</option>
              <option value="Particular / Sin Obra Social">Particular / Sin Cobertura</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">N° de Afiliado / Credencial</label>
            <input
              type="text"
              value={numeroAfiliado}
              onChange={(e) => setNumeroAfiliado(e.target.value)}
              placeholder="Ej. AP-992144-0"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="carnetValido"
              checked={carnetValido}
              onChange={(e) => setCarnetValido(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="carnetValido" className="text-xs text-foreground cursor-pointer select-none">
              Carnet físico / digital verificado con DNI presentado
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-emerald-600" /> Copago / Coseguro ($)
                </span>
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={copagoMonto}
                onChange={(e) => setCopagoMonto(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                <span className="flex items-center gap-1">
                  <FileCheck className="h-3 w-3 text-primary" /> N° Bono / Autorización
                </span>
              </label>
              <input
                type="text"
                value={numeroBono}
                onChange={(e) => setNumeroBono(e.target.value)}
                placeholder="Ej. BN-44910"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Medio de Pago</label>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'EXENTO'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`rounded-lg py-1.5 px-2 font-medium border text-[11px] transition ${
                    metodoPago === m
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !carnetValido}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Asentar Cobertura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
