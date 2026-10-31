import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  NavigationControl,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  Save,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Info,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  type CentroMapaPin,
  mapaCentrosService,
} from '../home/mapaCentrosData';

const CRUZ_DEL_EJE_CENTER: [number, number] = [-64.7946, -30.7356];

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

export const AdminMapaPinesPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersMapRef = useRef<Record<string, MapLibreMarker>>({});

  const [centros, setCentros] = useState<CentroMapaPin[]>(() => mapaCentrosService.getCentros());
  const [selectedId, setSelectedId] = useState<string>(centros[0]?.id || 'cde-hosp-crespo');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Coordenadas en edición
  const selectedCentro = centros.find((c) => c.id === selectedId) || centros[0];
  const [currentLat, setCurrentLat] = useState<number>(selectedCentro.lat);
  const [currentLng, setCurrentLng] = useState<number>(selectedCentro.lng);

  const handleSelectCentro = useCallback((id: string) => {
    setSelectedId(id);
    const target = centros.find((c) => c.id === id);
    if (target) {
      setCurrentLat(target.lat);
      setCurrentLng(target.lng);
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [target.lng, target.lat],
          zoom: 15.8,
          duration: 900,
        });
      }
    }
  }, [centros]);

  // Inicializar mapa interactivo de administración
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: OSM_RASTER_STYLE,
      center: CRUZ_DEL_EJE_CENTER,
      zoom: 14.2,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ visualizePitch: false }), 'top-right');

    map.on('click', (e) => {
      const lat = Number(e.lngLat.lat.toFixed(6));
      const lng = Number(e.lngLat.lng.toFixed(6));
      setCurrentLat(lat);
      setCurrentLng(lng);

      // Actualizar marcador arrastrado
      const m = markersMapRef.current[selectedId];
      if (m) {
        m.setLngLat([lng, lat]);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [selectedId]);

  // Crear marcadores arrastrables (Draggable) para cada centro
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar marcadores viejos
    Object.values(markersMapRef.current).forEach((m) => m.remove());
    markersMapRef.current = {};

    centros.forEach((centro) => {
      const isSelected = centro.id === selectedId;
      const el = document.createElement('div');
      el.className = 'admin-pin cursor-grab active:cursor-grabbing';

      const colorBg =
        centro.tipo === 'HOSPITAL'
          ? '#e11d48'
          : centro.tipo === 'CLINICA'
          ? '#0284c7'
          : '#059669';

      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
          <div style="background-color: ${colorBg}; color: white; width: ${isSelected ? '38px' : '32px'}; height: ${isSelected ? '38px' : '32px'}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 0 0 2px ${colorBg};">
            <span style="transform: rotate(45deg); font-weight: 900; font-size: ${isSelected ? '15px' : '13px'};">
              ${centro.tipo === 'HOSPITAL' ? '✚' : '🏥'}
            </span>
          </div>
          <div style="background: white; color: #0f172a; font-weight: 800; font-size: 11px; padding: 2px 7px; border-radius: 6px; white-space: nowrap; margin-top: 3px; border: 1.5px solid ${colorBg}; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
            ${centro.nombreCorto}
          </div>
        </div>
      `;

      const marker = new MapLibreMarker({ element: el, draggable: true, anchor: 'bottom' })
        .setLngLat([centro.lng, centro.lat])
        .addTo(map);

      marker.on('drag', () => {
        const lngLat = marker.getLngLat();
        setSelectedId(centro.id);
        setCurrentLat(Number(lngLat.lat.toFixed(6)));
        setCurrentLng(Number(lngLat.lng.toFixed(6)));
      });

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setSelectedId(centro.id);
        setCurrentLat(Number(lngLat.lat.toFixed(6)));
        setCurrentLng(Number(lngLat.lng.toFixed(6)));
      });

      el.addEventListener('click', () => {
        handleSelectCentro(centro.id);
      });

      markersMapRef.current[centro.id] = marker;
    });
  }, [centros, selectedId, handleSelectCentro]);

  // Guardar ubicación modificada
  const handleGuardarCoordenadas = () => {
    const nuevosCentros = mapaCentrosService.guardarCoordenadas(selectedId, currentLat, currentLng);
    setCentros(nuevosCentros);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Restablecer a los valores originales
  const handleRestablecer = () => {
    if (window.confirm('¿Restablecer las coordenadas de todos los centros a los valores oficiales?')) {
      const restablecidos = mapaCentrosService.restablecerPredeterminados();
      setCentros(restablecidos);
      const sel = restablecidos.find((c) => c.id === selectedId) || restablecidos[0];
      setCurrentLat(sel.lat);
      setCurrentLng(sel.lng);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  // Copiar código TypeScript para el desarrollador
  const handleCopiarTS = () => {
    const tsCode = `// Coordenadas actualizadas de Cruz del Eje:\n` +
      centros
        .map(
          (c) =>
            `// ${c.nombreCorto}\nlat: ${c.id === selectedId ? currentLat : c.lat},\nlng: ${c.id === selectedId ? currentLng : c.lng},`
        )
        .join('\n\n');
    navigator.clipboard.writeText(tsCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md mb-1.5 border border-sky-200">
            <Building2 className="h-3.5 w-3.5" />
            <span>Configuración de Geolocalización • Modo Desarrollador</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Calibración de Pines del Mapa • Cruz del Eje
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Arrastra el pin directamente en el mapa o haz clic en la calle exacta para calibrar la ubicación de cada una de las 4 instituciones.
          </p>
        </div>

        <Link
          to="/#mapa-sanitario"
          className="inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-white px-4 py-2 text-xs font-bold text-sky-800 hover:bg-sky-50 transition shadow-xs self-start sm:self-auto"
        >
          <span>Ver mapa público</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Alerta de guardado exitoso */}
      {savedSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-bold">
            ¡Ubicación guardada con éxito! La página principal ya refleja las nuevas coordenadas.
          </span>
        </div>
      )}

      {/* Selector de los 4 Centros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {centros.map((centro) => {
          const isSelected = centro.id === selectedId;
          return (
            <button
              key={centro.id}
              type="button"
              onClick={() => handleSelectCentro(centro.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/80 shadow-md ring-2 ring-sky-300'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${centro.badgeColor}`}>
                  {centro.tipo}
                </span>
              </div>
              <h4 className="font-bold text-sm text-foreground line-clamp-1">{centro.nombreCorto}</h4>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{centro.direccion}</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Lat: {centro.id === selectedId ? currentLat : centro.lat.toFixed(4)}, Lng:{' '}
                {centro.id === selectedId ? currentLng : centro.lng.toFixed(4)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Panel Central: Mapa Interactivo y Formulario de Ajuste Preciso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Contenedor del Mapa MapLibre (2 columnas) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-sky-600" />
              <span>Arrastra el pin en el mapa para ubicar {selectedCentro.nombreCorto}</span>
            </span>
            <span className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded">
              Cruz del Eje, Córdoba
            </span>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-[480px] rounded-xl border border-sky-100 overflow-hidden shadow-inner"
          />

          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            <span>
              Tip: Puedes arrastrar el marcador con el mouse o hacer clic en cualquier calle para reubicarlo.
            </span>
          </p>
        </div>

        {/* Formulario Lateral de Calibración Numérica (1 columna) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 text-xs">
          <div className="border-b pb-3">
            <h3 className="font-extrabold text-base text-foreground font-heading">
              {selectedCentro.nombre}
            </h3>
            <p className="text-muted-foreground mt-0.5">{selectedCentro.direccion}</p>
          </div>

          {/* Foto miniatura del centro */}
          <div className="h-28 rounded-xl overflow-hidden border border-border relative bg-muted">
            <img
              src={selectedCentro.fotoUrl}
              alt={selectedCentro.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
              Cruz del Eje
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block font-bold text-foreground mb-1">Latitud (GPS)</label>
              <input
                type="number"
                step="0.000001"
                value={currentLat}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentLat(val);
                  const m = markersMapRef.current[selectedId];
                  if (m && !isNaN(val)) m.setLngLat([currentLng, val]);
                }}
                className="w-full rounded-xl border border-input p-2.5 font-mono text-xs bg-background outline-none focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Longitud (GPS)</label>
              <input
                type="number"
                step="0.000001"
                value={currentLng}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentLng(val);
                  const m = markersMapRef.current[selectedId];
                  if (m && !isNaN(val)) m.setLngLat([val, currentLat]);
                }}
                className="w-full rounded-xl border border-input p-2.5 font-mono text-xs bg-background outline-none focus:border-sky-600"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-2 pt-3 border-t">
            <button
              type="button"
              onClick={handleGuardarCoordenadas}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 font-bold text-white hover:bg-sky-800 transition shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Ubicación</span>
            </button>

            <button
              type="button"
              onClick={handleCopiarTS}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 py-2 font-bold text-foreground hover:bg-muted transition cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Coordenadas TS'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestablecer}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 py-2 font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
              title="Vuelve a las coordenadas originales registradas en Cruz del Eje"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restablecer Predeterminados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
