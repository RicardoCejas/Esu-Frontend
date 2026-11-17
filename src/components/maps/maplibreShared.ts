import { setWorkerUrl, type StyleSpecification } from 'maplibre-gl';

export const CRUZ_DEL_EJE_CENTER: [number, number] = [-64.7946, -30.7356];

export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
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

export const OPENFREEMAP_BRIGHT_URL = 'https://tiles.openfreemap.org/styles/bright';

let workerConfigured = false;

export function ensureMapLibreWorker(): void {
  if (workerConfigured || typeof window === 'undefined') return;
  try {
    setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
    workerConfigured = true;
  } catch (err) {
    console.warn('No se pudo configurar el worker de MapLibre GL:', err);
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
