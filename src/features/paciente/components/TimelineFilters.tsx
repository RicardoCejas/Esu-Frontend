import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

export type TipoPastilla = 'TODAS' | 'CONSULTAS' | 'RECETAS' | 'ESTUDIOS' | 'ADENDAS';

interface TimelineFiltersProps {
  busqueda: string;
  onBusquedaChange: (q: string) => void;
  filtroTipo: TipoPastilla;
  onFiltroTipoChange: (tipo: TipoPastilla) => void;
  fechaDesde: string;
  onFechaDesdeChange: (f: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (f: string) => void;
  onLimpiarFiltros: () => void;
  resultadosCount: number;
}

export const PASTILLAS: Array<{ id: TipoPastilla; label: string }> = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'CONSULTAS', label: 'Consultas' },
  { id: 'RECETAS', label: 'Recetas Emitidas' },
  { id: 'ESTUDIOS', label: 'Estudios Adjuntos' },
  { id: 'ADENDAS', label: 'Adendas' },
];

/**
 * Resaltado reactivo de palabras clave dentro del texto clínico (HU-74)
 */
export const highlightMatches = (text: string | undefined | null, query: string): React.ReactNode => {
  if (!text) return '';
  if (!query || query.trim() === '') return text;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="rounded bg-amber-200 text-amber-950 dark:bg-amber-900/80 dark:text-amber-100 px-0.5 font-bold"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  busqueda,
  onBusquedaChange,
  filtroTipo,
  onFiltroTipoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onLimpiarFiltros,
  resultadosCount,
}) => {
  const tieneFiltrosActivos =
    Boolean(busqueda.trim()) ||
    filtroTipo !== 'TODAS' ||
    Boolean(fechaDesde) ||
    Boolean(fechaHasta);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      {/* Fila 1: Caja de búsqueda rápida y fechas */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Caja de Búsqueda Rápida en Tiempo Real (HU-74) */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar por diagnóstico, tratamiento, síntoma o adenda médica..."
            className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filtros de Rango de Fechas */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-1.5 text-xs">
            <span className="text-[11px] text-muted-foreground">Desde:</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => onFechaDesdeChange(e.target.value)}
              className="bg-transparent text-xs text-foreground focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-1.5 text-xs">
            <span className="text-[11px] text-muted-foreground">Hasta:</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => onFechaHastaChange(e.target.value)}
              className="bg-transparent text-xs text-foreground focus:outline-hidden"
            />
          </div>

          {tieneFiltrosActivos && (
            <button
              type="button"
              onClick={onLimpiarFiltros}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Fila 2: Pastillas de Filtrado Multifactor (HU-74) */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filtrar:
          </span>
          {PASTILLAS.map(p => {
            const activa = filtroTipo === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onFiltroTipoChange(p.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activa
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {resultadosCount} {resultadosCount === 1 ? 'coincidencia' : 'coincidencias'}
        </span>
      </div>
    </div>
  );
};
