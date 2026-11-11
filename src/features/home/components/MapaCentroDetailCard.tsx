import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ExternalLink, Globe2, HeartPulse, MapPin, Phone, X } from 'lucide-react';
import { type CentroMapaPin } from '../mapaCentrosData';

interface MapaCentroDetailCardProps {
  centro: CentroMapaPin;
  onClose: () => void;
}

export const MapaCentroDetailCard: React.FC<MapaCentroDetailCardProps> = ({ centro, onClose }) => {
  const cleanPhone = (centro.telefono ?? '').replace(/[^0-9]/g, '');

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 z-20 w-auto sm:w-[420px] max-w-full rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-md p-4 sm:p-5 shadow-2xl shadow-slate-950/25">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${centro.badgeColor}`}>
              {centro.badgeTipo}
            </span>
            {centro.esGuardia && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white bg-rose-700 px-2 py-0.5 rounded-full">
                <HeartPulse className="h-3 w-3" aria-hidden="true" />
                <span>Guardia 24hs Activa</span>
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#003855] leading-tight">
            {centro.nombre}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha del centro de salud"
          className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] transition cursor-pointer"
          title="Cerrar ficha"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 sm:h-40 mb-3 bg-slate-100 shadow-inner group">
        <img
          src={centro.fotoUrl}
          alt={`Fachada de ${centro.nombre}`}
          className="w-full h-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105 motion-reduce:group-hover:scale-100"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/centros/clinica_cabrera.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold drop-shadow flex items-center justify-between gap-2">
          <span className="truncate">{centro.direccion}</span>
          <span className="text-[10px] bg-slate-900/90 text-white px-2 py-0.5 rounded shrink-0">
            Cruz del Eje
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-600 mb-3.5">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-[#0284C7] shrink-0" aria-hidden="true" />
          <span className="font-semibold text-slate-800">{centro.direccion}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-[#0284C7] shrink-0" aria-hidden="true" />
          {cleanPhone ? (
            <a href={`tel:${cleanPhone}`} className="font-bold text-[#0369A1] hover:underline">
              {centro.telefono}
            </a>
          ) : (
            <span className="font-semibold text-slate-700">{centro.telefono || 'Sin teléfono'}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[#0284C7] shrink-0" aria-hidden="true" />
          <span>{centro.horario}</span>
        </div>
      </div>

      {centro.especialidades && centro.especialidades.length > 0 && (
        <div className="mb-4 pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Servicios destacados:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {centro.especialidades.map((esp, i) => (
              <span
                key={`${esp}-${i}`}
                className="text-[10px] bg-slate-800 text-white font-semibold px-2.5 py-0.5 rounded-md"
              >
                {esp}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={centro.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 px-2 text-xs font-bold text-[#0369A1] hover:bg-[#0284C7] hover:text-white hover:border-[#0284C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] transition shadow-xs cursor-pointer text-center"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Google Maps</span>
          </a>

          <a
            href={centro.googleMaps3dUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 px-2 text-xs font-bold text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] transition shadow-xs cursor-pointer text-center"
            title="Abre la vista 3D Satelital de Google con relieve y edificios"
          >
            <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Ver en 3D / Earth</span>
          </a>
        </div>

        <Link
          to="/turnero"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] py-2.5 px-3 text-xs font-bold text-white shadow-md hover:bg-[#0369A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0284C7] transition cursor-pointer"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>Pedir Turno Online en esta Sede</span>
        </Link>
      </div>
    </div>
  );
};
