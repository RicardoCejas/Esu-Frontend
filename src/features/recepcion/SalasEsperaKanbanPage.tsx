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
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Tablero de Salas de Espera
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Flujo de atención presencial: acreditación en recepción, llamado por voz y derivación a consultorio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de planta integrado */}
          <div className="flex items-center gap-1.5 border border-input rounded-xl px-3 py-2 bg-background shadow-2xs">
            <label htmlFor="filtro-planta" className="text-xs text-muted-foreground font-medium">Planta:</label>
            <select
              id="filtro-planta"
              value={kanban.filtroPlanta}
              onChange={(e) => kanban.setFiltroPlanta(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none text-foreground cursor-pointer"
            >
              <option value="TODAS">Todas las Plantas</option>
              <option value="Planta Baja">Planta Baja</option>
              <option value="Piso 1">Piso 1</option>
              <option value="Piso 2">Piso 2</option>
            </select>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
              kanban.countSobreturnos >= 3
                ? 'bg-rose-700 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            <Flame className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>Sobreturnos:</span>
            <span className="font-mono text-xs font-black">{kanban.countSobreturnos}/3</span>
          </div>

          {can('SOBRETURNOS_CREAR') && (
            <button
              type="button"
              onClick={() => setIsModalSobreturnoOpen(true)}
              className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 text-xs shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>+ Sobreturno</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => soundNotification.playChime()}
            className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Probar Sonido</span>
          </button>

          <Link
            to="/pantalla-turnos"
            target="_blank"
            className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MonitorPlay className="h-4 w-4" aria-hidden="true" />
            <span>Pantalla TV</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KanbanColumn
          title="Por Llegar"
          dotColor="bg-slate-500"
          badgeBg="bg-slate-800"
          columna="porLlegar"
          turnos={kanban.porLlegar}
          onMoverAEnEspera={kanban.handleMoverAEnEspera}
        />
        <KanbanColumn
          title="En Espera"
          dotColor="bg-amber-500"
          badgeBg="bg-amber-600"
          columna="enEspera"
          turnos={kanban.enEspera}
          onLlamar={kanban.handleLlamarAConsultorio}
        />
        <KanbanColumn
          title="En Consulta"
          dotColor="bg-sky-500"
          badgeBg="bg-sky-700"
          columna="enConsulta"
          turnos={kanban.enConsulta}
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

      <ModalCrearSobreturno
        isOpen={isModalSobreturnoOpen}
        onClose={() => setIsModalSobreturnoOpen(false)}
        profesionalId={kanban.turnos[0]?.profesionalId || user?.profesionalId || '1'}
        centroSaludId={user?.centroSaludId}
        sobreturnosHoyCount={kanban.countSobreturnos}
        onSobreturnoCreado={() => {
          setIsModalSobreturnoOpen(false);
          kanban.recargar();
        }}
      />
    </div>
  );
};
