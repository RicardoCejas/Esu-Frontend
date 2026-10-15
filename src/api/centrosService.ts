import { apiClient } from './apiClient';
import { MOCK_CENTROS } from './mockData';
import type { CentroSalud } from '@/types';

const STORAGE_KEY_CENTROS = 'esu_centros_list';

const getInitialCentros = (): CentroSalud[] => {
  const saved = localStorage.getItem(STORAGE_KEY_CENTROS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return [...MOCK_CENTROS];
};

let centrosState: CentroSalud[] = getInitialCentros();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_CENTROS, JSON.stringify(centrosState));
};

export interface ConsultorioItem {
  id: string;
  centroSaludId: string;
  numero: string;
  planta: string;
  especialidadAsignada?: string;
  activo: boolean;
}

const MOCK_CONSULTORIOS: ConsultorioItem[] = [
  { id: 'cs-1', centroSaludId: 'c1', numero: '101', planta: 'Planta Baja', especialidadAsignada: 'Clínica Médica / Medicina General', activo: true },
  { id: 'cs-2', centroSaludId: 'c1', numero: '102', planta: 'Planta Baja', especialidadAsignada: 'Clínica Médica / Medicina General', activo: true },
  { id: 'cs-3', centroSaludId: 'c1', numero: '105', planta: 'Planta Baja', especialidadAsignada: 'Pediatría', activo: true },
  { id: 'cs-4', centroSaludId: 'c1', numero: '204', planta: '1° Piso', especialidadAsignada: 'Cardiología', activo: true },
  { id: 'cs-5', centroSaludId: 'c2', numero: '1', planta: 'Planta Única', especialidadAsignada: 'Clínica Médica / Medicina General', activo: true },
  { id: 'cs-6', centroSaludId: 'c3', numero: '301', planta: '2° Piso', especialidadAsignada: 'Ginecología y Obstetricia', activo: true },
];

let consultoriosState: ConsultorioItem[] = [...MOCK_CONSULTORIOS];

export const centrosService = {
  async getAll(): Promise<CentroSalud[]> {
    try {
      const res = await apiClient.get<CentroSalud[]>('/centros-salud');
      return res.data;
    } catch {
      return [...centrosState];
    }
  },

  async getById(id: string): Promise<CentroSalud | undefined> {
    try {
      const res = await apiClient.get<CentroSalud>(`/centros-salud/${id}`);
      return res.data;
    } catch {
      return centrosState.find((c) => c.id === id);
    }
  },

  async createCentro(data: Omit<CentroSalud, 'id'>): Promise<CentroSalud> {
    try {
      const res = await apiClient.post<CentroSalud>('/centros-salud', data);
      return res.data;
    } catch {
      const nuevo: CentroSalud = {
        ...data,
        id: `c-${Date.now()}`,
      };
      centrosState = [...centrosState, nuevo];
      saveState();
      return nuevo;
    }
  },

  async updateCentro(id: string, data: Partial<CentroSalud>): Promise<CentroSalud | null> {
    try {
      const res = await apiClient.put<CentroSalud>(`/centros-salud/${id}`, data);
      return res.data;
    } catch {
      const idx = centrosState.findIndex(c => c.id === id);
      if (idx !== -1) {
        centrosState[idx] = { ...centrosState[idx], ...data };
        saveState();
        return centrosState[idx];
      }
      return null;
    }
  },

  async deleteCentro(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/centros-salud/${id}`);
      centrosState = centrosState.filter(c => c.id !== id);
      saveState();
      return true;
    } catch {
      centrosState = centrosState.filter(c => c.id !== id);
      saveState();
      return true;
    }
  },

  async getConsultorios(centroId?: string): Promise<ConsultorioItem[]> {
    if (centroId) {
      return consultoriosState.filter(c => c.centroSaludId === centroId);
    }
    return [...consultoriosState];
  },

  async createConsultorio(data: Omit<ConsultorioItem, 'id'>): Promise<ConsultorioItem> {
    const nuevo: ConsultorioItem = {
      ...data,
      id: `cs-${Date.now()}`,
    };
    consultoriosState = [...consultoriosState, nuevo];
    return nuevo;
  },

  async deleteConsultorio(id: string): Promise<boolean> {
    consultoriosState = consultoriosState.filter(c => c.id !== id);
    return true;
  },
};
