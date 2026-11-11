import React from 'react';
import { Clock, Filter, Table as TableIcon, BarChart3 } from 'lucide-react';
import type { OpcionMedicoMetricas } from '../hooks/useMetricasCentro';

interface MetricasCentroFiltersBarProps {
  fechaDesde: string;
  onFechaDesdeChange: (value: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (value: string) => void;
  especialidad: string;
  onEspecialidadChange: (value: string) => void;
  especialidadesOpciones: string[];
  profesionalId: string;
  onProfesionalIdChange: (value: string) => void;
  medicosOpciones: OpcionMedicoMetricas[];
  consultorio: string;
  onConsultorioChange: (value: string) => void;
  consultoriosOpciones: string[];
  periodoDescripcion?: string;
  horaActualizacion: string;
  vistaTabular: boolean;
  onToggleVistaTabular: () => void;
}

const inputCls = 'w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

export const MetricasCentroFiltersBar: React.FC<MetricasCentroFiltersBarProps> = ({
  fechaDesde, onFechaDesdeChange, fechaHasta, onFechaHastaChange,
  especialidad, onEspecialidadChange, especialidadesOpciones,
  profesionalId, onProfesionalIdChange, medicosOpciones,
  consultorio, onConsultorioChange, consultoriosOpciones,
  periodoDescripcion, horaActualizacion, vistaTabular, onToggleVistaTabular,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-bold text-foreground">Filtros Operativos:</span>
          {periodoDescripcion && <span className="hidden sm:inline">({periodoDescripcion})</span>}
        </div>
        {horaActualizacion && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span>Actualizado: <strong className="text-foreground tabular-nums">{horaActualizacion} hs</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label htmlFor="metricas-centro-desde" className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Desde</label>
          <input id="metricas-centro-desde" type="date" value={fechaDesde} onChange={(e) => onFechaDesdeChange(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="metricas-centro-hasta" className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Hasta</label>
          <input id="metricas-centro-hasta" type="date" value={fechaHasta} onChange={(e) => onFechaHastaChange(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="metricas-centro-esp" className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Especialidad</label>
          <select id="metricas-centro-esp" value={especialidad} onChange={(e) => onEspecialidadChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
            <option value="TODOS">Todas las especialidades</option>
            {especialidadesOpciones.map((esp) => (<option key={esp} value={esp}>{esp}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="metricas-centro-prof" className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Médico</label>
          <select id="metricas-centro-prof" value={profesionalId} onChange={(e) => onProfesionalIdChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
            <option value="TODOS">Todos los médicos</option>
            {medicosOpciones.map((m) => (<option key={m.id} value={m.id}>{m.nombreCompleto}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="metricas-centro-cons" className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Consultorio</label>
          <select id="metricas-centro-cons" value={consultorio} onChange={(e) => onConsultorioChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
            <option value="TODOS">Todos los consultorios</option>
            {consultoriosOpciones.map((num) => (<option key={num} value={num}>Cons. {num}</option>))}
          </select>
        </div>
      </div>

      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <p>Indicadores calculados sobre turnos de esta institución (Ley 25.326 — datos anonimizados).</p>
        <button
          type="button"
          onClick={onToggleVistaTabular}
          className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          {vistaTabular ? (
            <>
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ver Gráficos Interactivos</span>
            </>
          ) : (
            <>
              <TableIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Vista Accesible (Tablas)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
