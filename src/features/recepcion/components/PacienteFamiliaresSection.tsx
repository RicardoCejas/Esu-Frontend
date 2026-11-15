import React, { useState } from 'react';
import { Users, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { Familiar, FamiliarRequest } from '@/types';

interface PacienteFamiliaresSectionProps {
  familiares: Familiar[];
  canEdit: boolean;
  onAgregar: (data: FamiliarRequest) => Promise<boolean>;
  onEliminar: (vinculoId: string | number) => Promise<boolean>;
}

const TIPOS_VINCULO = ['Hijo/a', 'Cónyuge / Pareja', 'Padre / Madre', 'Hermano/a', 'Tutor / Representante', 'Otro'];

export const PacienteFamiliaresSection: React.FC<PacienteFamiliaresSectionProps> = ({
  familiares,
  canEdit,
  onAgregar,
  onEliminar,
}) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState(TIPOS_VINCULO[0]);
  const [obraSocial, setObraSocial] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !dni.trim()) {
      setError('Completá nombre, apellido y DNI del familiar.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const ok = await onAgregar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.replace(/\D/g, ''),
        tipoVinculo,
        obraSocial: obraSocial.trim() || undefined,
      });
      if (ok) {
        setNombre('');
        setApellido('');
        setDni('');
        setObraSocial('');
        setMostrarForm(false);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-sky-700" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">Grupo Familiar Vinculado ({familiares.length})</h2>
        </div>
        {canEdit && !mostrarForm && (
          <button
            type="button"
            onClick={() => setMostrarForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Vincular Familiar</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 dark:bg-sky-950/20 space-y-3">
          <h3 className="text-xs font-bold text-sky-900 dark:text-sky-300">Datos del Nuevo Integrante</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground" />
            <input type="text" placeholder="Apellido" required value={apellido} onChange={(e) => setApellido(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground" />
            <input type="text" placeholder="DNI" required value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground" />
            <select value={tipoVinculo} onChange={(e) => setTipoVinculo(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground">
              {TIPOS_VINCULO.map((tv) => (<option key={tv} value={tv}>{tv}</option>))}
            </select>
            <input type="text" placeholder="Obra Social (Opcional)" value={obraSocial} onChange={(e) => setObraSocial(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground sm:col-span-2" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setMostrarForm(false)} className="px-3 py-1.5 rounded-lg border border-input text-xs font-semibold hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={guardando} className="px-4 py-1.5 rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800 disabled:opacity-50">{guardando ? 'Guardando...' : 'Confirmar Vínculo'}</button>
          </div>
        </form>
      )}

      {familiares.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">No hay familiares vinculados a la historia clínica del paciente.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {familiares.map((f) => (
            <div key={f.id} className="p-3.5 rounded-xl border border-border bg-card shadow-2xs flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-foreground">{f.nombre} {f.apellido}</span>
                  <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-sky-700 text-white">{f.tipoVinculo}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">DNI: {f.dni}</p>
                {f.obraSocial && <p className="text-[11px] text-muted-foreground">OS: {f.obraSocial}</p>}
              </div>
              {canEdit && (
                <button type="button" onClick={() => onEliminar(f.id)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition" title="Desvincular familiar" aria-label="Desvincular familiar">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
