import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import type { CentroSalud, Especialidad } from '@/types';

export interface ConsultorioItem {
  id: string;
  centroSaludId: string;
  numero: string;
  planta: string;
  especialidadAsignada?: string;
  activo: boolean;
}

export interface ConsultorioUpdateInput {
  numero: string;
  planta: string;
  especialidadAsignada?: string;
  activo?: boolean;
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
  latitud?: number | null;
  longitud?: number | null;
  activo?: boolean;
  permiteConsultas?: boolean;
  permiteEstudios?: boolean;
  cantidadPlantas?: number;
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
    latitud: typeof dto.latitud === 'number' ? dto.latitud : undefined,
    longitud: typeof dto.longitud === 'number' ? dto.longitud : undefined,
    activo: dto.activo !== false,
    permiteConsultas: dto.permiteConsultas !== false,
    permiteEstudios: Boolean(dto.permiteEstudios),
    cantidadPlantas: typeof dto.cantidadPlantas === 'number' && dto.cantidadPlantas >= 1 ? dto.cantidadPlantas : 1,
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
      const hasNumericCentro = Boolean(centroId && /^\d+$/.test(centroId));
      const url = hasNumericCentro
        ? API_ENDPOINTS.centrosSalud.consultoriosPorCentro(centroId!)
        : API_ENDPOINTS.centrosSalud.consultorios;
      const res = await apiClient.get<BackendConsultorioDto[]>(url);
      return Array.isArray(res.data) ? res.data.map(normalizeConsultorio) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los consultorios físicos.'), { cause: err });
    }
  },

  async getConsultorioById(id: string): Promise<ConsultorioItem> {
    try {
      const res = await apiClient.get<BackendConsultorioDto>(API_ENDPOINTS.centrosSalud.consultorioById(id));
      return normalizeConsultorio(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el consultorio físico.'), { cause: err });
    }
  },

  async createConsultorio(data: Omit<ConsultorioItem, 'id'>): Promise<ConsultorioItem> {
    try {
      const payload = {
        centroSaludId: (() => {
        const id = Number(String(data.centroSaludId).replace(/\D/g, ''));
        if (!Number.isFinite(id) || id <= 0) {
          throw new Error('Debe especificar un centro de salud válido para crear el consultorio.');
        }
        return id;
      })(),
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

  async updateConsultorio(id: string, data: ConsultorioUpdateInput): Promise<ConsultorioItem> {
    try {
      const payload = {
        numero: data.numero,
        planta: data.planta,
        especialidadAsignada: data.especialidadAsignada,
        activo: data.activo,
      };
      const res = await apiClient.put<BackendConsultorioDto>(
        API_ENDPOINTS.centrosSalud.consultorioById(id),
        payload
      );
      return normalizeConsultorio(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo actualizar el consultorio físico.'), { cause: err });
    }
  },

  async cambiarEstadoConsultorio(id: string, activo: boolean): Promise<ConsultorioItem> {
    try {
      const res = await apiClient.patch<BackendConsultorioDto>(
        API_ENDPOINTS.centrosSalud.consultorioEstado(id),
        { activo }
      );
      return normalizeConsultorio(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo cambiar el estado del consultorio físico.'), { cause: err });
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

  async getEspecialidadesPorCentro(centroId: string | number): Promise<Especialidad[]> {
    try {
      const res = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.centrosSalud.especialidadesPorCentro(centroId)
      );
      return Array.isArray(res.data)
        ? res.data.map((d) => ({
            id: String(d.id),
            nombre: String(d.nombre ?? ''),
            descripcion: String(d.descripcion ?? ''),
            categoria: typeof d.categoria === 'string' ? d.categoria : undefined,
          }))
        : [];
    } catch {
      return [];
    }
  },
};
