import React, { useState, useEffect } from 'react';
import { turnosService } from '@/api/turnosService';
import type { Turno } from '@/types';
import {
  Clock,
  UserCheck,
  Search,
  Activity
} from 'lucide-react';

export const RecepcionPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    turnosService.getAll().then((data) => {
      setTurnos(data);
      setLoading(false);
    });
  }, []);

  const handleMarcarLlegada = async (id: string) => {
    await turnosService.updateEstado(id, 'EN_ESPERA');
    setTurnos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: 'EN_ESPERA' } : t))
    );
  };

  const handleMarcarAusente = async (id: string) => {
    await turnosService.updateEstado(id, 'AUSENTE');
    setTurnos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: 'AUSENTE' } : t))
    );
  };

  const turnosFiltrados = turnos.filter(
    (t) =>
      t.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.pacienteDni.includes(busqueda) ||
      t.codigoVerificacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const enEspera = turnos.filter((t) => t.estado === 'EN_ESPERA');
  const enConsulta = turnos.filter((t) => t.estado === 'ATENDIENDO');

  return (
    <div className="space-y-6">
      {/* Header Recepción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Recepción y Sala de Espera
          </h1>
          <p className="text-xs text-muted-foreground">
            Control de admisión presencial, verificación de turnos y flujo en sala de espera en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{enEspera.length} en espera</span>
          </div>
          <div className="rounded-lg bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{enConsulta.length} en consultorio</span>
          </div>
        </div>
      </div>

      {/* Buscador Rápido de Admisión */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar paciente por DNI, Nombre o Código de Turno..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabla de Admisión y Control */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">Hora</th>
                  <th className="p-4">Código / DNI</th>
                  <th className="p-4">Paciente</th>
                  <th className="p-4">Médico / Especialidad</th>
                  <th className="p-4">Estado Actual</th>
                  <th className="p-4 text-right">Acción de Admisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {turnosFiltrados.map((turno) => (
                  <tr key={turno.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 font-bold font-mono text-foreground text-sm">
                      {turno.hora} hs
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{turno.codigoVerificacion}</div>
                      <div className="text-muted-foreground font-mono">DNI: {turno.pacienteDni}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{turno.pacienteNombre}</div>
                      <div className="text-muted-foreground">OS: {turno.obraSocial || 'Particular'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{turno.profesionalNombre}</div>
                      <div className="text-sky-700 dark:text-sky-400 font-semibold text-[11px]">{turno.especialidadNombre}</div>
                    </td>
                    <td className="p-4">
                      {turno.estado === 'CONFIRMADO' && (
                        <span className="rounded-md bg-slate-700 px-2.5 py-1 font-bold text-white shadow-xs">
                          Agendado
                        </span>
                      )}
                      {turno.estado === 'EN_ESPERA' && (
                        <span className="rounded-md bg-amber-600 px-2.5 py-1 font-bold text-white shadow-xs">
                          En Sala de Espera
                        </span>
                      )}
                      {turno.estado === 'ATENDIENDO' && (
                        <span className="rounded-md bg-sky-700 px-2.5 py-1 font-bold text-white shadow-xs">
                          En Consulta
                        </span>
                      )}
                      {turno.estado === 'COMPLETADO' && (
                        <span className="rounded-md bg-emerald-700 px-2.5 py-1 font-bold text-white shadow-xs">
                          Finalizado
                        </span>
                      )}
                      {turno.estado === 'AUSENTE' && (
                        <span className="rounded-md bg-rose-700 px-2.5 py-1 font-bold text-white shadow-xs">
                          Ausente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {turno.estado === 'CONFIRMADO' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleMarcarLlegada(turno.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 transition"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Registrar Llegada</span>
                          </button>
                          <button
                            onClick={() => handleMarcarAusente(turno.id)}
                            className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                            title="Marcar como ausente"
                          >
                            Ausente
                          </button>
                        </div>
                      )}

                      {turno.estado === 'EN_ESPERA' && (
                        <span className="text-amber-600 font-medium text-[11px]">
                          Esperando llamado del médico...
                        </span>
                      )}

                      {turno.estado === 'COMPLETADO' && (
                        <span className="text-muted-foreground text-[11px]">Atención cerrada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
