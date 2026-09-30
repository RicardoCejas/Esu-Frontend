import React, { useState } from 'react';
import { MOCK_CENTROS, MOCK_ESPECIALIDADES } from '@/api/mockData';
import { Building2, Stethoscope, MapPin, Phone, Clock } from 'lucide-react';

export const AdminEspecialidadesPage: React.FC = () => {
  const [centros] = useState(MOCK_CENTROS);
  const [especialidades] = useState(MOCK_ESPECIALIDADES);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Centros de Salud y Especialidades
        </h1>
        <p className="text-xs text-muted-foreground">
          Catálogo activo de efectores públicos, clínicas privadas y cartilla médica de Cruz del Eje.
        </p>
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
                <h3 className="font-bold text-sm">{c.nombre}</h3>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {c.tipo}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{c.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{c.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{c.horarioAtencion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Especialidades Médicas */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span>Especialidades Médicas ({especialidades.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {especialidades.map((esp) => (
            <div key={esp.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <h4 className="font-bold text-sm text-foreground">{esp.nombre}</h4>
              <p className="text-xs text-muted-foreground mt-1">{esp.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
