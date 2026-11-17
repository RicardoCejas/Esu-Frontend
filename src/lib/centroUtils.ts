export const ESTUDIOS_DIAGNOSTICOS_CATALOGO: readonly string[] = [
  'Laboratorio de Análisis Clínicos',
  'Radiografía Digital',
  'Ecografía General',
  'Ecografía Mamaria',
] as const;

export function buildFloorOptions(cantidadPlantas?: number | null, existingFloor?: string): string[] {
  const parsed = Number(cantidadPlantas);
  const count = Number.isFinite(parsed) && parsed >= 1 ? Math.min(30, Math.floor(parsed)) : 1;
  const floors: string[] = ['Planta Baja'];
  for (let i = 1; i < count; i += 1) {
    floors.push(`${i}° Piso`);
  }
  const normalizedExisting = existingFloor?.trim();
  if (
    normalizedExisting &&
    !floors.some((floor) => floor.toLowerCase() === normalizedExisting.toLowerCase())
  ) {
    floors.push(normalizedExisting);
  }
  return floors;
}

export function parseCoordinatePair(
  latRaw?: number | string | null,
  lngRaw?: number | string | null
): { lat: number; lng: number } | null {
  if (latRaw === undefined || latRaw === null || latRaw === '' || lngRaw === undefined || lngRaw === null || lngRaw === '') {
    return null;
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

export function buildGoogleMapsUrl(
  lat?: number | null,
  lng?: number | null,
  fallbackQuery?: string
): string {
  const coords = parseCoordinatePair(lat, lng);
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  }
  const query = encodeURIComponent(fallbackQuery?.trim() || 'Cruz del Eje, Córdoba');
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildGoogleMaps3dUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@${lat},${lng},18.5z/data=!3m1!1e3`;
}

export function buildGoogleEarthUrl(nombre: string, lat: number, lng: number): string {
  const encoded = encodeURIComponent(`${nombre} Cruz del Eje`);
  return `https://earth.google.com/web/search/${encoded}/@${lat},${lng},500d,35y,0h,45t,0r`;
}
