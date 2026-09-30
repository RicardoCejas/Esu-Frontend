import { apiClient } from './apiClient';
import { MOCK_PROFESIONALES, MOCK_ESPECIALIDADES } from './mockData';
import type { Profesional, Especialidad } from '@/types';

// Estado persistente local para desarrollo y pruebas
const STORAGE_KEY_PROFESIONALES = 'esu_profesionales_list';
const STORAGE_KEY_ESPECIALIDADES = 'esu_especialidades_list';

const getInitialProfesionales = (): Profesional[] => {
  const saved = localStorage.getItem(STORAGE_KEY_PROFESIONALES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return [...MOCK_PROFESIONALES];
};

const getInitialEspecialidades = (): Especialidad[] => {
  const saved = localStorage.getItem(STORAGE_KEY_ESPECIALIDADES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return [...MOCK_ESPECIALIDADES];
};

let profesionalesState: Profesional[] = getInitialProfesionales();
let especialidadesState: Especialidad[] = getInitialEspecialidades();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_PROFESIONALES, JSON.stringify(profesionalesState));
  localStorage.setItem(STORAGE_KEY_ESPECIALIDADES, JSON.stringify(especialidadesState));
};

export const profesionalesService = {
  async getAll(): Promise<Profesional[]> {
    try {
      const res = await apiClient.get<Profesional[]>('/profesionales');
      return res.data;
    } catch {
      return [...profesionalesState];
    }
  },

  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const res = await apiClient.get<Especialidad[]>('/especialidades');
      return res.data;
    } catch {
      return [...especialidadesState];
    }
  },

  async getByCentro(centroId: string): Promise<Profesional[]> {
    try {
      const res = await apiClient.get<Profesional[]>(`/profesionales/centro/${centroId}`);
      return res.data;
    } catch {
      return profesionalesState.filter((p) => p.centrosSaludIds.includes(centroId));
    }
  },

  async getByEspecialidad(especialidadId: string): Promise<Profesional[]> {
    try {
      const res = await apiClient.get<Profesional[]>(`/profesionales/especialidad/${especialidadId}`);
      return res.data;
    } catch {
      return profesionalesState.filter((p) => p.especialidadId === especialidadId);
    }
  },

  async createProfesional(data: Omit<Profesional, 'id'>): Promise<Profesional> {
    try {
      const res = await apiClient.post<Profesional>('/profesionales', data);
      return res.data;
    } catch {
      const nuevo: Profesional = {
        ...data,
        id: `p-${Date.now()}`,
      };
      profesionalesState = [nuevo, ...profesionalesState];
      saveState();
      return nuevo;
    }
  },

  async createEspecialidad(data: Omit<Especialidad, 'id'>): Promise<Especialidad> {
    try {
      const res = await apiClient.post<Especialidad>('/especialidades', data);
      return res.data;
    } catch {
      const nueva: Especialidad = {
        ...data,
        id: `e-${Date.now()}`,
      };
      especialidadesState = [...especialidadesState, nueva];
      saveState();
      return nueva;
    }
  },
};
