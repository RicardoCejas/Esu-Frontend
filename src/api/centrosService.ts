import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import type { CentroSalud } from '@/types';

export interface ConsultorioItem {
  id: string;
  centroSaludId: string;
  numero: string;
  planta: string;
  especialidadAsignada?: string;
  activo: boolean;
}

interface BackendCentroSaludDto {
  id: number | string;
  nombre: string;
  tipo?: CentroSalud['tipo'];
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  horarioAtencion?: string;
  disponibleGuardia?: boolean;
  activo?: boolean;
  permiteConsultas?: boolean;
  permiteEstudios?: boolean;
  estudiosDisponibles?: string[];
}

interface BackendConsultorioDto {
  id: number | string;
  centroSaludId: number | string;
  numero: string;
  planta?: string;
  especialidadAsignada?: string;
  activo?: boolean;
}

function normalizeCentro(dto: BackendCentroSaludDto): CentroSalud {
  return {
    id: String(dto.id),
    nombre: dto.nombre,
    tipo: dto.tipo || 'HOSPITAL',
    direccion: dto.direccion || '',
    telefono: dto.telefono || '',
    ciudad: dto.ciudad || 'Cruz del Eje, Córdoba',
    horarioAtencion: dto.horarioAtencion || '08:00 a 20:00 hs',
    disponibleGuardia: Boolean(dto.disponibleGuardia),
    activo: dto.activo !== false,
    permiteConsultas: dto.permiteConsultas !== false,
    permiteEstudios: Boolean(dto.permiteEstudios),
    estudiosDisponibles: Array.isArray(dto.estudiosDisponibles) ? dto.estudiosDisponibles : [],
  };
}

function normalizeConsultorio(dto: BackendConsultorioDto): ConsultorioItem {
  return {
    id: String(dto.id),
    centroSaludId: String(dto.centroSaludId),
    numero: dto.numero,
    planta: dto.planta || 'Planta Baja',
    especialidadAsignada: dto.especialidadAsignada,
    activo: dto.activo !== false,
  };
}

const STORAGE_CUSTOM_SEDES = 'esu_custom_sedes';

function getStoredCustomSedes(): CentroSalud[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_SEDES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomSedeLocally(centro: CentroSalud) {
  try {
    const sedes = getStoredCustomSedes();
    const idx = sedes.findIndex((s) => String(s.id) === String(centro.id));
    if (idx >= 0) {
      sedes[idx] = centro;
    } else {
      sedes.push(centro);
    }
    localStorage.setItem(STORAGE_CUSTOM_SEDES, JSON.stringify(sedes));
  } catch (e) {
    console.warn('Error guardando sede local:', e);
  }
}

function removeCustomSedeLocally(id: string) {
  try {
    const sedes = getStoredCustomSedes().filter((s) => String(s.id) !== String(id));
    localStorage.setItem(STORAGE_CUSTOM_SEDES, JSON.stringify(sedes));
  } catch (e) {
    console.warn('Error eliminando sede local:', e);
  }
}

export const centrosService = {
  async getAll(): Promise<CentroSalud[]> {
    let centros: CentroSalud[] = [];
    try {
      const res = await apiClient.get<BackendCentroSaludDto[]>(API_ENDPOINTS.centrosSalud.base);
      centros = Array.isArray(res.data) ? res.data.map(normalizeCentro) : [];
    } catch {
      // Si la API falla, continuar con centros locales
    }

    // Combinar con sedes creadas localmente por el administrador
    const locales = getStoredCustomSedes();
    locales.forEach((loc) => {
      const idx = centros.findIndex((c) => String(c.id) === String(loc.id));
      if (idx >= 0) {
        centros[idx] = { ...centros[idx], ...loc };
      } else {
        centros.push(loc);
      }
    });

    return centros;
  },

  async getCentrosSalud(): Promise<CentroSalud[]> {
    return this.getAll();
  },

  async getById(id: string): Promise<CentroSalud | undefined> {
    const locales = getStoredCustomSedes();
    const foundLocal = locales.find((s) => String(s.id) === String(id));
    if (foundLocal) return foundLocal;

    try {
      const res = await apiClient.get<BackendCentroSaludDto>(API_ENDPOINTS.centrosSalud.byId(id));
      return res.data ? normalizeCentro(res.data) : undefined;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el centro de salud solicitado.'), { cause: err });
    }
  },

  async createCentro(data: Omit<CentroSalud, 'id'>): Promise<CentroSalud> {
    try {
      const res = await apiClient.post<BackendCentroSaludDto>(API_ENDPOINTS.centrosSalud.base, data);
      const normalizado = normalizeCentro(res.data);
      saveCustomSedeLocally(normalizado);
      return normalizado;
    } catch {
      // Fallback local si el endpoint POST del backend en producción no estuviera habilitado
      const fallbackCentro: CentroSalud = {
        ...data,
        id: `sede-${Date.now()}`,
      };
      saveCustomSedeLocally(fallbackCentro);
      return fallbackCentro;
    }
  },

  async createCentroSalud(data: Omit<CentroSalud, 'id'>): Promise<CentroSalud> {
    return this.createCentro(data);
  },

  async updateCentro(id: string, data: Partial<CentroSalud>): Promise<CentroSalud | null> {
    try {
      const res = await apiClient.put<BackendCentroSaludDto>(API_ENDPOINTS.centrosSalud.byId(id), data);
      const normalizado = res.data ? normalizeCentro(res.data) : null;
      if (normalizado) {
        saveCustomSedeLocally(normalizado);
      }
      return normalizado;
    } catch {
      const locales = getStoredCustomSedes();
      const actual = locales.find((s) => String(s.id) === String(id));
      if (actual) {
        const actualizado = { ...actual, ...data };
        saveCustomSedeLocally(actualizado);
        return actualizado;
      }
      return null;
    }
  },

  async deleteCentro(id: string): Promise<boolean> {
    removeCustomSedeLocally(id);
    try {
      await apiClient.delete(API_ENDPOINTS.centrosSalud.byId(id));
      return true;
    } catch {
      return true;
    }
  },

  async getConsultorios(centroId?: string): Promise<ConsultorioItem[]> {
    try {
      const params: Record<string, string> = {};
      if (centroId && /^\d+$/.test(centroId)) {
        params.centroSaludId = centroId;
      }
      const res = await apiClient.get<BackendConsultorioDto[]>(API_ENDPOINTS.centrosSalud.consultorios, {
        params,
      });
      return Array.isArray(res.data) ? res.data.map(normalizeConsultorio) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los consultorios físicos.'), { cause: err });
    }
  },

  async createConsultorio(data: Omit<ConsultorioItem, 'id'>): Promise<ConsultorioItem> {
    try {
      const payload = {
        centroSaludId: Number(String(data.centroSaludId).replace(/\D/g, '') || 1),
        numero: data.numero,
        planta: data.planta,
        especialidadAsignada: data.especialidadAsignada,
        activo: data.activo !== false,
      };
      const res = await apiClient.post<BackendConsultorioDto>(
        API_ENDPOINTS.centrosSalud.consultorios,
        payload
      );
      return normalizeConsultorio(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar el consultorio físico.'), { cause: err });
    }
  },

  async deleteConsultorio(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.centrosSalud.consultorioById(id));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo eliminar el consultorio físico.'), { cause: err });
    }
  },
};
