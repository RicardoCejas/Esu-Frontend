import React from 'react';
import { Search, Stethoscope } from 'lucide-react';
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
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Buscador reactivo */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            aria-label="Buscar paciente por DNI o nombre"
            placeholder="Buscar por DNI o nombre de paciente..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filtro Médico */}
        <div className="relative">
          <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <select
            aria-label="Filtrar por médico"
            value={filtroProfesional}
            onChange={(e) => onFiltroProfesionalChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="TODOS">Todos los Médicos</option>
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido} ({p.especialidadNombre.split('/')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Consultorio */}
        <div>
          <select
            aria-label="Filtrar por consultorio"
            value={filtroConsultorio}
            onChange={(e) => onFiltroConsultorioChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="TODOS">Todos los Consultorios</option>
            {consultorios.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
