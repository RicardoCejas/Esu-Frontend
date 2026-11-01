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

export const centrosService = {
  async getAll(): Promise<CentroSalud[]> {
    try {
      const res = await apiClient.get<BackendCentroSaludDto[]>(API_ENDPOINTS.centrosSalud.base);
      return Array.isArray(res.data) ? res.data.map(normalizeCentro) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los centros de salud.'), { cause: err });
    }
  },

  async getCentrosSalud(): Promise<CentroSalud[]> {
    return this.getAll();
  },

  async getById(id: string): Promise<CentroSalud | undefined> {
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
      return normalizeCentro(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo crear el centro de salud.'), { cause: err });
    }
  },

  async createCentroSalud(data: Omit<CentroSalud, 'id'>): Promise<CentroSalud> {
    return this.createCentro(data);
  },

  async updateCentro(id: string, data: Partial<CentroSalud>): Promise<CentroSalud | null> {
    try {
      const res = await apiClient.put<BackendCentroSaludDto>(API_ENDPOINTS.centrosSalud.byId(id), data);
      return res.data ? normalizeCentro(res.data) : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo actualizar el centro de salud.'), { cause: err });
    }
  },

  async deleteCentro(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.centrosSalud.byId(id));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo eliminar el centro de salud.'), { cause: err });
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
