import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  NavigationControl,
} from 'maplibre-gl';
import {
  CRUZ_DEL_EJE_CENTER,
  OSM_RASTER_STYLE,
  ensureMapLibreWorker,
  prefersReducedMotion,
} from './maplibreShared';

ensureMapLibreWorker();

interface UseCenterMapPickerParams {
  latitud?: number;
  longitud?: number;
  readOnly: boolean;
  onChangeCoords?: (lat: number, lng: number) => void;
}

/**
 * Manages the MapLibre GL instance and synchronized marker for a single center coordinate pair.
 */
export function useCenterMapPicker({
  latitud,
  longitud,
  readOnly,
  onChangeCoords,
}: UseCenterMapPickerParams) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const onChangeRef = useRef(onChangeCoords);
  useEffect(() => {
    onChangeRef.current = onChangeCoords;
  }, [onChangeCoords]);

  const [mapError, setMapError] = useState(false);

  const hasValidCoords =
    typeof latitud === 'number' &&
    Number.isFinite(latitud) &&
    typeof longitud === 'number' &&
    Number.isFinite(longitud);

  const initialLng = hasValidCoords ? longitud : CRUZ_DEL_EJE_CENTER[0];
  const initialLat = hasValidCoords ? latitud : CRUZ_DEL_EJE_CENTER[1];

  useEffect(() => {
    if (!containerRef.current) return;
    let map: MapLibreMap | null = null;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: OSM_RASTER_STYLE,
        center: [initialLng, initialLat],
        zoom: hasValidCoords ? 15.5 : 13.8,
        attributionControl: false,
      });

      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

      const marker = new MapLibreMarker({
        color: '#0369a1',
        draggable: !readOnly,
      })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      if (!readOnly) {
        marker.on('dragend', () => {
          const pos = marker.getLngLat();
          onChangeRef.current?.(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
        });

        map.on('click', (e) => {
          const { lat, lng } = e.lngLat;
          marker.setLngLat([lng, lat]);
          onChangeRef.current?.(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        });
      }

      map.on('load', () => map?.resize());
      mapRef.current = map;
      markerRef.current = marker;
    } catch {
      queueMicrotask(() => setMapError(true));
    }

    return () => {
      markerRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
    // Initial center captured on mount; live coord sync handled in effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !hasValidCoords) return;
    marker.setLngLat([longitud, latitud]);
    map.easeTo({
      center: [longitud, latitud],
      duration: prefersReducedMotion() ? 0 : 450,
    });
  }, [hasValidCoords, latitud, longitud]);

  const handleCenterCity = useCallback(() => {
    if (readOnly) return;
    const [lng, lat] = CRUZ_DEL_EJE_CENTER;
    markerRef.current?.setLngLat([lng, lat]);
    mapRef.current?.easeTo({
      center: [lng, lat],
      zoom: 14.2,
      duration: prefersReducedMotion() ? 0 : 450,
    });
    onChangeRef.current?.(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
  }, [readOnly]);

  return { containerRef, mapError, handleCenterCity };
}
