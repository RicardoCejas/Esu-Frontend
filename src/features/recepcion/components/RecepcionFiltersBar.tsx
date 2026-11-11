import React from 'react';
import { Search, Stethoscope, DoorOpen, X, RotateCcw } from 'lucide-react';
import type { Profesional } from '@/types';

interface RecepcionFiltersBarProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroProfesional: string;
  onFiltroProfesionalChange: (val: string) => void;
  filtroConsultorio: string;
  onFiltroConsultorioChange: (val: string) => void;
  profesionales: Profesional[];
  consultorios: string[];
  verTodosLosDias: boolean;
  onVerTodosLosDiasChange: (val: boolean) => void;
  turnosHoyCount: number;
  totalTurnosCount: number;
  onLimpiarFiltros: () => void;
  centroNombre?: string;
}

export const RecepcionFiltersBar: React.FC<RecepcionFiltersBarProps> = ({
  busqueda,
  onBusquedaChange,
  filtroProfesional,
  onFiltroProfesionalChange,
  filtroConsultorio,
  onFiltroConsultorioChange,
  profesionales,
  consultorios,
  verTodosLosDias,
  onVerTodosLosDiasChange,
  turnosHoyCount,
  totalTurnosCount,
  onLimpiarFiltros,
}) => {
  const hayFiltrosActivos =
    Boolean(busqueda) || filtroProfesional !== 'TODOS' || filtroConsultorio !== 'TODOS';
  const mostrandoTodos = verTodosLosDias || (turnosHoyCount === 0 && totalTurnosCount > 0);

  return (
    <div className="rounded-t-xl border border-border bg-card p-3 sm:p-4 border-b-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Rango de fechas de turnos"
            className="inline-flex rounded-lg border border-input bg-muted/50 p-0.5"
          >
            <button
              type="button"
              aria-pressed={!mostrandoTodos}
              onClick={() => onVerTodosLosDiasChange(false)}
              disabled={turnosHoyCount === 0 && totalTurnosCount > 0}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                !mostrandoTodos
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Turnos de Hoy ({turnosHoyCount})
            </button>
            <button
              type="button"
              aria-pressed={mostrandoTodos}
              onClick={() => onVerTodosLosDiasChange(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
                mostrandoTodos
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas las Fechas ({totalTurnosCount})
            </button>
          </div>

          {turnosHoyCount === 0 && totalTurnosCount > 0 && (
            <span className="inline-flex items-center rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white">
              Sin turnos hoy · Mostrando historial ({totalTurnosCount})
            </span>
          )}
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Buscador reactivo */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            aria-label="Buscar por DNI, paciente, médico o consultorio"
            placeholder="Buscar paciente, DNI, médico o consultorio..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filtro Médico */}
        <div className="relative">
          <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <select
            aria-label="Filtrar por médico"
            value={filtroProfesional}
            onChange={(e) => onFiltroProfesionalChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
          >
            <option value="TODOS">Todos los Médicos</option>
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>
                Dr. {p.nombre} {p.apellido} ({(p.especialidadNombre ?? '').split('/')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Consultorio */}
        <div className="relative">
          <DoorOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <select
            aria-label="Filtrar por consultorio"
            value={filtroConsultorio}
            onChange={(e) => onFiltroConsultorioChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
          >
            <option value="TODOS">Todos los Consultorios</option>
            {consultorios.map((c) => (
              <option key={c} value={c}>
                Consultorio {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
