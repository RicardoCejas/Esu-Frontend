import React from 'react';
import { Search, CalendarDays } from 'lucide-react';

export interface TurnosFiltersBarProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (val: string) => void;
  fechaDesde: string;
  onFechaDesdeChange: (val: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (val: string) => void;
  onLimpiarFiltros: () => void;
}

export const TurnosFiltersBar: React.FC<TurnosFiltersBarProps> = ({
  busqueda,
  onBusquedaChange,
  filtroEstado,
  onFiltroEstadoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onLimpiarFiltros,
}) => {
  const setPresetHoy = () => {
    const hoy = new Date().toLocaleDateString('en-CA');
    onFechaDesdeChange(hoy);
    onFechaHastaChange(hoy);
  };

  const setPresetSemana = () => {
    const d = new Date();
    const hoy = d.toLocaleDateString('en-CA');
    const semana = new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
    onFechaDesdeChange(hoy);
    onFechaHastaChange(semana);
  };

  return (
    <div className="rounded-t-xl border border-border bg-card p-4 space-y-3 border-b-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            aria-label="Buscar turnos por paciente, DNI, médico o código"
            placeholder="Buscar por Paciente, DNI, Profesional, Especialidad o Código..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <span className="text-muted-foreground text-[11px] font-semibold flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-sky-700" />
            Accesos rápidos:
          </span>
          <button
            type="button"
            onClick={setPresetHoy}
            className="rounded-md border border-input px-2.5 py-1 text-[11px] font-semibold hover:bg-muted text-foreground cursor-pointer"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={setPresetSemana}
            className="rounded-md border border-input px-2.5 py-1 text-[11px] font-semibold hover:bg-muted text-foreground cursor-pointer"
          >
            Próximos 7 días
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-xs">
        <div className="space-y-1">
          <label htmlFor="filtro-estado" className="font-semibold text-muted-foreground block">
            Estado del Turno:
          </label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-medium text-foreground cursor-pointer"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="CONFIRMADO">CONFIRMADO</option>
            <option value="EN_ESPERA">EN SALA DE ESPERA</option>
            <option value="ATENDIENDO">EN CONSULTA (ATENDIENDO)</option>
            <option value="COMPLETADO">ATENDIDO (COMPLETADO)</option>
            <option value="AUSENTE">AUSENTE</option>
            <option value="CANCELADO">CANCELADO</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filtro-fecha-desde" className="font-semibold text-muted-foreground block">
            Fecha Desde:
          </label>
          <input
            id="filtro-fecha-desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-foreground"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="filtro-fecha-hasta" className="font-semibold text-muted-foreground block">
            Fecha Hasta:
          </label>
          <input
            id="filtro-fecha-hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-foreground"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="w-full rounded-lg border border-input bg-muted/40 py-1.5 font-semibold hover:bg-accent transition text-foreground cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
