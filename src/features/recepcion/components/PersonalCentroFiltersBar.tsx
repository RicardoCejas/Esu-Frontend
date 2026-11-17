import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface PersonalCentroFiltersBarProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  filtroRol: 'TODOS' | 'RECEPCIONISTA' | 'MEDICO';
  onFiltroRolChange: (value: 'TODOS' | 'RECEPCIONISTA' | 'MEDICO') => void;
  filtroEstado: 'TODOS' | 'ACTIVO' | 'INACTIVO';
  onFiltroEstadoChange: (value: 'TODOS' | 'ACTIVO' | 'INACTIVO') => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const PersonalCentroFiltersBar: React.FC<PersonalCentroFiltersBarProps> = ({
  busqueda,
  onBusquedaChange,
  filtroRol,
  onFiltroRolChange,
  filtroEstado,
  onFiltroEstadoChange,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
      <div className="md:col-span-5">
        <label htmlFor="personal-centro-search" className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
          Buscar integrante
        </label>
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" aria-hidden="true" />
          <input
            id="personal-centro-search"
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Nombre, correo o DNI..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="md:col-span-3">
        <label htmlFor="personal-centro-rol" className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
          Perfil
        </label>
        <select
          id="personal-centro-rol"
          value={filtroRol}
          onChange={(e) => onFiltroRolChange(e.target.value as 'TODOS' | 'RECEPCIONISTA' | 'MEDICO')}
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="TODOS">Todos los perfiles</option>
          <option value="RECEPCIONISTA">Recepción / Admisión</option>
          <option value="MEDICO">Profesionales Médicos</option>
        </select>
      </div>

      <div className="md:col-span-3">
        <label htmlFor="personal-centro-estado" className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
          Estado
        </label>
        <select
          id="personal-centro-estado"
          value={filtroEstado}
          onChange={(e) => onFiltroEstadoChange(e.target.value as 'TODOS' | 'ACTIVO' | 'INACTIVO')}
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="TODOS">Todos</option>
          <option value="ACTIVO">Solo Activos</option>
          <option value="INACTIVO">Solo Inactivos</option>
        </select>
      </div>

      <div className="md:col-span-1 flex justify-end">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Actualizar listado de personal"
          className="h-[34px] w-full md:w-[38px] inline-flex items-center justify-center rounded-xl border border-input bg-background hover:bg-muted text-foreground cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-primary ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
