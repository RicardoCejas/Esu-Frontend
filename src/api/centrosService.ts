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
};
