import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  NavigationControl,
  FullscreenControl,
  AttributionControl,
  setWorkerUrl,
  type StyleSpecification,
  type ErrorEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Calendar,
  HeartPulse,
  Navigation,
  Globe2,
  X,
  Sparkles,
  Maximize2,
  Settings,
} from 'lucide-react';
import {
  type CentroMapaPin,
  mapaCentrosService,
} from './mapaCentrosData';

// Configurar URL del worker para MapLibre GL
if (typeof window !== 'undefined') {
  try {
    const workerOrigin = window.location.origin;
    setWorkerUrl(`${workerOrigin}/maplibre-gl-worker.mjs`);
  } catch (err) {
    console.warn('Worker de MapLibre no configurado:', err);
  }
}

// Centro urbano de Cruz del Eje que abarca perfectamente los 4 centros de salud
const CRUZ_DEL_EJE_CENTER: [number, number] = [-64.7946, -30.7356];
const DEFAULT_ZOOM = 14.1;

// Estilo OpenStreetMap oficial (Raster nítido, sin fallas ni pantallas en blanco)
const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> colaboradores',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const OPENFREEMAP_BRIGHT_URL = 'https://tiles.openfreemap.org/styles/bright';

type StyleKey = 'vista1' | 'vista2';

interface MapaCruzDelEjeProps {
  className?: string;
  onSelectPin?: (pin: CentroMapaPin) => void;
}

export const MapaCruzDelEje: React.FC<MapaCruzDelEjeProps> = ({ className = '', onSelectPin }) => {
  const { user } = useAuth();
  const isAdminOrDev = user?.rol === 'ADMIN' || localStorage.getItem('esu_dev_mode') === 'true';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);

  const [centros] = useState<CentroMapaPin[]>(() => mapaCentrosService.getCentros());
  const [selectedCentro, setSelectedCentro] = useState<CentroMapaPin | null>(() => centros[0] || null);
  const [mapStyleKey, setMapStyleKey] = useState<StyleKey>('vista1');

  // Manejar selección de centro y vuelo suave de la cámara
  const handleSelectCentro = useCallback(
    (centro: CentroMapaPin) => {
      setSelectedCentro(centro);
      if (onSelectPin) onSelectPin(centro);

      const map = mapRef.current;
      if (map) {
        map.flyTo({
          center: [centro.lng, centro.lat],
          zoom: 15.7,
          pitch: 30,
          bearing: 0,
          duration: 900,
          essential: true,
        });
      }
    },
    [onSelectPin]
  );

  // 1. Inicialización de MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: OSM_RASTER_STYLE,
      center: CRUZ_DEL_EJE_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ visualizePitch: true, showCompass: true }), 'top-right');
    map.addControl(new FullscreenControl(), 'top-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      map.resize();
    });

    map.on('error', (e: ErrorEvent) => {
      console.warn('MapLibre error evento:', e);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Cambio dinámico de estilo
  const handleChangeStyle = (key: StyleKey) => {
    setMapStyleKey(key);
    const map = mapRef.current;
    if (!map) return;

    try {
      if (key === 'vista1') {
        map.setStyle(OSM_RASTER_STYLE);
      } else if (key === 'vista2') {
        map.setStyle(OPENFREEMAP_BRIGHT_URL);
      }
    } catch (err) {
      console.warn('Error alternando estilo, regresando a Vista 1:', err);
      map.setStyle(OSM_RASTER_STYLE);
    }
  };

  // 3. Renderizar marcadores (pines) en el mapa sin sobreescribir transform de MapLibre
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar marcadores previos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    centros.forEach((centro) => {
      // Contenedor principal del marcador gestionado exclusivamente por MapLibre
      const el = document.createElement('div');
      el.className = 'cde-pin-root cursor-pointer select-none';

      const colorBg =
        centro.tipo === 'HOSPITAL'
          ? '#e11d48' // Rojo/Rosa
          : centro.tipo === 'CLINICA'
          ? '#0284c7' // Celeste
          : '#059669'; // Verde esmeralda (Diagnóstico)

      const iconSymbol =
        centro.tipo === 'HOSPITAL' ? '✚' : centro.tipo === 'CLINICA' ? '🏥' : '🔬';

      const etiqueta = centro.nombreCorto;

      // Elemento interno animable. NUNCA tocamos el transform de `el`, solo el de `innerDiv`
      const innerDiv = document.createElement('div');
      innerDiv.style.display = 'flex';
      innerDiv.style.flexDirection = 'column';
      innerDiv.style.alignItems = 'center';
      innerDiv.style.transition = 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.18s ease';
      innerDiv.style.willChange = 'transform';
      innerDiv.style.pointerEvents = 'auto';

      innerDiv.innerHTML = `
        <div style="background-color: ${colorBg}; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
          <div style="transform: rotate(45deg); font-weight: 900; font-size: 14px; line-height: 1;">
            ${iconSymbol}
          </div>
        </div>
        <div style="background: white; color: #0f172a; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 8px; white-space: nowrap; margin-top: 3px; border: 1.5px solid ${colorBg}; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
          ${etiqueta}
        </div>
      `;

      // Eventos Hover: se escalan SOLO en el div interno para que el pin no desaparezca ni salte
      innerDiv.addEventListener('mouseenter', () => {
        innerDiv.style.transform = 'scale(1.18) translateY(-4px)';
        el.style.zIndex = '50';
      });
      innerDiv.addEventListener('mouseleave', () => {
        innerDiv.style.transform = 'scale(1) translateY(0)';
        el.style.zIndex = '10';
      });

      // Evento Click: abre la ventanita informativa
      innerDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelectCentro(centro);
      });

      el.appendChild(innerDiv);

      const marker = new MapLibreMarker({ element: el, anchor: 'bottom' })
        .setLngLat([centro.lng, centro.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [centros, handleSelectCentro]);

  // Resetear vista al centro general de Cruz del Eje
  const handleResetCamera = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: CRUZ_DEL_EJE_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: 0,
        bearing: 0,
        duration: 800,
        essential: true,
      });
    }
  };

  return (
    <section id="mapa-sanitario" className={`py-12 sm:py-16 bg-[#e9eff5] border-t border-[#c5d3e0] ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Cabecera Principal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2.5 border border-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>Mapa Sanitario • Cruz del Eje</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-[#003855]">
              Mapa Sanitario • Cruz del Eje
            </h2>
            <p className="text-sm sm:text-lg text-slate-700 mt-2 max-w-3xl leading-relaxed">
              Explorá la red de efectores de salud en Cruz del Eje. Tocá el pin del <strong>Hospital Aurelio Crespo</strong>, <strong>Clínica Cabrera</strong>, <strong>Sanatorio María Isabel</strong> o <strong>Centro de Diagnóstico</strong> para ver sus fotos reales, ubicación exacta y abrir la vista satelital en 3D.
            </p>
          </div>

          {/* Selector de Vistas Prolijo y Profesional */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="inline-flex rounded-xl bg-white p-1 border border-sky-200 shadow-xs">
              <button
                type="button"
                onClick={() => handleChangeStyle('vista1')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mapStyleKey === 'vista1'
                    ? 'bg-[#005a87] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista 1: Mapa urbano detallado con nombres de calles y referencias"
              >
                Vista 1
              </button>
              <button
                type="button"
                onClick={() => handleChangeStyle('vista2')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mapStyleKey === 'vista2'
                    ? 'bg-[#005a87] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista 2: Mapa vectorial moderno"
              >
                Vista 2
              </button>
            </div>

            {/* Enlace directo al panel de calibración solo para administradores / desarrolladores */}
            {isAdminOrDev && (
              <Link
                to="/dashboard/admin/mapa"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition shadow-xs"
                title="Abre el panel privado de calibración para mover pines arrastrándolos con el mouse"
              >
                <Settings className="h-3.5 w-3.5 text-amber-700" />
                <span>Panel Calibrar Pines (Admin)</span>
              </Link>
            )}
          </div>
        </div>

        {/* Carrusel de Pastillas (Pills) para Acceso Rápido a los 4 Centros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            type="button"
            onClick={handleResetCamera}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#005a87]" />
            <span>Ver toda la ciudad</span>
          </button>

          {centros.map((centro) => {
            const isSelected = selectedCentro?.id === centro.id;
            return (
              <button
                key={centro.id}
                type="button"
                onClick={() => handleSelectCentro(centro)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#005a87] text-white border-[#00486c] shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/60'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    centro.esGuardia ? 'bg-rose-500 animate-pulse' : 'bg-sky-500'
                  }`}
                />
                <span>{centro.nombreCorto}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENEDOR DEL MAPA + VENTANITA CHIQUITA FLOTANTE */}
        <div className="relative rounded-3xl border border-sky-200/90 bg-white shadow-2xl shadow-sky-950/10 overflow-hidden">
          {/* Canvas de MapLibre */}
          <div
            ref={mapContainerRef}
            className="w-full h-[540px] sm:h-[620px] cursor-grab active:cursor-grabbing"
          />

          {/* Tag en la esquina superior izquierda */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2 text-xs font-extrabold text-slate-800 border border-sky-200/80 shadow-md pointer-events-none">
            <Navigation className="h-4 w-4 text-[#005a87]" />
            <span>Cruz del Eje • 4 Centros de Salud Principales</span>
          </div>

          {/* Botón flotante para reabrir la ficha si el usuario la cerró */}
          {!selectedCentro && (
            <button
              type="button"
              onClick={() => handleSelectCentro(centros[0])}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-2xl bg-[#005a87] text-white px-4 py-2.5 text-xs font-bold shadow-lg hover:bg-[#00486c] transition cursor-pointer"
            >
              <MapPin className="h-4 w-4" />
              <span>Ver ficha del Hospital Crespo</span>
            </button>
          )}

          {/* VENTANITA CHIQUITA DENTRO DE LA MISMA PÁGINA (Sin bug de renderizado) */}
          {selectedCentro && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 z-20 w-auto sm:w-[420px] max-w-full rounded-2xl border border-sky-200 bg-white/98 backdrop-blur-md p-4 sm:p-5 shadow-2xl shadow-slate-950/25 animate-in slide-in-from-bottom-4 duration-200">
              {/* Cabecera con botón de cierre */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${selectedCentro.badgeColor}`}
                    >
                      {selectedCentro.badgeTipo}
                    </span>
                    {selectedCentro.esGuardia && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white bg-rose-700 px-2 py-0.5 rounded-full">
                        <HeartPulse className="h-3 w-3" />
                        <span>Guardia 24hs Activa</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#003855] font-heading leading-tight">
                    {selectedCentro.nombre}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCentro(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                  title="Cerrar ventanita"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* FOTO DEL LUGAR (Hospital Aurelio Crespo, Clínica Cabrera, etc.) */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 sm:h-40 mb-3 bg-slate-100 shadow-inner group">
                <img
                  src={selectedCentro.fotoUrl}
                  alt={`Fachada de ${selectedCentro.nombre}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/centros/clinica_cabrera.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold drop-shadow flex items-center justify-between">
                  <span className="truncate">{selectedCentro.direccion}</span>
                  <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded font-mono">
                    Cruz del Eje
                  </span>
                </div>
              </div>

              {/* Información de Contacto y Horarios */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-3.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#005a87] shrink-0" />
                  <span className="font-semibold text-slate-800">{selectedCentro.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#005a87] shrink-0" />
                  <a
                    href={`tel:${selectedCentro.telefono.replace(/[^0-9]/g, '')}`}
                    className="font-bold text-[#005a87] hover:underline"
                  >
                    {selectedCentro.telefono}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#005a87] shrink-0" />
                  <span>{selectedCentro.horario}</span>
                </div>
              </div>

              {/* Especialidades destacadas */}
              {selectedCentro.especialidades && selectedCentro.especialidades.length > 0 && (
                <div className="mb-4 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Servicios destacados:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCentro.especialidades.map((esp, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200/60 font-semibold px-2 py-0.5 rounded-md"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* BOTONES DE ACCIÓN: Google Maps, Google Earth 3D y Pedir Turno */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  {/* Link a Google Maps */}
                  <a
                    href={selectedCentro.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-700 bg-sky-50/60 py-2 px-2 text-xs font-bold text-[#005a87] hover:bg-sky-700 hover:text-white transition shadow-xs cursor-pointer text-center"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Google Maps</span>
                  </a>

                  {/* Link a Google Earth / Vista Satelital 3D */}
                  <a
                    href={selectedCentro.googleMaps3dUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-700 bg-indigo-50/60 py-2 px-2 text-xs font-bold text-indigo-800 hover:bg-indigo-700 hover:text-white transition shadow-xs cursor-pointer text-center"
                    title="Abre la vista 3D Satelital de Google con relieve y edificios"
                  >
                    <Globe2 className="h-3.5 w-3.5" />
                    <span>Ver en 3D / Earth</span>
                  </a>
                </div>

                {/* Botón Pedir Turno Online */}
                <Link
                  to="/turnero"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#005a87] py-2.5 px-3 text-xs font-bold text-white shadow-md hover:bg-[#00486c] transition cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Pedir Turno Online en esta Sede</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
