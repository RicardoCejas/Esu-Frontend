import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AttributionControl,
  FullscreenControl,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  NavigationControl,
  type ErrorEvent,
} from 'maplibre-gl';
import { centrosService } from '@/api/centrosService';
import {
  CRUZ_DEL_EJE_CENTER,
  OPENFREEMAP_BRIGHT_URL,
  OSM_RASTER_STYLE,
  ensureMapLibreWorker,
  prefersReducedMotion,
} from '@/components/maps/maplibreShared';
import { type CentroMapaPin, mapCentroSaludToPin, mapaCentrosService } from '../mapaCentrosData';

export type MapaStyleKey = 'vista1' | 'vista2';

const DEFAULT_ZOOM = 14.1;

function buildMarkerElement(centro: CentroMapaPin, onSelect: (pin: CentroMapaPin) => void): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'cde-pin-root cursor-pointer select-none';

  const colorBg =
    centro.tipo === 'HOSPITAL' ? '#e11d48' : centro.tipo === 'CLINICA' ? '#0284c7' : '#059669';
  const iconSymbol = centro.tipo === 'HOSPITAL' ? 'H' : centro.tipo === 'CLINICA' ? 'C' : 'D';

  const innerDiv = document.createElement('div');
  innerDiv.style.display = 'flex';
  innerDiv.style.flexDirection = 'column';
  innerDiv.style.alignItems = 'center';
  innerDiv.style.transition = prefersReducedMotion()
    ? 'none'
    : 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.18s ease';
  innerDiv.style.willChange = 'transform';
  innerDiv.style.pointerEvents = 'auto';

  const teardrop = document.createElement('div');
  teardrop.style.backgroundColor = colorBg;
  teardrop.style.color = '#ffffff';
  teardrop.style.width = '34px';
  teardrop.style.height = '34px';
  teardrop.style.borderRadius = '50% 50% 50% 0';
  teardrop.style.transform = 'rotate(-45deg)';
  teardrop.style.display = 'flex';
  teardrop.style.alignItems = 'center';
  teardrop.style.justifyContent = 'center';
  teardrop.style.border = '2.5px solid #ffffff';
  teardrop.style.boxShadow = '0 4px 10px rgba(0,0,0,0.35)';

  const symbolEl = document.createElement('span');
  symbolEl.style.transform = 'rotate(45deg)';
  symbolEl.style.fontWeight = '900';
  symbolEl.style.fontSize = '13px';
  symbolEl.style.lineHeight = '1';
  symbolEl.textContent = iconSymbol;
  teardrop.appendChild(symbolEl);

  const label = document.createElement('div');
  label.style.background = '#ffffff';
  label.style.color = '#0f172a';
  label.style.fontWeight = '800';
  label.style.fontSize = '11px';
  label.style.padding = '2px 8px';
  label.style.borderRadius = '8px';
  label.style.whiteSpace = 'nowrap';
  label.style.marginTop = '3px';
  label.style.border = `1.5px solid ${colorBg}`;
  label.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  label.textContent = centro.nombreCorto;

  innerDiv.appendChild(teardrop);
  innerDiv.appendChild(label);

  innerDiv.addEventListener('mouseenter', () => {
    innerDiv.style.transform = prefersReducedMotion() ? 'none' : 'scale(1.14) translateY(-3px)';
    el.style.zIndex = '50';
  });
  innerDiv.addEventListener('mouseleave', () => {
    innerDiv.style.transform = 'scale(1) translateY(0)';
    el.style.zIndex = '10';
  });
  innerDiv.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect(centro);
  });

  el.appendChild(innerDiv);
  return el;
}

/**
 * Manages public health center map state, backend pin sync, and MapLibre instance lifecycle.
 */
export function useMapaCruzDelEje(onSelectPin?: (pin: CentroMapaPin) => void) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);

  const [centros, setCentros] = useState<CentroMapaPin[]>(() => mapaCentrosService.getCentros());
  const [selectedCentro, setSelectedCentro] = useState<CentroMapaPin | null>(() => centros[0] ?? null);
  const [mapStyleKey, setMapStyleKey] = useState<MapaStyleKey>('vista1');

  useEffect(() => {
    let active = true;
    centrosService
      .getAll()
      .then((apiCentros) => {
        if (!active || !Array.isArray(apiCentros) || apiCentros.length === 0) return;
        const pins = apiCentros.map(mapCentroSaludToPin);
        setCentros(pins);
        setSelectedCentro((prev) => (prev ? pins.find((p) => p.id === prev.id) ?? pins[0] : pins[0] ?? null));
      })
      .catch(() => {
        // Keep cached/default pins when backend is offline in public landing view.
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelectCentro = useCallback(
    (centro: CentroMapaPin) => {
      setSelectedCentro(centro);
      if (onSelectPin) onSelectPin(centro);
      const map = mapRef.current;
      if (!map) return;

      const reduceMotion = prefersReducedMotion();
      map.flyTo({
        center: [centro.lng, centro.lat],
        zoom: 15.7,
        pitch: reduceMotion ? 0 : 30,
        bearing: 0,
        duration: reduceMotion ? 0 : 900,
        essential: true,
      });
    },
    [onSelectPin]
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;
    ensureMapLibreWorker();

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
    map.on('load', () => map.resize());
    map.on('error', (e: ErrorEvent) => console.warn('MapLibre error evento:', e));

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = centros.map((centro) =>
      new MapLibreMarker({ element: buildMarkerElement(centro, handleSelectCentro), anchor: 'bottom' })
        .setLngLat([centro.lng, centro.lat])
        .addTo(map)
    );
  }, [centros, handleSelectCentro]);

  const handleChangeStyle = useCallback((key: MapaStyleKey) => {
    setMapStyleKey(key);
    const map = mapRef.current;
    if (!map) return;
    try {
      map.setStyle(key === 'vista1' ? OSM_RASTER_STYLE : OPENFREEMAP_BRIGHT_URL);
    } catch (err) {
      console.warn('Error alternando estilo, regresando a Vista 1:', err);
      map.setStyle(OSM_RASTER_STYLE);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: CRUZ_DEL_EJE_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: prefersReducedMotion() ? 0 : 800,
      essential: true,
    });
  }, []);

  return {
    mapContainerRef,
    centros,
    selectedCentro,
    setSelectedCentro,
    mapStyleKey,
    handleSelectCentro,
    handleChangeStyle,
    handleResetCamera,
  };
}
