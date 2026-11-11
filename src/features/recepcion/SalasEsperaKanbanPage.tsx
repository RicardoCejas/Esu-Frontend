import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSalasEsperaKanban } from './hooks/useSalasEsperaKanban';
import { usePermissions } from '@/hooks/usePermissions';
import { KanbanColumn } from './components/KanbanColumn';
import { ModalCancelarMostrador } from './components/ModalCancelarMostrador';
import { soundNotification } from '@/lib/soundNotification';
import { Volume2, MonitorPlay, Flame, Plus, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Turno } from '@/types';

export const SalasEsperaKanbanPage: React.FC = () => {
  const { user } = useAuth();
  const kanban = useSalasEsperaKanban(user?.centroSaludId);
  const { can } = usePermissions();

  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);

  const handleOpenCancelar = (t: Turno) => {
    setTurnoACancelar(t);
    setModalCancelarOpen(true);
  };

  const handleCloseCancelar = () => {
    setModalCancelarOpen(false);
    setTurnoACancelar(null);
  };

  const handleTurnoCancelado = (id: string) => {
    kanban.setTurnos((prev) => prev.filter((t) => String(t.id) !== String(id)));
    handleCloseCancelar();
  };

  return (
    <div className="space-y-5">
      {/* Banner de alerta temporal */}
      {kanban.alerta && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{kanban.alerta}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tablero de Salas de Espera
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Flujo de atención presencial: acreditación en recepción, llamado por voz y derivación a consultorio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
              kanban.countSobreturnos >= 3
                ? 'bg-rose-700 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            <Flame className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>Sobreturnos:</span>
            <span className="tabular-nums text-xs font-black">{kanban.countSobreturnos}/3</span>
          </div>

          {can('SOBRETURNOS_CREAR') && (
            <Link
              to="/dashboard/recepcion/kanban/sobreturno"
              className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold px-3 py-2 text-xs shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-600"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Sobreturno</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => soundNotification.playChime()}
            className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Probar Sonido</span>
          </button>

          <Link
            to={user?.centroSaludId ? `/pantalla-turnos?centroId=${user.centroSaludId}` : '/pantalla-turnos'}
            target="_blank"
            className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
          >
            <MonitorPlay className="h-4 w-4" aria-hidden="true" />
            <span>Pantalla TV</span>
          </Link>
        </div>
      </div>

      {/* Toolbar de Búsqueda y Filtros */}
      <div className="p-3 rounded-2xl border border-border bg-card shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={kanban.busqueda}
            onChange={(e) => kanban.setBusqueda(e.target.value)}
            placeholder="Buscar por paciente, DNI, médico..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filtro Planta */}
        <div className="flex items-center gap-2 border border-input rounded-xl px-3 py-1.5 bg-background">
          <label htmlFor="filtro-planta" className="text-xs text-muted-foreground font-medium shrink-0">
            Planta:
          </label>
          <select
            id="filtro-planta"
            value={kanban.filtroPlanta}
            onChange={(e) => kanban.setFiltroPlanta(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold focus:outline-none text-foreground cursor-pointer"
          >
            <option value="TODOS">Todas las Plantas</option>
            {kanban.floorOptions.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Profesional */}
        <div className="flex items-center gap-2 border border-input rounded-xl px-3 py-1.5 bg-background">
          <label htmlFor="filtro-prof" className="text-xs text-muted-foreground font-medium shrink-0">
            Médico:
          </label>
          <select
            id="filtro-prof"
            value={kanban.filtroProfesional}
            onChange={(e) => kanban.setFiltroProfesional(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold focus:outline-none text-foreground cursor-pointer truncate"
          >
            <option value="TODOS">Todos los Médicos</option>
            {kanban.profesionales.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nombre} {p.apellido} {p.especialidadNombre ? `(${p.especialidadNombre})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Consultorio Destino Predeterminado para Llamadas */}
        <div className="flex items-center gap-2 border border-input rounded-xl px-3 py-1.5 bg-background">
          <label htmlFor="consultorio-default" className="text-xs text-muted-foreground font-medium shrink-0">
            Llamar a Cons:
          </label>
          <select
            id="consultorio-default"
            value={kanban.consultorioSeleccionado}
            onChange={(e) => kanban.setConsultorioSeleccionado(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold focus:outline-none text-foreground cursor-pointer truncate"
          >
            {kanban.consultorios.length === 0 ? (
              <option value="">Sin consultorios cargados</option>
            ) : (
              kanban.consultorios.map((c) => (
                <option key={c.id ?? c.numero} value={c.numero}>
                  Cons. {c.numero} {c.planta ? `(${c.planta})` : ''}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {kanban.error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{kanban.error}</span>
        </div>
      )}

      {/* Grid de 4 Columnas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KanbanColumn
          title="Por Llegar"
          dotColor="bg-slate-500"
          badgeBg="bg-slate-800"
          columna="porLlegar"
          turnos={kanban.porLlegar}
          onMoverAEnEspera={kanban.handleMoverAEnEspera}
          onMarcarAusente={kanban.handleMarcarAusente}
          onCancelar={handleOpenCancelar}
        />
        <KanbanColumn
          title="En Espera"
          dotColor="bg-amber-500"
          badgeBg="bg-amber-600"
          columna="enEspera"
          turnos={kanban.enEspera}
          onLlamar={kanban.handleLlamarAConsultorio}
          onMarcarAusente={kanban.handleMarcarAusente}
          onCancelar={handleOpenCancelar}
        />
        <KanbanColumn
          title="En Consulta"
          dotColor="bg-sky-500"
          badgeBg="bg-sky-700"
          columna="enConsulta"
          turnos={kanban.enConsulta}
          onLlamar={kanban.handleLlamarAConsultorio}
          onFinalizar={kanban.handleFinalizar}
        />
        <KanbanColumn
          title="Atendidos"
          dotColor="bg-emerald-500"
          badgeBg="bg-emerald-700"
          columna="atendidos"
          turnos={kanban.atendidos}
        />
      </div>

      {/* Modal de Cancelación */}
      <ModalCancelarMostrador
        turno={turnoACancelar}
        isOpen={modalCancelarOpen}
        onClose={handleCloseCancelar}
        onCancelado={handleTurnoCancelado}
      />
    </div>
  );
};
