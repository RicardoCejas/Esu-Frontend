import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRecepcionBoard } from './hooks/useRecepcionBoard';
import { RecepcionDailySummaryCards } from './components/RecepcionDailySummaryCards';
import { RecepcionFiltersBar } from './components/RecepcionFiltersBar';
import { RecepcionTurnosTable } from './components/RecepcionTurnosTable';
import { ModalAltaRapidaPaciente } from './components/ModalAltaRapidaPaciente';
import { ModalVerificarCoberturaCopago } from './components/ModalVerificarCoberturaCopago';
import { ModalTurnoMostrador } from './components/ModalTurnoMostrador';
import { ModalCancelarMostrador } from './components/ModalCancelarMostrador';
import { UserPlus, CalendarPlus, Layers, MonitorPlay, CheckCircle2 } from 'lucide-react';
import type { Turno } from '@/types';

export const RecepcionPage: React.FC = () => {
  const { user } = useAuth();
  const board = useRecepcionBoard(user?.centroSaludId);

  const [isModalAltaOpen, setIsModalAltaOpen] = useState(false);
  const [isModalTurnoMostradorOpen, setIsModalTurnoMostradorOpen] = useState(false);
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Recepción</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Admisión presencial, acreditación y control de salas de espera.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsModalAltaOpen(true)}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-input bg-background hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Alta Rápida Paciente</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalTurnoMostradorOpen(true)}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span>Turno de Mostrador</span>
          </button>
          <Link
            to="/dashboard/recepcion/kanban"
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>Tablero Kanban</span>
          </Link>
          <Link
            to="/pantalla-turnos"
            target="_blank"
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-input bg-background hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MonitorPlay className="h-4 w-4 text-sky-600" aria-hidden="true" />
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
          centroNombre={user?.centroSaludNombre}
        />

        <RecepcionTurnosTable
          turnos={board.turnosFiltrados}
          loading={board.loading}
          onCheckIn={board.handleCheckIn}
          onOpenCopago={(t) => setTurnoParaCopago(t)}
          onOpenCancelar={(t) => setTurnoParaCancelar(t)}
        />
      </div>

      <ModalAltaRapidaPaciente isOpen={isModalAltaOpen} onClose={() => setIsModalAltaOpen(false)} onPacienteCreado={(p) => { board.setPacientes((prev) => [p, ...prev]); board.mostrarAlerta(`Paciente ${p.nombre} registrado con éxito.`); }} />
      <ModalVerificarCoberturaCopago turno={turnoParaCopago} isOpen={!!turnoParaCopago} onClose={() => setTurnoParaCopago(null)} onCopagoRegistrado={(t) => { board.setTurnos((prev) => prev.map((item) => (item.id === t.id ? t : item))); board.mostrarAlerta(`Copago registrado para ${t.pacienteNombre}.`); }} />
      <ModalTurnoMostrador isOpen={isModalTurnoMostradorOpen} onClose={() => setIsModalTurnoMostradorOpen(false)} pacientes={board.pacientes} centros={board.centros} profesionales={board.profesionales} onTurnoCreado={(t) => { board.setTurnos((prev) => [t, ...prev]); board.mostrarAlerta(`Turno generado para ${t.pacienteNombre}.`); }} />
      <ModalCancelarMostrador turno={turnoParaCancelar} isOpen={!!turnoParaCancelar} onClose={() => setTurnoParaCancelar(null)} onCancelado={(id, m) => { board.setTurnos((prev) => prev.map((item) => (item.id === id ? { ...item, estado: 'CANCELADO', justificativoCancelacion: m } : item))); board.mostrarAlerta('Turno cancelado en mostrador.'); }} />
    </div>
  );
};
