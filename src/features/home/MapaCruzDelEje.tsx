import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Phone,
  Clock,
  ExternalLink,
  Calendar,
  HeartPulse,
  Navigation,
} from 'lucide-react';

interface CentroMapa {
  id: string;
  nombre: string;
  tipo: string;
  badgeTipo: string;
  badgeColor: string;
  direccion: string;
  telefono: string;
  horario: string;
  esGuardia: boolean;
  lat: number;
  lng: number;
  googleMapsUrl: string;
}

const CENTROS_CDE: CentroMapa[] = [
  {
    id: 'c1',
    nombre: 'Hospital Provincial Dr. Aurelio Crespo',
    tipo: 'Público Provincial',
    badgeTipo: 'Hospital Zonal',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    direccion: 'Av. Eva Perón 450, Cruz del Eje',
    telefono: '(03549) 422111 / 107',
    horario: 'Atención 24hs (Guardia Activa)',
    esGuardia: true,
    lat: -30.7291,
    lng: -64.7963,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hospital+Provincial+Aurelio+Crespo+Cruz+del+Eje',
  },
  {
    id: 'c2',
    nombre: 'Clínica Privada San Roque',
    tipo: 'Sector Privado',
    badgeTipo: 'Clínica Quirúrgica',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    direccion: 'Sarmiento 450, Centro, Cruz del Eje',
    telefono: '(03549) 422400',
    horario: 'Lunes a Viernes 07:30 a 20:30 hs',
    esGuardia: false,
    lat: -30.7245,
    lng: -64.8012,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Clinica+San+Roque+Cruz+del+Eje',
  },
  {
    id: 'c3',
    nombre: 'Centro de Diagnóstico Cruz del Eje',
    tipo: 'Sector Privado',
    badgeTipo: 'Imágenes & Laboratorio',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    direccion: 'San Martín 280, Cruz del Eje',
    telefono: '(03549) 423500',
    horario: 'Lunes a Viernes 07:00 a 19:00 hs',
    esGuardia: false,
    lat: -30.7228,
    lng: -64.8041,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centro+de+Diagnostico+San+Martin+Cruz+del+Eje',
  },
  {
    id: 'c4',
    nombre: 'Dispensario Municipal San Pantaleón',
    tipo: 'Público Municipal',
    badgeTipo: 'CAPS Barrial',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    direccion: 'Barrio Los Altos, Cruz del Eje',
    telefono: '(03549) 424100',
    horario: 'Lunes a Viernes 07:00 a 14:00 hs',
    esGuardia: false,
    lat: -30.735,
    lng: -64.789,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dispensario+San+Pantaleon+Cruz+del+Eje',
  },
  {
    id: 'c5',
    nombre: 'Dispensario Dr. René Favaloro',
    tipo: 'Público Municipal',
    badgeTipo: 'CAPS Santa Rosa',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    direccion: 'Barrio Santa Rosa, Cruz del Eje',
    telefono: '(03549) 424200',
    horario: 'Lunes a Viernes 07:30 a 14:30 hs',
    esGuardia: false,
    lat: -30.718,
    lng: -64.809,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dispensario+Favaloro+Cruz+del+Eje',
  },
  {
    id: 'c6',
    nombre: 'Consultorios Médicos del Valle',
    tipo: 'Sector Privado',
    badgeTipo: 'Consultorios Médicos',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    direccion: 'Mitre 320, Cruz del Eje',
    telefono: '(03549) 421900',
    horario: 'Lunes a Viernes 08:00 a 19:30 hs',
    esGuardia: false,
    lat: -30.7262,
    lng: -64.7985,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mitre+320+Cruz+del+Eje',
  },
];

export const MapaCruzDelEje: React.FC = () => {
  const [selectedCentro, setSelectedCentro] = useState<CentroMapa>(CENTROS_CDE[0]);

  // Generar URL del iframe de OpenStreetMap centrada en Cruz del Eje con el marcador del centro seleccionado
  const bbox = `${selectedCentro.lng - 0.015}%2C${selectedCentro.lat - 0.012}%2C${selectedCentro.lng + 0.015}%2C${selectedCentro.lat + 0.012}`;
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${selectedCentro.lat}%2C${selectedCentro.lng}`;

  return (
    <div className="relative rounded-3xl border border-teal-200/90 bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/40 p-5 sm:p-7 shadow-xl shadow-teal-950/5 text-slate-900 overflow-hidden">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900 font-heading">
              Mapa Sanitario • Solo Cruz del Eje
            </h4>
            <p className="text-xs text-teal-800 font-medium">
              Geolocalización de efectores públicos, privados y de guardia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>CDE Activo</span>
          </span>
        </div>
      </div>

      {/* Selector Pills de Centros de Cruz del Eje */}
      <div className="space-y-1.5 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Building2 className="h-3 w-3 text-teal-600" />
          <span>Seleccionar Centro para ubicar en el mapa:</span>
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CENTROS_CDE.map((centro) => {
            const isSelected = selectedCentro.id === centro.id;
            return (
              <button
                key={centro.id}
                type="button"
                onClick={() => setSelectedCentro(centro)}
                className={`cursor-pointer shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-700 to-cyan-700 text-white border-teal-600 shadow-sm shadow-teal-700/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                }`}
              >
                <span>{centro.nombre.replace('Dispensario Municipal ', 'Disp. ').replace('Hospital Provincial ', 'Hosp. ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mapa Interactivo Embebido OpenStreetMap (100% Cruz del Eje) */}
      <div className="relative rounded-2xl border border-teal-200 overflow-hidden shadow-inner bg-slate-100 h-56 sm:h-64 w-full">
        <iframe
          title={`Mapa de ${selectedCentro.nombre} en Cruz del Eje`}
          src={iframeSrc}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* Floating Pin Overlay Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-extrabold text-slate-900 border border-teal-200 shadow-md">
          <Navigation className="h-3.5 w-3.5 text-teal-600" />
          <span className="truncate max-w-[200px] sm:max-w-[280px]">
            {selectedCentro.nombre}
          </span>
        </div>
      </div>

      {/* Info Card of the Selected Center (Light, Clear & Vibrant) */}
      <div className="mt-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border mb-1 ${selectedCentro.badgeColor}`}>
              {selectedCentro.badgeTipo} • {selectedCentro.tipo}
            </span>
            <h5 className="font-extrabold text-sm text-slate-900 font-heading">
              {selectedCentro.nombre}
            </h5>
          </div>

          {selectedCentro.esGuardia && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-rose-700 border border-rose-200 self-start sm:self-auto">
              <HeartPulse className="h-3 w-3 text-rose-600" />
              <span>Guardia 24hs Activa</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span className="truncate">{selectedCentro.direccion}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-teal-600 shrink-0" />
            <a
              href={`tel:${selectedCentro.telefono.replace(/[^0-9]/g, '')}`}
              className="font-bold text-teal-800 hover:underline"
            >
              {selectedCentro.telefono}
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{selectedCentro.horario}</span>
          </div>
        </div>

        {/* Action Buttons: Navigate or Book Appointment */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
          <a
            href={selectedCentro.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/60 py-2 px-3 text-xs font-bold text-teal-800 hover:bg-teal-100/80 transition"
          >
            <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
            <span>Cómo llegar (Google Maps)</span>
          </a>

          <Link
            to="/turnero"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 py-2 px-3 text-xs font-bold text-white shadow-sm shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-800 transition"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Pedir Turno en esta Sede</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
