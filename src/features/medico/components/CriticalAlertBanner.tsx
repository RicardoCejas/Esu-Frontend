import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, X, ShieldAlert } from 'lucide-react';
import { clinicaService } from '@/api/clinicaService';
import type { AlergiaPaciente, SeveridadAlergia } from '@/types';

interface CriticalAlertBannerProps {
  pacienteId: string | number;
  pacienteNombre?: string;
  onAlergiaAdded?: () => void;
}

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({
  pacienteId,
  pacienteNombre = 'Paciente',
  onAlergiaAdded,
}) => {
  const [alergias, setAlergias] = useState<AlergiaPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Formulario de nueva alergia
  const [sustancia, setSustancia] = useState('');
  const [severidad, setSeveridad] = useState<SeveridadAlergia>('GRAVE');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarAlergias = async () => {
    try {
      setLoading(true);
      const data = await clinicaService.getAlergias(pacienteId);
      setAlergias(data);
    } catch {
      // Ignorar errores menores
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteId) {
      cargarAlergias();
    }
  }, [pacienteId]);

  const handleGuardarAlergia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sustancia.trim()) {
      setErrorMsg('Por favor ingrese la sustancia o fármaco alérgeno.');
      return;
    }
    setErrorMsg(null);
    setGuardando(true);
    try {
      await clinicaService.agregarAlergia(pacienteId, {
        sustanciaAlergeno: sustancia.trim(),
        severidad,
        fechaDiagnostico: new Date().toISOString().split('T')[0],
        observaciones: observaciones.trim() || undefined,
      });
      setSustancia('');
      setObservaciones('');
      setModalAbierto(false);
      await cargarAlergias();
      if (onAlergiaAdded) onAlergiaAdded();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'No se pudo registrar la alerta médica.');
    } finally {
      setGuardando(false);
    }
  };

  const badgeSeveridad = (sev: string) => {
    const s = sev.toUpperCase();
    if (s === 'GRAVE' || s === 'SEVERA') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold bg-rose-600 text-white shadow-xs animate-pulse">
          <AlertTriangle className="h-3 w-3" /> Severa / Anafilaxia
        </span>
      );
    }
    if (s === 'MODERADA') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-white shadow-xs">
          Moderada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold bg-yellow-400 text-slate-900 shadow-xs">
        Leve
      </span>
    );
  };

  const alergiasGraves = alergias.filter(a => a.severidad === 'GRAVE');
  const otrasAlergias = alergias.filter(a => a.severidad !== 'GRAVE');

  return (
    <>
      {/* Banner Superior Permanente Estructurado en 3 Columnas (HU-76) */}
      <section
        role="alert"
        aria-label="Alertas Médicas Críticas del Paciente"
        className="rounded-2xl border-2 border-rose-500/80 bg-rose-50/90 dark:bg-rose-950/40 p-4 shadow-sm backdrop-blur-xs transition"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Columna 1: Alerta Máxima y Riesgo Anafiláctico (5 cols) */}
          <div className="md:col-span-5 flex items-start gap-3 border-b md:border-b-0 md:border-r border-rose-200 dark:border-rose-900/60 pb-3 md:pb-0 md:pr-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-rose-800 dark:text-rose-200 uppercase">
                  Alertas Críticas
                </span>
                <span className="text-[10px] font-bold bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100 rounded px-1.5 py-0.2">
                  Atención Inmediata
                </span>
              </div>
              {loading ? (
                <p className="text-xs text-rose-700/80">Cargando alergias del paciente...</p>
              ) : alergiasGraves.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {alergiasGraves.map(a => (
                    <div
                      key={a.id}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white/80 dark:bg-slate-900/80 px-2 py-1 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-rose-950 dark:text-rose-100">
                        {a.sustanciaAlergeno}
                      </span>
                      {badgeSeveridad(a.severidad)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-medium text-rose-900 dark:text-rose-300">
                  Sin alergias de riesgo anafiláctico inmediato.
                </p>
              )}
            </div>
          </div>

          {/* Columna 2: Alergias Moderadas / Factores de Riesgo (5 cols) */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-rose-200 dark:border-rose-900/60 pb-3 md:pb-0 md:pr-4">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1">
              Comorbilidades y Alérgenos Secundarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {otrasAlergias.length > 0 ? (
                otrasAlergias.map(a => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-2 py-0.5 text-xs text-foreground font-semibold"
                  >
                    <span>{a.sustanciaAlergeno}</span>
                    {badgeSeveridad(a.severidad)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No se registran antecedentes adicionales.
                </span>
              )}
            </div>
          </div>

          {/* Columna 3: Botón Modal Rápido de Registro (2 cols) */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition cursor-pointer w-full justify-center md:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Alergia</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal Rápido para Agregar Alergia Detectada en Consulta */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold text-foreground">
                  Nueva Alerta Médica • {pacienteNombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleGuardarAlergia} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Fármaco o Sustancia Alérgena *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Penicilina, Dipirona, Ibuprofeno, Látex..."
                  value={sustancia}
                  onChange={e => setSustancia(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Nivel de Severidad Clínica *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LEVE', 'MODERADA', 'GRAVE'] as SeveridadAlergia[]).map(sev => {
                    const selected = severidad === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeveridad(sev)}
                        className={`rounded-xl border py-2 text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          selected
                            ? sev === 'GRAVE'
                              ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                              : sev === 'MODERADA'
                              ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                              : 'border-yellow-400 bg-yellow-400 text-slate-900 shadow-xs'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <span>{sev === 'GRAVE' ? 'Severa' : sev === 'MODERADA' ? 'Moderada' : 'Leve'}</span>
                        <span className="text-[10px] font-normal opacity-85">
                          {sev === 'GRAVE' ? 'Bloqueante' : sev === 'MODERADA' ? 'Precaución' : 'Bajo riesgo'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Manifestación o Reacción Observada
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Edema de glotis, broncoespasmo, rash cutáneo generalizado..."
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white px-5 py-2 text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Asentar en HCU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
