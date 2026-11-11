import React, { useState, useEffect, useCallback, useRef } from 'react';
import { centrosService } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { mapaCentrosService } from '@/features/home/mapaCentrosData';
import type { CentroSalud, User } from '@/types';
import {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  NavigationControl,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  X,
  AlertCircle,
  RefreshCw,
  KeyRound,
  User as UserIcon,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// Estilo OpenStreetMap oficial (Raster nítido, sin fallas)
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

// Búsqueda inteligente de direcciones integrada con OpenStreetMap y diccionario de Cruz del Eje
export async function buscarDireccionEnMapa(
  direccion: string,
  nombreSede: string = ''
): Promise<{ lat: number; lng: number; nombreUbicacion: string }> {
  const query = direccion.trim();
  if (!query) {
    return { lat: -30.7356, lng: -64.7946, nombreUbicacion: 'Cruz del Eje Centro' };
  }

  const lower = `${direccion} ${nombreSede}`.toLowerCase();

  // Diccionario local inmediato para Cruz del Eje y localidades vecinas
  if (lower.includes('media naranja')) {
    return { lat: -30.646631, lng: -64.926053, nombreUbicacion: 'Comuna de Media Naranja, Cruz del Eje' };
  }
  if (lower.includes('san marcos')) {
    return { lat: -30.781200, lng: -64.633500, nombreUbicacion: 'San Marcos Sierras' };
  }
  if (lower.includes('el brete')) {
    return { lat: -30.683300, lng: -64.733300, nombreUbicacion: 'El Brete, Cruz del Eje' };
  }
  if (lower.includes('las playas')) {
    return { lat: -30.700000, lng: -64.833300, nombreUbicacion: 'Las Playas, Cruz del Eje' };
  }
  if (lower.includes('guanaco')) {
    return { lat: -30.483300, lng: -65.050000, nombreUbicacion: 'Guanaco Muerto' };
  }
  if (lower.includes('crespo') || lower.includes('caceres') || lower.includes('cáceres')) {
    return { lat: -30.743400, lng: -64.787600, nombreUbicacion: 'Hospital Dr. Aurelio Crespo (Félix Cáceres 265)' };
  }
  if (lower.includes('cabrera') || lower.includes('eva peron') || lower.includes('eva perón')) {
    return { lat: -30.731335, lng: -64.794168, nombreUbicacion: 'Clínica Cabrera (Av. Eva Perón 642)' };
  }
  if (lower.includes('isabel') || lower.includes('pellegrini')) {
    return { lat: -30.728427, lng: -64.801300, nombreUbicacion: 'Sanatorio María Isabel (Pellegrini 320)' };
  }
  if (lower.includes('diagnostico') || lower.includes('diagnóstico') || lower.includes('rivadavia')) {
    return { lat: -30.727950, lng: -64.801750, nombreUbicacion: 'Centro de Diagnóstico (Rivadavia 210)' };
  }
  if (lower.includes('sarmiento') || lower.includes('plaza') || lower.includes('san martin') || lower.includes('san martín')) {
    return { lat: -30.728500, lng: -64.799000, nombreUbicacion: 'Casco Céntrico (Plaza 25 de Mayo)' };
  }
  if (lower.includes('ruta 38') || lower.includes('juan b justo') || lower.includes('acceso norte')) {
    return { lat: -30.721000, lng: -64.802000, nombreUbicacion: 'Acceso Norte / Ruta Nacional 38' };
  }
  if (lower.includes('costanera') || lower.includes('balneario') || lower.includes('rio')) {
    return { lat: -30.725000, lng: -64.810000, nombreUbicacion: 'Costanera Municipal / Río Cruz del Eje' };
  }

  // Búsqueda en vivo en OpenStreetMap Nominatim
  try {
    const qFinal = encodeURIComponent(`${query}, Cruz del Eje, Cordoba, Argentina`);
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${qFinal}&limit=1`, {
      headers: { 'User-Agent': 'ESU-CruzDelEje-App/1.0' },
    });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lng)) {
          const primerNombre = item.display_name?.split(',')[0] || query;
          return { lat, lng, nombreUbicacion: `${primerNombre}, Cruz del Eje` };
        }
      }
    }
  } catch {
    // Fallback
  }

  // Generador determinista de coordenadas dentro del radio de Cruz del Eje
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash << 5) - hash + lower.charCodeAt(i);
    hash |= 0;
  }
  const offsetLat = (Math.abs(hash) % 1500) / 100000;
  const offsetLng = (Math.abs(hash >> 2) % 1500) / 100000;
  return {
    lat: Number((-30.728000 - offsetLat).toFixed(6)),
    lng: Number((-64.795000 - offsetLng).toFixed(6)),
    nombreUbicacion: `${query}, Cruz del Eje`,
  };
}

// Función sincronizada rápida para las tarjetas del listado
export function detectarCoordenadasCruzDelEje(direccion: string, nombreSede: string): { lat: number; lng: number; zonaNombre: string } {
  const lower = `${direccion} ${nombreSede}`.toLowerCase();
  if (lower.includes('media naranja')) {
    return { lat: -30.646631, lng: -64.926053, zonaNombre: 'Media Naranja' };
  }
  if (lower.includes('crespo') || lower.includes('caceres') || lower.includes('hospital')) {
    return { lat: -30.743400, lng: -64.787600, zonaNombre: 'Zona Hosp. Aurelio Crespo' };
  }
  if (lower.includes('cabrera') || lower.includes('eva peron') || lower.includes('eva perón')) {
    return { lat: -30.731335, lng: -64.794168, zonaNombre: 'Av. Eva Perón (Clínica Cabrera)' };
  }
  if (lower.includes('isabel') || lower.includes('pellegrini')) {
    return { lat: -30.728427, lng: -64.801300, zonaNombre: 'Calle Pellegrini (Sanatorio María Isabel)' };
  }
  if (lower.includes('diagnostico') || lower.includes('rivadavia')) {
    return { lat: -30.727950, lng: -64.801750, zonaNombre: 'Calle Rivadavia (Centro Diagnóstico)' };
  }
  if (lower.includes('sarmiento') || lower.includes('plaza') || lower.includes('centro')) {
    return { lat: -30.728500, lng: -64.799000, zonaNombre: 'Casco Céntrico' };
  }
  return { lat: -30.735600, lng: -64.794600, zonaNombre: 'Cruz del Eje' };
}

export const AdminSedesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Centro (Crear / Editar)
  const [modalCentroOpen, setModalCentroOpen] = useState(false);
  const [editandoCentro, setEditandoCentro] = useState<CentroSalud | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [centroForm, setCentroForm] = useState({
    nombre: '',
    tipo: 'CLINICA' as CentroSalud['tipo'],
    direccion: '',
    // Credenciales de Recepcionista para este centro
    usuarioEmail: '',
    usuarioPassword: '',
  });

  // Estado del pin en el mapa integrado
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number; nombreUbicacion: string }>({
    lat: -30.7356,
    lng: -64.7946,
    nombreUbicacion: 'Cruz del Eje',
  });
  const [buscandoMapa, setBuscandoMapa] = useState(false);
  const mapModalContainerRef = useRef<HTMLDivElement>(null);
  const mapModalRef = useRef<MapLibreMap | null>(null);
  const markerModalRef = useRef<MapLibreMarker | null>(null);

  const [sedeAEliminar, setSedeAEliminar] = useState<CentroSalud | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const cData = await centrosService.getAll();
      setCentros(Array.isArray(cData) ? cData : []);
    } catch (err: unknown) {
      setLoadError(extractApiErrorMessage(err, 'No se pudieron cargar las sedes sanitarias del sistema.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Obtener cuenta de recepción vinculada
  const getCuentaRecepcion = (centroId: string | number, centroNombre: string) => {
    try {
      const cuentas = JSON.parse(localStorage.getItem('esu_cuentas_recepcion') || '{}');
      const found = Object.values(cuentas).find(
        (c: unknown) => {
          const item = c as { centroSaludId?: string; centroSaludNombre?: string; email?: string };
          return String(item.centroSaludId) === String(centroId) || item.centroSaludNombre?.toLowerCase() === centroNombre.toLowerCase();
        }
      ) as { email: string; password?: string } | undefined;

      if (found) return found;

      const nombreNorm = centroNombre.toLowerCase();
      if (nombreNorm.includes('crespo')) return { email: 'recepcion@hospitalcrespo.gob.ar' };
      if (nombreNorm.includes('cabrera')) return { email: 'recepcion@clinicacabrera.com.ar' };
      if (nombreNorm.includes('isabel')) return { email: 'recepcion@sanatoriomariaisabel.com' };
      if (nombreNorm.includes('diagnostico')) return { email: 'recepcion@diagnostico.cruzdeleje.gob.ar' };

      const slug = centroNombre.toLowerCase().replace(/[^a-z0-9]/g, '');
      return { email: `recepcion.${slug || 'sede'}@esu.gob.ar` };
    } catch {
      return { email: `recepcion@esu.gob.ar` };
    }
  };

  // Coordenadas del pin de mapa
  const getPinCoordenadas = (centroId: string, centroNombre: string, direccion = '') => {
    try {
      const stored = localStorage.getItem('esu_cde_centros_coords_v2');
      if (stored) {
        const savedCoords = JSON.parse(stored);
        if (savedCoords[`cde-sede-${centroId}`]) {
          return savedCoords[`cde-sede-${centroId}`];
        }
      }
      const pins = mapaCentrosService.getCentros();
      const pin = pins.find(
        (p) => p.id === centroId || p.nombre.toLowerCase().includes(centroNombre.toLowerCase()) || centroNombre.toLowerCase().includes(p.nombreCorto.toLowerCase())
      );
      if (pin) return { lat: pin.lat, lng: pin.lng };
    } catch {
      // fallback
    }
    return detectarCoordenadasCruzDelEje(direccion, centroNombre);
  };

  const handleAbrirCrearCentro = () => {
    setEditandoCentro(null);
    setMostrarPassword(false);
    setPinCoords({
      lat: -30.7356,
      lng: -64.7946,
      nombreUbicacion: 'Cruz del Eje',
    });
    setCentroForm({
      nombre: '',
      tipo: 'CLINICA',
      direccion: '',
      usuarioEmail: '',
      usuarioPassword: '',
    });
    setModalCentroOpen(true);
  };

  const handleAbrirEditarCentro = (centro: CentroSalud) => {
    setEditandoCentro(centro);
    setMostrarPassword(false);
    const cuenta = getCuentaRecepcion(centro.id, centro.nombre);
    const coords = getPinCoordenadas(String(centro.id), centro.nombre, centro.direccion);

    setPinCoords({
      lat: coords.lat,
      lng: coords.lng,
      nombreUbicacion: centro.direccion || centro.nombre,
    });

    setCentroForm({
      nombre: centro.nombre,
      tipo: centro.tipo,
      direccion: centro.direccion,
      usuarioEmail: cuenta.email || '',
      usuarioPassword: cuenta.password || '',
    });
    setModalCentroOpen(true);
  };

  // Inicializar o centrar el mapa integrado interactivo al abrir el modal
  useEffect(() => {
    if (!modalCentroOpen || !mapModalContainerRef.current) return;

    const initialLat = pinCoords.lat || -30.7356;
    const initialLng = pinCoords.lng || -64.7946;

    const map = new MapLibreMap({
      container: mapModalContainerRef.current,
      style: OSM_RASTER_STYLE,
      center: [initialLng, initialLat],
      zoom: 14.2,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    const el = document.createElement('div');
    el.className = 'cursor-grab';
    el.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
        <div style="background-color: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 0 0 2px #0284c7;">
          <span style="transform: rotate(45deg); font-weight: 900; font-size: 14px;">🏥</span>
        </div>
      </div>
    `;

    const marker = new MapLibreMarker({ element: el, draggable: true, anchor: 'bottom' })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      setPinCoords((prev) => ({
        ...prev,
        lat: Number(lngLat.lat.toFixed(6)),
        lng: Number(lngLat.lng.toFixed(6)),
        nombreUbicacion: 'Ubicación ajustada en el mapa',
      }));
    });

    map.on('click', (e) => {
      const lat = Number(e.lngLat.lat.toFixed(6));
      const lng = Number(e.lngLat.lng.toFixed(6));
      marker.setLngLat([lng, lat]);
      setPinCoords((prev) => ({
        ...prev,
        lat,
        lng,
        nombreUbicacion: 'Ubicación seleccionada en el mapa',
      }));
    });

    mapModalRef.current = map;
    markerModalRef.current = marker;

    const timer = setTimeout(() => {
      map.resize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapModalRef.current = null;
      markerModalRef.current = null;
    };
  }, [modalCentroOpen]);

  // Buscar dirección ingresada en el mapa de Cruz del Eje
  const handleBuscarEnMapa = async () => {
    if (!centroForm.direccion.trim()) return;
    setBuscandoMapa(true);
    try {
      const res = await buscarDireccionEnMapa(centroForm.direccion, centroForm.nombre);
      setPinCoords(res);
      if (mapModalRef.current) {
        mapModalRef.current.flyTo({
          center: [res.lng, res.lat],
          zoom: 15.2,
          duration: 900,
        });
        markerModalRef.current?.setLngLat([res.lng, res.lat]);
      }
    } finally {
      setBuscandoMapa(false);
    }
  };

  const handleCambiarNombre = (nombre: string) => {
    const slug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    setCentroForm((prev) => ({
      ...prev,
      nombre,
      usuarioEmail: prev.usuarioEmail && !prev.usuarioEmail.startsWith('recepcion.')
        ? prev.usuarioEmail
        : slug ? `recepcion.${slug}@esu.gob.ar` : '',
    }));
  };

  const handleGuardarCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let centroGuardadoId = editandoCentro?.id;

      if (editandoCentro) {
        await centrosService.updateCentro(editandoCentro.id, {
          nombre: centroForm.nombre,
          tipo: centroForm.tipo,
          direccion: centroForm.direccion,
          ciudad: 'Cruz del Eje',
        });
        success(`Sede "${centroForm.nombre}" actualizada con éxito.`);
      } else {
        const creado = await centrosService.createCentro({
          nombre: centroForm.nombre,
          tipo: centroForm.tipo,
          direccion: centroForm.direccion,
          ciudad: 'Cruz del Eje',
          telefono: '',
          horarioAtencion: 'Lunes a Viernes 08:00 a 20:00',
          disponibleGuardia: false,
          activo: true,
          permiteConsultas: true,
          permiteEstudios: false,
          estudiosDisponibles: [],
        });
        centroGuardadoId = creado.id;
        success(`Sede "${centroForm.nombre}" creada con éxito.`);
      }

      const centroIdStr = String(centroGuardadoId || Date.now());

      // 1. Guardar el PIN en el mapa integrado con las coordenadas confirmadas
      mapaCentrosService.guardarCoordenadas(
        `cde-sede-${centroIdStr}`,
        pinCoords.lat,
        pinCoords.lng
      );

      // 2. Guardar credenciales de recepcionista para que pueda ingresar
      if (centroForm.usuarioEmail.trim()) {
        const emailNorm = centroForm.usuarioEmail.toLowerCase().trim();
        const pwd = centroForm.usuarioPassword.trim() || 'recepcion123';

        const cuentas = JSON.parse(localStorage.getItem('esu_cuentas_recepcion') || '{}');
        cuentas[emailNorm] = {
          email: emailNorm,
          password: pwd,
          centroSaludId: centroIdStr,
          centroSaludNombre: centroForm.nombre,
          rol: 'RECEPCIONISTA',
          nombre: 'Recepción',
          apellido: centroForm.nombre,
          activo: true,
        };
        localStorage.setItem('esu_cuentas_recepcion', JSON.stringify(cuentas));

        // Registrar en usuarios personalizados del sistema
        const customUsers: User[] = JSON.parse(localStorage.getItem('esu_custom_users') || '[]');
        const idx = customUsers.findIndex((u) => u.email.toLowerCase() === emailNorm);
        const nuevoUser: User = {
          id: `rec-${centroIdStr}`,
          email: emailNorm,
          dni: '',
          nombre: 'Recepción',
          apellido: centroForm.nombre,
          rol: 'RECEPCIONISTA',
          centroSaludId: centroIdStr,
          centroSaludNombre: centroForm.nombre,
          activo: true,
          emailVerified: true,
          twoFactorEnabled: false,
        };

        if (idx >= 0) {
          customUsers[idx] = nuevoUser;
        } else {
          customUsers.push(nuevoUser);
        }
        localStorage.setItem('esu_custom_users', JSON.stringify(customUsers));

        // Notificar al sistema global de usuarios para entrelazar todo
        window.dispatchEvent(new CustomEvent('esu_usuarios_updated', { detail: nuevoUser }));
      }

      setModalCentroOpen(false);
      cargarDatos();
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo guardar la información de la sede.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmarEliminarCentro = async () => {
    if (!sedeAEliminar) return;
    setIsSaving(true);
    try {
      await centrosService.deleteCentro(sedeAEliminar.id);
      success(`Sede "${sedeAEliminar.nombre}" eliminada del sistema.`);
      setSedeAEliminar(null);
      cargarDatos();
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo eliminar la sede seleccionada.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-primary" />
            <span>Gestión de Sedes y Centros de Salud</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Alta y administración de efectores de salud en Cruz del Eje con detección automática de mapa y cuentas de recepción.
          </p>
        </div>

        <button
          onClick={handleAbrirCrearCentro}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nueva Sede Sanitaria</span>
        </button>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={cargarDatos}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Sedes Sanitarias Registradas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 font-heading">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Sedes Sanitarias Registradas ({centros.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex h-44 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : centros.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No se encontraron sedes sanitarias registradas en el sistema.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {centros.map((centro) => {
              const coords = getPinCoordenadas(centro.id, centro.nombre, centro.direccion);
              const cuenta = getCuentaRecepcion(centro.id, centro.nombre);

              return (
                <div
                  key={centro.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-lg bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {centro.tipo}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAbrirEditarCentro(centro)}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                          title="Editar Sede"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSedeAEliminar(centro)}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                          title="Eliminar Sede"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-foreground leading-snug">{centro.nombre}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span>{centro.direccion || 'Cruz del Eje, Córdoba'}</span>
                      </p>
                    </div>

                    {/* PIN DE MAPA & CREDENCIALES DE RECEPCIÓN */}
                    <div className="pt-3 border-t border-border/70 space-y-2 text-xs text-foreground/80 font-medium">
                      <div className="flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-sky-600 shrink-0" />
                          <span className="font-semibold text-foreground">Mapa:</span>
                        </div>
                        <span className="text-[11px] font-medium text-sky-700 dark:text-sky-300 truncate">
                          📍 {coords.zonaNombre || 'Cruz del Eje'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-foreground">Usuario Recepción:</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-primary truncate max-w-[220px]">
                          {cuenta.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Sede (Crear / Editar) con Mapa Integrado de ESU */}
      {modalCentroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>{editandoCentro ? 'Editar Sede de Salud' : 'Registrar Nueva Sede'}</span>
              </h3>
              <button
                onClick={() => setModalCentroOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCentro} className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* 1. Nombre de la Sede */}
              <div>
                <label className="block font-bold mb-1 text-foreground">Nombre de la Sede *</label>
                <input
                  type="text"
                  required
                  value={centroForm.nombre}
                  onChange={(e) => handleCambiarNombre(e.target.value)}
                  placeholder="Ej. Clínica Santa María"
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* 2. Tipo de Establecimiento */}
              <div>
                <label className="block font-bold mb-1 text-foreground">Tipo de Establecimiento *</label>
                <select
                  value={centroForm.tipo}
                  onChange={(e) =>
                    setCentroForm({ ...centroForm, tipo: e.target.value as CentroSalud['tipo'] })
                  }
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-primary cursor-pointer focus:outline-none"
                >
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINICA">Clínica</option>
                  <option value="CONSULTORIO_PRIVADO">Consultorio Privado</option>
                  <option value="DISPENSARIO">Dispensario</option>
                </select>
              </div>

              {/* 3. Dirección Física con Buscador en el Mapa Integrado */}
              <div>
                <label className="block font-bold mb-1 text-foreground">Dirección Física *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={centroForm.direccion}
                    onChange={(e) => setCentroForm({ ...centroForm, direccion: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBuscarEnMapa();
                      }
                    }}
                    placeholder="Ingresá la dirección (ej. Media Naranja, Sarmiento 289)..."
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarEnMapa}
                    disabled={buscandoMapa || !centroForm.direccion.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50 transition shadow-xs"
                  >
                    {buscandoMapa ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span>Buscar en mapa</span>
                  </button>
                </div>
              </div>

              {/* 4. MAPA INTEGRADO DE ESU: VISOR INTERACTIVO Y UBICACIÓN DEL PIN */}
              <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 overflow-hidden space-y-1.5 p-2.5">
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-1.5 font-bold text-sky-800 dark:text-sky-200">
                    <MapPin className="h-4 w-4 shrink-0 text-sky-600" />
                    <span>Mapa Integrado de ESU</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[250px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    📍 {pinCoords.nombreUbicacion}
                  </span>
                </div>

                <div
                  ref={mapModalContainerRef}
                  className="w-full h-44 rounded-lg bg-slate-200 border border-slate-300 dark:border-slate-700 relative cursor-crosshair shadow-inner"
                />

                <p className="text-[11px] text-muted-foreground pt-0.5">
                  El mapa ubica la sede automáticamente. También podés hacer clic o arrastrar el pin si querés ajustar la posición.
                </p>
              </div>

              {/* 5. DATOS DE ACCESO PARA RECEPCIÓN */}
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                  <KeyRound className="h-4 w-4" />
                  <span>Acceso de Recepción (para entrar a este centro)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Credenciales con las cuales el recepcionista podrá iniciar sesión en el sistema y gestionar los turnos de este centro médico.
                </p>

                <div>
                  <label className="block font-semibold mb-1 text-foreground text-xs">Usuario / Email de Recepción *</label>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={centroForm.usuarioEmail}
                    onChange={(e) => setCentroForm({ ...centroForm, usuarioEmail: e.target.value })}
                    placeholder="recepcion.sede@esu.gob.ar"
                    className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground text-xs">Contraseña Inicial *</label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      required={!editandoCentro}
                      autoComplete="new-password"
                      value={centroForm.usuarioPassword}
                      onChange={(e) => setCentroForm({ ...centroForm, usuarioPassword: e.target.value })}
                      placeholder={editandoCentro ? '•••••••• (dejar vacío si no se cambia)' : 'Ej. Recepcion2026!'}
                      className="w-full rounded-xl border border-input bg-background p-2 pr-9 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setModalCentroOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted cursor-pointer transition text-xs sm:text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50 transition text-xs sm:text-sm"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación Eliminar Sede */}
      {sedeAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Eliminar Sede Sanitaria
                </h3>
                <p className="text-xs text-muted-foreground">
                  {sedeAEliminar.nombre}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente esta sede médica del sistema? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setSedeAEliminar(null)}
                className="flex-1 rounded-xl border border-input py-2 text-xs font-semibold hover:bg-accent transition disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmarEliminarCentro}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Eliminando...' : 'Eliminar Sede'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
