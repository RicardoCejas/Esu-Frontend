import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSalasEsperaKanban } from './hooks/useSalasEsperaKanban';
import { usePermissions } from '@/hooks/usePermissions';
import { KanbanColumn } from './components/KanbanColumn';
import { ModalCrearSobreturno } from '@/features/medico/components/ModalCrearSobreturno';
import { soundNotification } from '@/lib/soundNotification';
import { Volume2, MonitorPlay, Flame, Plus } from 'lucide-react';

export const SalasEsperaKanbanPage: React.FC = () => {
  const { user } = useAuth();
  const kanban = useSalasEsperaKanban(user?.centroSaludId);
  const { can } = usePermissions();
  const [isModalSobreturnoOpen, setIsModalSobreturnoOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tablero de Salas de Espera</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Control de flujo de pacientes en tiempo real: de recepción a consultorio y salida.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
              kanban.countSobreturnos >= 3
                ? 'bg-rose-700 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            <Flame className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>Sobreturnos en Sala:</span>
            <span className="font-mono text-xs font-black">{kanban.countSobreturnos}/3</span>
          </div>

          {can('SOBRETURNOS_CREAR') && (
            <button
              type="button"
              onClick={() => setIsModalSobreturnoOpen(true)}
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 text-xs shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>+ Agregar Sobreturno</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => soundNotification.playChime()}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <Volume2 className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span>Probar Sonido</span>
          </button>

          <Link
            to="/pantalla-turnos"
            target="_blank"
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MonitorPlay className="h-4 w-4" aria-hidden="true" />
            <span>Abrir Pantalla TV</span>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-foreground">Filtro de Ubicación:</span>
        <div className="flex items-center gap-2">
          <label htmlFor="filtro-planta" className="text-xs text-muted-foreground font-medium">Planta / Piso:</label>
          <select
            id="filtro-planta"
            value={kanban.filtroPlanta}
            onChange={(e) => kanban.setFiltroPlanta(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium text-foreground"
          >
            <option value="TODOS">Todas las Plantas</option>
            <option value="Planta Baja">Planta Baja</option>
            <option value="1° Piso">1° Piso</option>
            <option value="2° Piso">2° Piso</option>
          </select>
        </div>
      </div>

      {kanban.loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KanbanColumn title="Por Llegar" dotColor="bg-slate-500" badgeBg="bg-slate-700" turnos={kanban.porLlegar} columna="porLlegar" onMoverAEnEspera={kanban.handleMoverAEnEspera} />
          <KanbanColumn title="En Espera" dotColor="bg-amber-500" badgeBg="bg-amber-600" turnos={kanban.enEspera} columna="enEspera" onLlamar={kanban.handleLlamarAConsultorio} />
          <KanbanColumn title="En Consulta" dotColor="bg-sky-500" badgeBg="bg-sky-700" turnos={kanban.enConsulta} columna="enConsulta" onFinalizar={kanban.handleFinalizar} />
          <KanbanColumn title="Atendidos" dotColor="bg-emerald-500" badgeBg="bg-emerald-700" turnos={kanban.atendidos} columna="atendidos" />
        </div>
      )}

      <ModalCrearSobreturno
        isOpen={isModalSobreturnoOpen}
        onClose={() => setIsModalSobreturnoOpen(false)}
        profesionalId={kanban.turnos[0]?.profesionalId || user?.profesionalId || ''}
        centroSaludId={user?.centroSaludId}
        sobreturnosHoyCount={kanban.countSobreturnos}
        onSobreturnoCreado={kanban.handleSobreturnoCreado}
      />
    </div>
  );
};
