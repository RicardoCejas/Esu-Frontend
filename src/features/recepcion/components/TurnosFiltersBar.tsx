import React from 'react';
import { Search } from 'lucide-react';

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
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filtrar por Paciente, Médico, Centro de Salud o Código..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-xs">
        {/* Filtro por Estado */}
        <div className="space-y-1">
          <span className="font-semibold text-muted-foreground">Estado del Turno:</span>
          <select
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-medium"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="CONFIRMADO">CONFIRMADO</option>
            <option value="EN_ESPERA">EN SALA DE ESPERA</option>
            <option value="ATENDIENDO">EN CONSULTA</option>
            <option value="COMPLETADO">ATENDIDO (COMPLETADO)</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </div>

        {/* Rango de Fechas - Desde */}
        <div className="space-y-1">
          <span className="font-semibold text-muted-foreground">Fecha Desde:</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono"
          />
        </div>

        {/* Rango de Fechas - Hasta */}
        <div className="space-y-1">
          <span className="font-semibold text-muted-foreground">Fecha Hasta:</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono"
          />
        </div>

        {/* Reset Filtros */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="w-full rounded-lg border border-input bg-muted/40 py-1.5 font-medium hover:bg-accent transition text-muted-foreground cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
