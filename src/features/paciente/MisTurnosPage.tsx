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

export const MisTurnosPage: React.FC = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurnoQr, setSelectedTurnoQr] = useState<Turno | null>(null);

  useEffect(() => {
    if (user) {
      turnosService.getByPaciente(user.id).then((data) => {
        setTurnos(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleCancelar = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar este turno?')) {
      await turnosService.cancelarTurno(id);
      setTurnos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, estado: 'CANCELADO' } : t))
      );
    }
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADO':
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirmado
          </span>
        );
      case 'EN_ESPERA':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" /> En Sala de Espera
          </span>
        );
      case 'ATENDIENDO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-500/20">
            <Activity className="h-3.5 w-3.5" /> En Consulta
          </span>
        );
      case 'COMPLETADO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
            Atendido
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive border border-destructive/20">
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
          <p className="text-xs text-muted-foreground">
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

      {/* Lista de Turnos */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">
                    {turno.codigoVerificacion}
                  </span>
                  {getBadgeEstado(turno.estado)}
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground">{turno.profesionalNombre}</h3>
                  <p className="text-xs font-medium text-primary">{turno.especialidadNombre}</p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{turno.fecha} — {turno.hora} hs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{turno.centroSaludNombre}</span>
                  </div>
                  {turno.motivoConsulta && (
                    <div className="rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Motivo: </span>
                      {turno.motivoConsulta}
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones de la Card */}
              <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                <button
                  onClick={() => setSelectedTurnoQr(turno)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-background py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                >
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  <span>Ver Comprobante</span>
                </button>

                {turno.estado !== 'CANCELADO' && turno.estado !== 'COMPLETADO' && (
                  <button
                    onClick={() => handleCancelar(turno.id)}
                    className="flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
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

      {/* Modal / Card de Comprobante QR */}
      {selectedTurnoQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                Comprobante Digital Oficial
              </span>
              <h3 className="text-xl font-bold">Turno de Atención</h3>
              <p className="text-xs text-muted-foreground">Luvia - Cruz del Eje</p>
            </div>

            {/* Código QR Ilustrativo */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-6 text-black shadow-inner">
              <div className="flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-gray-50">
                <QrCode className="h-28 w-28 text-slate-800" />
              </div>
              <span className="mt-3 font-mono text-xs font-bold text-slate-700">
                {selectedTurnoQr.codigoVerificacion}
              </span>
              <span className="text-[10px] text-gray-500">Presente este código al llegar a recepción</span>
            </div>

            {/* Datos del Turno */}
            <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paciente:</span>
                <span className="font-semibold">{selectedTurnoQr.pacienteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DNI:</span>
                <span className="font-semibold font-mono">{selectedTurnoQr.pacienteDni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profesional:</span>
                <span className="font-semibold">{selectedTurnoQr.profesionalNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Especialidad:</span>
                <span className="font-semibold">{selectedTurnoQr.especialidadNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha y Hora:</span>
                <span className="font-semibold text-primary">{selectedTurnoQr.fecha} a las {selectedTurnoQr.hora} hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lugar:</span>
                <span className="font-semibold">{selectedTurnoQr.centroSaludNombre}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTurnoQr(null)}
                className="flex-1 rounded-xl border border-input bg-background py-2.5 text-xs font-semibold hover:bg-accent transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
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
