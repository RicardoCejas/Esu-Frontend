import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRecepcionBoard } from './hooks/useRecepcionBoard';
import { RecepcionDailySummaryCards } from './components/RecepcionDailySummaryCards';
import { RecepcionFiltersBar } from './components/RecepcionFiltersBar';
import { RecepcionTurnosTable } from './components/RecepcionTurnosTable';
import { ModalVerificarCoberturaCopago } from './components/ModalVerificarCoberturaCopago';
import { ModalCancelarMostrador } from './components/ModalCancelarMostrador';
import { UserPlus, CalendarPlus, Layers, MonitorPlay, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Turno } from '@/types';

export const RecepcionPage: React.FC = () => {
  const { user } = useAuth();
  const { can, canAny } = usePermissions();
  const board = useRecepcionBoard(user?.centroSaludId);
  const [turnoParaCopago, setTurnoParaCopago] = useState<Turno | null>(null);
  const [turnoParaCancelar, setTurnoParaCancelar] = useState<Turno | null>(null);

  return (
    <div className="space-y-6">
      {board.alerta && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{board.alerta}</span>
        </div>
      )}

      {board.error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
            <span>{board.error}</span>
          </div>
          <button
            type="button"
            onClick={() => void board.recargar()}
            className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-800 cursor-pointer transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Recepción</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Admisión presencial, acreditación y control de salas de espera.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {can('PACIENTES_REGISTRAR') && (
            <Link
              to="/dashboard/recepcion/pacientes/nuevo?returnTo=turno"
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-foreground shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <UserPlus className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>Alta Rápida Paciente</span>
            </Link>
          )}
          {can('TURNOS_CREAR') && (
            <Link
              to="/dashboard/recepcion/turnos/nuevo"
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              <span>Turno de Mostrador</span>
            </Link>
          )}
          {canAny(['SALA_ESPERA_GESTIONAR', 'TURNOS_VER']) && (
            <Link
              to="/dashboard/recepcion/kanban"
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>Salas de Espera</span>
            </Link>
          )}
          <Link
            to={`/pantalla-turnos?centroId=${user?.centroSaludId || 1}`}
            target="_blank"
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-foreground shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            title="Abrir pantalla de turnos exclusiva de este centro de salud"
          >
            <MonitorPlay className="h-4 w-4 text-sky-700" aria-hidden="true" />
            <span>Pantalla TV</span>
          </Link>
        </div>
      </div>

      <RecepcionDailySummaryCards kpis={board.kpis} />

      <div className="shadow-xs rounded-xl overflow-hidden">
        <RecepcionFiltersBar
          busqueda={board.busqueda}
          onBusquedaChange={board.setBusqueda}
          filtroProfesional={board.filtroProfesional}
          onFiltroProfesionalChange={board.setFiltroProfesional}
          filtroConsultorio={board.filtroConsultorio}
          onFiltroConsultorioChange={board.setFiltroConsultorio}
          profesionales={board.profesionales}
          consultorios={board.consultoriosDisponibles}
          verTodosLosDias={board.verTodosLosDias}
          onVerTodosLosDiasChange={board.setVerTodosLosDias}
          turnosHoyCount={board.turnosHoyCount}
          totalTurnosCount={board.totalTurnosCount}
          onLimpiarFiltros={board.limpiarFiltros}
          centroNombre={user?.centroSaludNombre}
        />

        <RecepcionTurnosTable
          turnos={board.turnosFiltrados}
          loading={board.loading}
          mostrarFecha={board.mostrandoTodosLosDias}
          canCheckIn={can('SALA_ESPERA_GESTIONAR')}
          canCancelar={can('TURNOS_CANCELAR')}
          onCheckIn={board.handleCheckIn}
          onMarcarAusente={board.handleMarcarAusente}
          onLlamar={board.handleLlamarPaciente}
          onOpenCopago={(t) => setTurnoParaCopago(t)}
          onOpenCancelar={(t) => setTurnoParaCancelar(t)}
        />
      </div>
      <ModalVerificarCoberturaCopago turno={turnoParaCopago} isOpen={!!turnoParaCopago} onClose={() => setTurnoParaCopago(null)} onCopagoRegistrado={(t) => { board.setTurnos((prev) => prev.map((item) => (item.id === t.id ? t : item))); board.mostrarAlerta(`Copago registrado para ${t.pacienteNombre}.`); }} />
      <ModalCancelarMostrador turno={turnoParaCancelar} isOpen={!!turnoParaCancelar} onClose={() => setTurnoParaCancelar(null)} onCancelado={(id, m) => { board.setTurnos((prev) => prev.map((item) => (item.id === id ? { ...item, estado: 'CANCELADO', justificativoCancelacion: m } : item))); board.mostrarAlerta('Turno cancelado en mostrador.'); }} />
    </div>
  );
};
