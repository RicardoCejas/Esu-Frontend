export interface CentroMapaPin {
  id: string;
  nombre: string;
  nombreCorto: string;
  tipo: 'HOSPITAL' | 'CLINICA' | 'DIAGNOSTICO';
  badgeTipo: string;
  badgeColor: string;
  direccion: string;
  barrio?: string;
  ciudad: string;
  telefono: string;
  horario: string;
  esGuardia: boolean;
  lat: number;
  lng: number;
  fotoUrl: string;
  descripcion: string;
  especialidades: string[];
  googleMapsUrl: string;
  googleEarthUrl: string;
  googleMaps3dUrl: string;
  esPersonalizado?: boolean;
}

// Las 4 instituciones médicas principales de Cruz del Eje con coordenadas y direcciones exactas
export const CENTROS_DEFAULT_CDE: CentroMapaPin[] = [
  {
    id: 'cde-hosp-crespo',
    nombre: 'Hospital Regional Dr. Aurelio Crespo',
    nombreCorto: 'Hosp. Aurelio Crespo',
    tipo: 'HOSPITAL',
    badgeTipo: 'Hospital Zonal Provincial',
    badgeColor: 'bg-rose-700 text-white',
    direccion: 'Félix Cáceres 265 (esq. Av. Eva Perón), Cruz del Eje',
    barrio: 'Barrio Hospital',
    ciudad: 'Cruz del Eje',
    telefono: '(03549) 422001 / 107',
    horario: 'Atención 24hs (Guardia Activa permanente)',
    esGuardia: true,
    lat: -30.743400,
    lng: -64.787600,
    fotoUrl: '/centros/hospital_aurelio_crespo.jpg',
    descripcion: 'Principal efector público de referencia quirúrgica y de emergencias de todo el departamento Cruz del Eje.',
    especialidades: ['Guardia Activa 24hs', 'Clínica Médica', 'Pediatría', 'Cardiología', 'Traumatología', 'Cirugía'],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hospital+Regional+Aurelio+Crespo+Cruz+del+Eje',
    googleEarthUrl: 'https://earth.google.com/web/search/Hospital+Regional+Aurelio+Crespo+Cruz+del+Eje/@-30.743400,-64.787600,500d,35y,0h,45t,0r',
    googleMaps3dUrl: 'https://www.google.com/maps/@-30.743400,-64.787600,18.5z/data=!3m1!1e3',
  },
  {
    id: 'cde-clin-cabrera',
    nombre: 'Clínica Privada Cabrera',
    nombreCorto: 'Clínica Cabrera',
    tipo: 'CLINICA',
    badgeTipo: 'Clínica Quirúrgica y Especialidades',
    badgeColor: 'bg-sky-700 text-white',
    direccion: 'Av. Eva Perón 642, Cruz del Eje',
    barrio: 'Centro',
    ciudad: 'Cruz del Eje',
    telefono: '(03549) 423110',
    horario: 'Lunes a Sábados 08:00 a 20:30 hs',
    esGuardia: true,
    lat: -30.731335,
    lng: -64.794168,
    fotoUrl: '/centros/clinica_cabrera.jpg',
    descripcion: 'Institución sanatorial privada con quirófanos, internación, consultorios externos y convenios con todas las obras sociales y prepagas.',
    especialidades: ['Cardiología', 'Cirugía', 'Traumatología', 'Ginecología', 'Oftalmología', 'Pediatría'],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Clinica+Privada+Cabrera+Cruz+del+Eje',
    googleEarthUrl: 'https://earth.google.com/web/search/Clinica+Privada+Cabrera+Cruz+del+Eje/@-30.731335,-64.794168,500d,35y,0h,45t,0r',
    googleMaps3dUrl: 'https://www.google.com/maps/@-30.731335,-64.794168,18.5z/data=!3m1!1e3',
  },
  {
    id: 'cde-sanatorio-isabel',
    nombre: 'Sanatorio María Isabel',
    nombreCorto: 'Sanatorio M. Isabel',
    tipo: 'CLINICA',
    badgeTipo: 'Sanatorio e Internación',
    badgeColor: 'bg-indigo-700 text-white',
    direccion: 'Sarmiento 289, Centro, Cruz del Eje',
    barrio: 'Centro',
    ciudad: 'Cruz del Eje',
    telefono: '(03549) 422400',
    horario: 'Lunes a Viernes 07:30 a 20:30 hs',
    esGuardia: false,
    lat: -30.728427,
    lng: -64.801300,
    fotoUrl: '/centros/sanatorio_maria_isabel.jpg',
    descripcion: 'Sanatorio de amplia trayectoria en Cruz del Eje enfocado en atención ambulatoria, internación clínica y estudios diagnósticos.',
    especialidades: ['Medicina General', 'Cardiología', 'Ginecología', 'Internación Clínica'],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sanatorio+Maria+Isabel+Cruz+del+Eje',
    googleEarthUrl: 'https://earth.google.com/web/search/Sanatorio+Maria+Isabel+Cruz+del+Eje/@-30.728427,-64.801300,500d,35y,0h,45t,0r',
    googleMaps3dUrl: 'https://www.google.com/maps/@-30.728427,-64.801300,18.5z/data=!3m1!1e3',
  },
  {
    id: 'cde-centro-diag',
    nombre: 'Centro de Diagnóstico Cruz del Eje',
    nombreCorto: 'Centro de Diagnóstico',
    tipo: 'DIAGNOSTICO',
    badgeTipo: 'Imágenes y Laboratorio',
    badgeColor: 'bg-emerald-700 text-white',
    direccion: 'Sarmiento 289 (Ala Diagnóstico e Imágenes), Cruz del Eje',
    barrio: 'Centro',
    ciudad: 'Cruz del Eje',
    telefono: '(03549) 421550',
    horario: 'Lunes a Viernes 07:00 a 19:30 hs',
    esGuardia: false,
    lat: -30.727950,
    lng: -64.801750,
    fotoUrl: '/centros/centro_diagnostico_v2.jpg',
    descripcion: 'Complejo de alta resolución en diagnóstico médico por imágenes, ecografías doppler, radiografías digitales y análisis bioquímicos.',
    especialidades: ['Ecografías', 'Rayos X Digital', 'Laboratorio', 'Cardiodiagnóstico'],
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centro+de+Diagnostico+Cruz+del+Eje',
    googleEarthUrl: 'https://earth.google.com/web/search/Centro+de+Diagnostico+Cruz+del+Eje/@-30.727950,-64.801750,500d,35y,0h,45t,0r',
    googleMaps3dUrl: 'https://www.google.com/maps/@-30.727950,-64.801750,18.5z/data=!3m1!1e3',
  },
];

const STORAGE_CUSTOM_COORDS = 'esu_cde_centros_coords_v2';

export const mapaCentrosService = {
  getCentros(): CentroMapaPin[] {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_COORDS);
      if (stored) {
        const savedCoords: Record<string, { lat: number; lng: number }> = JSON.parse(stored);
        return CENTROS_DEFAULT_CDE.map((centro) => {
          if (savedCoords[centro.id]) {
            const lat = Number(savedCoords[centro.id].lat);
            const lng = Number(savedCoords[centro.id].lng);
            const queryEncoded = encodeURIComponent(`${centro.nombre} Cruz del Eje`);
            return {
              ...centro,
              lat,
              lng,
              googleEarthUrl: `https://earth.google.com/web/search/${queryEncoded}/@${lat},${lng},500d,35y,0h,45t,0r`,
              googleMaps3dUrl: `https://www.google.com/maps/@${lat},${lng},18.5z/data=!3m1!1e3`,
            };
          }
          return centro;
        });
      }
    } catch (e) {
      console.warn('Error leyendo coordenadas guardadas:', e);
    }
    return [...CENTROS_DEFAULT_CDE];
  },

  guardarCoordenadas(centroId: string, lat: number, lng: number): CentroMapaPin[] {
    try {
      let savedCoords: Record<string, { lat: number; lng: number }> = {};
      const stored = localStorage.getItem(STORAGE_CUSTOM_COORDS);
      if (stored) {
        savedCoords = JSON.parse(stored);
      }
      savedCoords[centroId] = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
      localStorage.setItem(STORAGE_CUSTOM_COORDS, JSON.stringify(savedCoords));
    } catch (e) {
      console.warn('Error guardando coordenadas:', e);
    }
    return this.getCentros();
  },

  guardarTodasCoordenadas(coordsMap: Record<string, { lat: number; lng: number }>): CentroMapaPin[] {
    try {
      localStorage.setItem(STORAGE_CUSTOM_COORDS, JSON.stringify(coordsMap));
    } catch (e) {
      console.warn('Error guardando mapa de coordenadas:', e);
    }
    return this.getCentros();
  },

  restablecerPredeterminados(): CentroMapaPin[] {
    localStorage.removeItem(STORAGE_CUSTOM_COORDS);
    return [...CENTROS_DEFAULT_CDE];
  },
};
