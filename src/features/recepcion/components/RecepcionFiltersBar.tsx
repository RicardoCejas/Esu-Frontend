import React from 'react';
import { Search, Stethoscope, Building2 } from 'lucide-react';
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
  centroNombre,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Buscador reactivo */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar DNI o Paciente..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        {/* Indicador de Centro Fijo */}
        <div className="relative flex items-center px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs text-foreground font-medium truncate">
          <Building2 className="h-4 w-4 text-sky-600 mr-2 shrink-0" />
          <span className="truncate">{centroNombre || 'Sede Asignada'}</span>
        </div>

        {/* Filtro Médico */}
        <div className="relative">
          <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={filtroProfesional}
            onChange={(e) => onFiltroProfesionalChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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
            value={filtroConsultorio}
            onChange={(e) => onFiltroConsultorioChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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
