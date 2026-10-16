import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { turnosService } from '@/api/turnosService';
import type { Turno, EstadoTurno } from '@/types';
import { Stethoscope } from 'lucide-react';

export const AgendaMedicaPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  useEffect(() => {
    turnosService.getAll().then((data) => {
      setTurnos(data);
      setLoading(false);
    });
  }, [user]);

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoTurno) => {
    await turnosService.updateEstado(id, nuevoEstado);
    setTurnos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t))
    );
  };

  const handleIniciarAtencion = (turno: Turno) => {
    handleCambiarEstado(turno.id, 'ATENDIENDO');
    navigate(`/dashboard/medico/atencion?pacienteId=${turno.pacienteId}&turnoId=${turno.id}&pacienteNombre=${encodeURIComponent(turno.pacienteNombre)}&pacienteDni=${turno.pacienteDni}`);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADO':
        return <span className="rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white">Confirmado</span>;
      case 'EN_ESPERA':
        return <span className="rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white">En espera</span>;
      case 'ATENDIENDO':
        return <span className="rounded-md bg-sky-700 px-2.5 py-1 text-[11px] font-bold text-white">En consulta</span>;
      case 'COMPLETADO':
        return <span className="rounded-md bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-white">Atendido</span>;
      case 'CANCELADO':
        return <span className="rounded-md bg-rose-700 px-2.5 py-1 text-[11px] font-bold text-white">Cancelado</span>;
      default:
        return null;
    }
  };

  const ESTADO_LABELS: Record<string, string> = {
    TODOS: 'Todos',
    EN_ESPERA: 'En espera',
    CONFIRMADO: 'Confirmado',
    ATENDIENDO: 'Atendiendo',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado'
  };

  const turnosFiltrados = turnos.filter((t) => {
    if (filtroEstado === 'TODOS') return true;
    return t.estado === filtroEstado;
  });

  const countEnEspera = turnos.filter((t) => t.estado === 'EN_ESPERA').length;
  const countAtendidos = turnos.filter((t) => t.estado === 'COMPLETADO').length;

  return (
    <div className="space-y-6">
      {/* Header del Médico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Agenda Médica y Consultas
          </h1>
          <p className="text-xs text-muted-foreground">
            {user?.nombre} {user?.apellido} • <span className="font-mono">{user?.matricula || 'MP-34982'}</span> • Hospital Prov. Aurelio Crespo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
            <span className="font-mono">{countEnEspera}</span> en sala de espera
          </div>
          <div className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
            <span className="font-mono">{countAtendidos}</span> atendidos hoy
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {['TODOS', 'EN_ESPERA', 'CONFIRMADO', 'ATENDIENDO', 'COMPLETADO', 'CANCELADO'].map((st) => (
          <button
            key={st}
            onClick={() => setFiltroEstado(st)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filtroEstado === st
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-card border border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {ESTADO_LABELS[st] ?? st}
          </button>
        ))}
      </div>

      {/* Lista / Tabla de Turnos del Día */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No hay turnos registrados en este estado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {turnosFiltrados.map((turno) => (
            <div
              key={turno.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-5 shadow-xs transition-all ${
                turno.estado === 'EN_ESPERA'
                  ? 'border-amber-500 bg-card'
                  : turno.estado === 'ATENDIENDO'
                  ? 'border-sky-500 bg-card'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-card font-mono font-bold text-sm text-foreground">
                  {turno.hora}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-foreground">
                      {turno.pacienteNombre}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      DNI: {turno.pacienteDni}
                    </span>
                    {turno.obraSocial && (
                      <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-white">
                        {turno.obraSocial}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Motivo:</span> {turno.motivoConsulta || 'Consulta general'} • Centro: {turno.centroSaludNombre}
                  </p>
                </div>
              </div>

              {/* Estado y Botones de Llamado */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {getEstadoBadge(turno.estado)}
                {turno.estado === 'CONFIRMADO' && (
                  <button
                    onClick={() => handleCambiarEstado(turno.id, 'EN_ESPERA')}
                    className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shadow-xs"
                  >
                    Marcar en Espera
                  </button>
                )}

                {(turno.estado === 'EN_ESPERA' || turno.estado === 'CONFIRMADO' || turno.estado === 'ATENDIENDO') && (
                  <button
                    onClick={() => handleIniciarAtencion(turno)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                  >
                    <Stethoscope className="h-4 w-4" />
                    <span>{turno.estado === 'ATENDIENDO' ? 'Continuar Atención' : 'Llamar y Atender'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
