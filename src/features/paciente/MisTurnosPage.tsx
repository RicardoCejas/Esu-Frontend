import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { turnosService } from '@/api/turnosService';
import type { Turno } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  QrCode,
  XCircle,
  CheckCircle2,
  Download,
  Activity
} from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeleton';

export const MisTurnosPage: React.FC = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurnoQr, setSelectedTurnoQr] = useState<Turno | null>(null);
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);

  useEffect(() => {
    if (user) {
      turnosService.getByPaciente(user.id).then((data) => {
        setTurnos(data);
        setLoading(false);
      });
    }
  }, [user]);

  // Bloqueo de scroll cuando un modal está abierto
  useEffect(() => {
    if (selectedTurnoQr || turnoACancelar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedTurnoQr, turnoACancelar]);

  const handleConfirmarCancelacion = async () => {
    if (!turnoACancelar) return;
    await turnosService.cancelarTurno(turnoACancelar.id);
    setTurnos((prev) =>
      prev.map((t) => (t.id === turnoACancelar.id ? { ...t, estado: 'CANCELADO' } : t))
    );
    setTurnoACancelar(null);
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADO':
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirmado
          </span>
        );
      case 'EN_ESPERA':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            <Clock className="h-3.5 w-3.5" /> En Sala de Espera
          </span>
        );
      case 'ATENDIENDO':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            <Activity className="h-3.5 w-3.5" /> En Consulta
          </span>
        );
      case 'COMPLETADO':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            Atendido
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            <XCircle className="h-3.5 w-3.5" /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Turnos Médicos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consulta el estado de tus citas, descarga comprobantes con código QR o solicita nuevos turnos.
          </p>
        </div>

        <Link
          to="/turnero"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Solicitar Nuevo Turno</span>
        </Link>
      </div>

      {/* Skeletons de Carga Progresiva */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : turnos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base">No tienes turnos agendados</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Puedes reservar una cita médica en cualquier centro de salud o con profesionales de Cruz del Eje.
          </p>
          <Link
            to="/turnero"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Sacar Turno Ahora</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turnos.map((turno) => (
            <div
              key={turno.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {turno.codigoVerificacion}
                  </span>
                  {getBadgeEstado(turno.estado)}
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground">{turno.profesionalNombre}</h3>
                  <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">{turno.especialidadNombre}</p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{turno.fecha} — {turno.hora} hs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{turno.centroSaludNombre}</span>
                  </div>
                  {turno.motivoConsulta && (
                    <div className="rounded-lg bg-muted/60 p-2.5 text-[11px] text-muted-foreground border border-border/50">
                      <span className="font-semibold text-foreground">Motivo: </span>
                      {turno.motivoConsulta}
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones de la Card */}
              <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setSelectedTurnoQr(turno)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-background py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  <span>Ver Comprobante</span>
                </button>

                {turno.estado !== 'CANCELADO' && turno.estado !== 'COMPLETADO' && (
                  <button
                    type="button"
                    onClick={() => setTurnoACancelar(turno)}
                    className="flex items-center justify-center rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-700 hover:text-white dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-200 dark:hover:bg-rose-900 transition cursor-pointer"
                    title="Cancelar turno"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Accesible de Confirmación para Cancelación de Turno */}
      {turnoACancelar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/70">
                <XCircle className="h-6 w-6 text-rose-700 dark:text-rose-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Cancelar Turno Médico</h3>
                <p className="text-xs text-muted-foreground">Esta acción liberará el horario de atención.</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 border border-border/60">
              <div><strong className="text-foreground">Médico:</strong> {turnoACancelar.profesionalNombre}</div>
              <div><strong className="text-foreground">Fecha y Hora:</strong> {turnoACancelar.fecha} ({turnoACancelar.hora} hs)</div>
              <div><strong className="text-foreground">Centro:</strong> {turnoACancelar.centroSaludNombre}</div>
            </div>

            <p className="text-xs text-muted-foreground">
              ¿Estás seguro de que deseas cancelar este turno en Cruz del Eje?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTurnoACancelar(null)}
                className="flex-1 rounded-lg border border-input bg-background py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarCancelacion}
                className="flex-1 rounded-lg bg-rose-700 py-2 text-xs font-bold text-white hover:bg-rose-800 transition cursor-pointer shadow-sm"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Card de Comprobante QR */}
      {selectedTurnoQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="text-center space-y-1.5">
              <span className="inline-block rounded-md bg-sky-700 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
                Comprobante Digital Oficial
              </span>
              <h3 className="text-lg font-bold text-foreground">Turno de Atención Médica</h3>
              <p className="text-xs text-muted-foreground font-medium">ESU — Red Sanitaria Cruz del Eje</p>
            </div>

            {/* Código QR Ilustrativo */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-6 text-black shadow-inner">
              <div className="flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-gray-50">
                <QrCode className="h-28 w-28 text-slate-800" />
              </div>
              <span className="mt-3 font-mono text-xs font-bold text-slate-800">
                {selectedTurnoQr.codigoVerificacion}
              </span>
              <span className="text-[10px] text-gray-600 font-medium mt-0.5">
                Presente este código al llegar a recepción
              </span>
            </div>

            {/* Datos del Turno */}
            <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-xs border border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paciente:</span>
                <span className="font-semibold text-foreground">{selectedTurnoQr.pacienteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DNI:</span>
                <span className="font-semibold font-mono text-foreground">{selectedTurnoQr.pacienteDni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profesional:</span>
                <span className="font-semibold text-foreground">{selectedTurnoQr.profesionalNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Especialidad:</span>
                <span className="font-semibold text-foreground">{selectedTurnoQr.especialidadNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha y Hora:</span>
                <span className="font-bold text-sky-700 dark:text-sky-400">{selectedTurnoQr.fecha} a las {selectedTurnoQr.hora} hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lugar:</span>
                <span className="font-semibold text-foreground">{selectedTurnoQr.centroSaludNombre}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedTurnoQr(null)}
                className="flex-1 rounded-lg border border-input bg-background py-2.5 text-xs font-semibold hover:bg-accent transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Imprimir / Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
