import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_CENTROS, MOCK_ESPECIALIDADES } from '@/api/mockData';
import type { Especialidad } from '@/types';
import { Building2, Stethoscope, MapPin, Phone, Clock, PlusCircle, Search } from 'lucide-react';

export const AdminEspecialidadesPage: React.FC = () => {
  const [centros] = useState(MOCK_CENTROS);
  const [especialidades] = useState<Especialidad[]>(MOCK_ESPECIALIDADES);
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState('');

  // HU-13: Búsqueda en tiempo real de especialidades
  const especialidadesFiltradas = especialidades.filter((esp) =>
    esp.nombre.toLowerCase().includes(busquedaEspecialidad.toLowerCase()) ||
    esp.descripcion.toLowerCase().includes(busquedaEspecialidad.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Centros de Salud y Especialidades
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Catálogo activo de efectores públicos, clínicas privadas y cartilla médica unificada de Cruz del Eje.
          </p>
        </div>

        {/* HU-11: Botón para Crear Especialidad (Navega a página independiente) */}
        <Link
          to="/dashboard/admin/especialidades/nueva"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nueva Especialidad Médica</span>
        </Link>
      </div>

      {/* Centros de Salud */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Centros de Salud Habilitados ({centros.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centros.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground">{c.nombre}</h3>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {c.tipo}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{c.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{c.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{c.horarioAtencion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Especialidades Médicas */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span>Catálogo de Especialidades Médicas ({especialidadesFiltradas.length})</span>
          </h2>

          {/* HU-13: Buscador en tiempo real */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar especialidad..."
              value={busquedaEspecialidad}
              onChange={(e) => setBusquedaEspecialidad(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {especialidadesFiltradas.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No se encontraron especialidades médicas que coincidan con la búsqueda.
            </div>
          ) : (
            especialidadesFiltradas.map((esp) => (
              <div key={esp.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 transition">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{esp.nombre}</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{esp.descripcion}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

