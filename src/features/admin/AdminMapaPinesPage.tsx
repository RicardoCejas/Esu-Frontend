import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  NavigationControl,
  type MapMouseEvent,
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
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import {
  CRUZ_DEL_EJE_CENTER,
  OSM_RASTER_STYLE,
  ensureMapLibreWorker,
  prefersReducedMotion,
} from '@/components/maps/maplibreShared';
import { useAdminMapaPines } from './hooks/useAdminMapaPines';

ensureMapLibreWorker();

export const AdminMapaPinesPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersMapRef = useRef<Record<string, MapLibreMarker>>({});

  const {
    centros,
    selectedCentro,
    selectedId,
    currentLat,
    currentLng,
    saving,
    savedSuccess,
    copied,
    confirmResetOpen,
    setConfirmResetOpen,
    selectCentro,
    setCoordinates,
    guardarCoordenadas,
    confirmarRestablecer,
    copiarCoordenadasTS,
  } = useAdminMapaPines();

  const selectedIdRef = useRef(selectedId);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

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

    map.on('click', (e: MapMouseEvent) => {
      const lat = Number(e.lngLat.lat.toFixed(6));
      const lng = Number(e.lngLat.lng.toFixed(6));
      setCoordinates(lat, lng);
      const marker = markersMapRef.current[selectedIdRef.current];
      marker?.setLngLat([lng, lat]);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [setCoordinates]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersMapRef.current).forEach((m) => m.remove());
    markersMapRef.current = {};

    centros.forEach((centro) => {
      const isSelected = centro.id === selectedId;
      const el = document.createElement('div');
      el.className = 'admin-pin cursor-grab active:cursor-grabbing';

      const colorBg =
        centro.tipo === 'HOSPITAL' ? '#e11d48' : centro.tipo === 'CLINICA' ? '#0284c7' : '#059669';

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
        setCoordinates(lngLat.lat, lngLat.lng, centro.id);
      });

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setCoordinates(lngLat.lat, lngLat.lng, centro.id);
      });

      el.addEventListener('click', () => {
        selectCentro(centro.id);
        map.flyTo({
          center: [centro.lng, centro.lat],
          zoom: 15.8,
          duration: prefersReducedMotion() ? 0 : 700,
        });
      });

      markersMapRef.current[centro.id] = marker;
    });
  }, [centros, selectedId, selectCentro, setCoordinates]);

  const handleCardSelect = (id: string) => {
    selectCentro(id);
    const target = centros.find((c) => c.id === id);
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: [target.lng, target.lat],
        zoom: 15.8,
        duration: prefersReducedMotion() ? 0 : 700,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-sky-700 px-2.5 py-1 rounded-md mb-1.5">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Geolocalización Institucional</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Calibración de Pines del Mapa • Cruz del Eje
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Arrastrá el marcador o hacé clic sobre el mapa para actualizar la ubicación persistida de cada institución.
          </p>
        </div>

        <Link
          to="/#mapa-sanitario"
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition self-start sm:self-auto"
        >
          <span>Ver mapa público</span>
          <ExternalLink className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
        </Link>
      </div>

      {savedSuccess && (
        <div
          role="status"
          className="rounded-xl border border-emerald-700 bg-emerald-700 p-3.5 text-xs text-white flex items-center gap-2.5"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="font-bold">
            Ubicación guardada en servidor. El Mapa Sanitario público refleja las coordenadas actualizadas.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {centros.map((centro) => {
          const isSelected = centro.id === selectedId;
          return (
            <button
              key={centro.id}
              type="button"
              onClick={() => handleCardSelect(centro.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 ${
                isSelected
                  ? 'border-sky-700 bg-card ring-2 ring-sky-600'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${centro.badgeColor}`}>
                  {centro.tipo}
                </span>
              </div>
              <h2 className="font-bold text-sm text-foreground line-clamp-1">{centro.nombreCorto}</h2>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{centro.direccion}</p>
              <p className="text-[10px] tabular-nums text-muted-foreground mt-1">
                Lat: {centro.id === selectedId ? currentLat : centro.lat.toFixed(4)}, Lng:{' '}
                {centro.id === selectedId ? currentLng : centro.lng.toFixed(4)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
            <span className="font-semibold flex items-center gap-1.5 text-foreground">
              <MapPin className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>Arrastrá el pin para ubicar {selectedCentro?.nombreCorto}</span>
            </span>
            <span className="text-[11px] rounded-md bg-slate-800 px-2 py-0.5 font-semibold text-white">
              Cruz del Eje, Córdoba
            </span>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-[460px] rounded-xl border border-border overflow-hidden"
          />

          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-sky-700 shrink-0" aria-hidden="true" />
            <span>Podés arrastrar el marcador o hacer clic en cualquier calle para reubicar la sede seleccionada.</span>
          </p>
        </div>

        {selectedCentro && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-xs">
            <div className="border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">{selectedCentro.nombre}</h3>
              <p className="text-muted-foreground mt-0.5">{selectedCentro.direccion}</p>
            </div>

            <div className="h-28 rounded-xl overflow-hidden border border-border relative bg-muted">
              <img
                src={selectedCentro.fotoUrl}
                alt={selectedCentro.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded">
                Cruz del Eje
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label htmlFor="admin-map-lat" className="block font-bold text-foreground mb-1">
                  Latitud (GPS)
                </label>
                <input
                  id="admin-map-lat"
                  type="number"
                  step="0.000001"
                  value={currentLat}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!Number.isNaN(val)) {
                      setCoordinates(val, currentLng);
                      markersMapRef.current[selectedId]?.setLngLat([currentLng, val]);
                    }
                  }}
                  className="w-full rounded-xl border border-input p-2.5 text-xs bg-background tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                />
              </div>

              <div>
                <label htmlFor="admin-map-lng" className="block font-bold text-foreground mb-1">
                  Longitud (GPS)
                </label>
                <input
                  id="admin-map-lng"
                  type="number"
                  step="0.000001"
                  value={currentLng}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!Number.isNaN(val)) {
                      setCoordinates(currentLat, val);
                      markersMapRef.current[selectedId]?.setLngLat([val, currentLat]);
                    }
                  }}
                  className="w-full rounded-xl border border-input p-2.5 text-xs bg-background tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                />
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <button
                type="button"
                disabled={saving}
                onClick={guardarCoordenadas}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 font-bold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>{saving ? 'Guardando...' : 'Guardar Ubicación'}</span>
              </button>

              <button
                type="button"
                onClick={copiarCoordenadasTS}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 py-2 font-bold text-foreground hover:bg-muted transition cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Coordenadas TS'}</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmResetOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-300 py-2 font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Restablecer Predeterminados</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalConfirmacion
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={confirmarRestablecer}
        title="Restablecer coordenadas oficiales"
        description="¿Confirmás restablecer la ubicación geográfica de todas las sedes a las coordenadas predeterminadas de Cruz del Eje?"
        confirmText="Restablecer"
        cancelText="Cancelar"
        variant="warning"
        isLoading={saving}
      />
    </div>
  );
};
