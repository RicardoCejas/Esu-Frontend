import { apiClient } from './apiClient';
import { MOCK_USERS, MOCK_CONSULTAS } from './mockData';
import type { User, ConsultaMedica } from '@/types';

let pacientesState: User[] = MOCK_USERS.filter((u) => u.rol === 'PACIENTE');
let consultasState: ConsultaMedica[] = [...MOCK_CONSULTAS];

export const pacientesService = {
  async getAll(): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>('/pacientes');
      return res.data;
    } catch {
      return [...pacientesState];
    }
  },

  async getByDni(dni: string): Promise<User | undefined> {
    try {
      const res = await apiClient.get<User>(`/pacientes/dni/${dni}`);
      return res.data;
    } catch {
      return pacientesState.find((p) => p.dni === dni);
    }
  },

  async getHistoriaClinica(pacienteId: string): Promise<ConsultaMedica[]> {
    try {
      const res = await apiClient.get<ConsultaMedica[]>(`/historias-clinicas/paciente/${pacienteId}`);
      return res.data;
    } catch {
      return consultasState.filter((c) => c.pacienteId === pacienteId);
    }
  },

  async agregarConsulta(consulta: Omit<ConsultaMedica, 'id'>): Promise<ConsultaMedica> {
    try {
      const res = await apiClient.post<ConsultaMedica>('/historias-clinicas/consultas', consulta);
      return res.data;
    } catch {
      const nueva: ConsultaMedica = {
        ...consulta,
        id: `c-${Date.now()}`,
      };
      consultasState = [nueva, ...consultasState];
      return nueva;
    }
  },

  async createPaciente(paciente: Omit<User, 'id' | 'rol'>): Promise<User> {
    try {
      const res = await apiClient.post<User>('/pacientes', { ...paciente, rol: 'PACIENTE' });
      return res.data;
    } catch {
      const nuevo: User = {
        ...paciente,
        id: `u-paciente-${Date.now()}`,
        rol: 'PACIENTE',
      };
      pacientesState = [nuevo, ...pacientesState];
      return nuevo;
    }
  },
};
