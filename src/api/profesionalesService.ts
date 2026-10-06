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
      const res = await apiClient.get<any[]>('/profesionales');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((d: any) => ({
          id: String(d.id),
          nombre: d.nombre,
          apellido: d.apellido,
          matricula: d.matricula,
          especialidadId: String(d.especialidad?.id || d.especialidadId || '1'),
          especialidadNombre: d.especialidad?.nombre || d.especialidadNombre || 'Medicina General',
          centrosSaludIds: d.centrosSaludIds || ['c1'],
          diasAtencion: d.diasAtencion || ['Lunes', 'Miércoles', 'Viernes'],
          duracionTurnoMin: d.duracionTurnoMin || 20,
        }));
      }
      return [...profesionalesState];
    } catch {
      return [...profesionalesState];
    }
  },

  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const res = await apiClient.get<any[]>('/especialidades');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((e: any) => ({
          id: String(e.id),
          nombre: e.nombre,
          descripcion: e.descripcion || 'Atención médica especializada en Cruz del Eje.',
        }));
      }
      return [...especialidadesState];
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
