import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
  AlertTriangle,
  Lock,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  sesionesService,
  type SesionActivaItem,
} from '@/api/sesionesService';
import { useToast } from '@/context/ToastContext';

export const AuditoriaSesionesSection: React.FC = () => {
  const [sesiones, setSesiones] = useState<SesionActivaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const cargarSesiones = async () => {
    try {
      const data = await sesionesService.getSesiones();
      setSesiones(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  const handleCerrarIndividual = async (id: string, nombreDispositivo: string) => {
    try {
      await sesionesService.cerrarSesionRemota(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
      success(`Sesión en ${nombreDispositivo} cerrada correctamente.`);
    } catch {
      toastError('No se pudo revocar la sesión remota.');
    }
  };

  const handleConfirmarCerrarTodas = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);

    if (!passwordConfirm.trim()) {
      setErrorModal('Por favor ingresá tu contraseña actual para confirmar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await sesionesService.cerrarTodasLasDemasSesiones(passwordConfirm);
      setSesiones((prev) => prev.filter((s) => s.esActual));
      setIsModalOpen(false);
      setPasswordConfirm('');
      success(
        `Se han cerrado ${res.revocadas} sesiones remotas activas de forma segura.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al verificar la contraseña.';
      setErrorModal(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getDeviceIcon = (dispositivo: string) => {
    const d = dispositivo.toLowerCase();
    if (d.includes('phone') || d.includes('móvil') || d.includes('movil')) {
      return <Smartphone className="h-5 w-5 text-sky-600 dark:text-sky-400" />;
    }
    if (d.includes('tablet') || d.includes('pad')) {
      return <Tablet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    }
    return <Laptop className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
  };

  const formatearFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const otrasSesiones = sesiones.filter((s) => !s.esActual);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-700 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-foreground">
              Seguridad y Accesos: Sesiones Activas
            </h2>
            <span className="rounded-full bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              HU-72
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Revisá los dispositivos y ubicaciones donde tenés sesiones abiertas y cerralas remotamente.
          </p>
        </div>

        {otrasSesiones.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setPasswordConfirm('');
              setErrorModal(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar todas las demás</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {sesiones.map((sesion) => (
            <div
              key={sesion.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition ${
                sesion.esActual
                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                  : 'border-border bg-background hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card border border-border shadow-2xs">
                  {getDeviceIcon(sesion.dispositivo)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {sesion.dispositivo}
                    </span>
                    {sesion.esActual ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Sesión actual
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground font-mono">
                        IP: {sesion.ip}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {sesion.navegador}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {sesion.ubicacion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Iniciada: {formatearFecha(sesion.fechaInicio)}
                    </span>
                  </div>
                </div>
              </div>

              {!sesion.esActual && (
                <button
                  type="button"
                  onClick={() =>
                    handleCerrarIndividual(sesion.id, sesion.dispositivo)
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer self-end sm:self-center"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación con Contraseña para Cerrar Todas las Demás (DoD HU-72) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Cerrar todas las demás sesiones
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta acción desconectará inmediatamente tu cuenta en todos los demás teléfonos,
              computadoras y navegadores. Para confirmar, por favor ingresá tu contraseña actual.
            </p>

            {errorModal && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                {errorModal}
              </div>
            )}

            <form onSubmit={handleConfirmarCerrarTodas} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Contraseña actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirmar Revocación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
