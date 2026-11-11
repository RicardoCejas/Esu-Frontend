import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Clock, Pencil, Layers, ExternalLink } from 'lucide-react';
import { buildFloorOptions, buildGoogleMapsUrl, parseCoordinatePair } from '@/lib/centroUtils';
import type { CentroSalud } from '@/types';

interface SedeInfoCardProps {
  centro: CentroSalud;
  consultoriosCount: number;
  canManageSede?: boolean;
}

const TIPO_LABELS: Record<CentroSalud['tipo'], string> = {
  HOSPITAL: 'Hospital',
  CLINICA: 'Clínica',
  DISPENSARIO: 'Dispensario / CAPS',
  CONSULTORIO_PRIVADO: 'Consultorio Privado',
};

export const SedeInfoCard: React.FC<SedeInfoCardProps> = ({ centro, consultoriosCount, canManageSede = true }) => {
  const floors = buildFloorOptions(centro.cantidadPlantas);
  const coords = parseCoordinatePair(centro.latitud, centro.longitud);
  const mapsUrl = buildGoogleMapsUrl(centro.latitud, centro.longitud, `${centro.nombre} ${centro.direccion}`);

  return (
    <section
      aria-labelledby="sede-info-heading"
      className="rounded-xl border border-border bg-card p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl border border-border bg-muted/40 text-foreground shrink-0">
            <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="sede-info-heading" className="text-lg font-bold text-foreground">
                {centro.nombre}
              </h2>
              <span className="rounded-md bg-sky-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {TIPO_LABELS[centro.tipo] ?? centro.tipo}
              </span>
              <span
                className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold text-white ${
                  centro.disponibleGuardia ? 'bg-emerald-700' : 'bg-slate-700'
                }`}
              >
                {centro.disponibleGuardia ? 'Guardia 24 hs' : 'Atención Programada'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {consultoriosCount} {consultoriosCount === 1 ? 'consultorio físico registrado' : 'consultorios físicos registrados'}
            </p>
          </div>
        </div>

        {canManageSede && (<Link
          to="/dashboard/recepcion/sede/editar"
          className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-input bg-background hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary self-start"
        >
          <Pencil className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>Editar Datos de Sede</span>
        </Link>)}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Dirección y Mapa</span>
          </dt>
          <dd className="space-y-1 font-medium text-foreground">
            <span className="block">
              {centro.direccion || 'Sin dirección cargada'} — {centro.ciudad || 'Cruz del Eje'}
            </span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:underline tabular-nums"
            >
              <span>{coords ? `${coords.lat}, ${coords.lng}` : 'Buscar ubicación en mapa'}</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </dd>
        </div>

        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Teléfono de Contacto</span>
          </dt>
          <dd className="font-medium text-foreground tabular-nums">
            {centro.telefono || 'No especificado'}
          </dd>
        </div>

        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Horario de Atención</span>
          </dt>
          <dd className="font-medium text-foreground">
            {centro.horarioAtencion || 'Sin horario definido'}
          </dd>
        </div>

        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Plantas Habilitadas</span>
          </dt>
          <dd className="font-medium text-foreground">
            {floors.length} {floors.length === 1 ? 'planta' : 'plantas'} ({floors.join(', ')})
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/70 text-[11px]">
        <span className="font-semibold text-muted-foreground mr-1">Prestaciones habilitadas:</span>
        <span
          className={`rounded-md px-2 py-0.5 font-bold text-white ${
            centro.permiteConsultas !== false ? 'bg-emerald-700' : 'bg-slate-600'
          }`}
        >
          {centro.permiteConsultas !== false ? 'Consultas Externas Activas' : 'Consultas Deshabilitadas'}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 font-bold text-white ${
            centro.permiteEstudios ? 'bg-sky-700' : 'bg-slate-600'
          }`}
        >
          {centro.permiteEstudios ? 'Estudios Diagnósticos Habilitados' : 'Sin Estudios Diagnósticos'}
        </span>
        {centro.permiteEstudios && centro.estudiosDisponibles && centro.estudiosDisponibles.length > 0 && (
          <>
            <span className="text-muted-foreground font-semibold ml-1">Estudios:</span>
            {centro.estudiosDisponibles.map((est) => (
              <span key={est} className="rounded-md bg-slate-800 px-2 py-0.5 font-semibold text-white">
                {est}
              </span>
            ))}
          </>
        )}
      </div>
    </section>
  );
};
