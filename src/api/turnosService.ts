import { apiClient } from './apiClient';
import { MOCK_TURNOS } from './mockData';
import type { Turno, EstadoTurno } from '@/types';

// Almacén en memoria local para persistencia durante la sesión
let turnosState: Turno[] = [...MOCK_TURNOS];

export const turnosService = {
  async getAll(): Promise<Turno[]> {
    try {
      const response = await apiClient.get<Turno[]>('/turnos');
      return response.data;
    } catch {
      return [...turnosState];
    }
  },

  async getByPaciente(pacienteIdOrDni: string): Promise<Turno[]> {
    try {
      const response = await apiClient.get<Turno[]>(`/turnos/paciente/${pacienteIdOrDni}`);
      return response.data;
    } catch {
      return turnosState.filter(
        (t) => t.pacienteId === pacienteIdOrDni || t.pacienteDni === pacienteIdOrDni
      );
    }
  },

  async getByProfesional(profesionalId: string, fecha?: string): Promise<Turno[]> {
    try {
      const response = await apiClient.get<Turno[]>(`/turnos/profesional/${profesionalId}`, {
        params: { fecha },
      });
      return response.data;
    } catch {
      return turnosState.filter(
        (t) => t.profesionalId === profesionalId && (!fecha || t.fecha === fecha)
      );
    }
  },

  async createTurno(turnoData: Omit<Turno, 'id' | 'codigoVerificacion' | 'fechaCreacion'>): Promise<Turno> {
    try {
      const response = await apiClient.post<Turno>('/turnos', turnoData);
      return response.data;
    } catch {
      const nuevoTurno: Turno = {
        ...turnoData,
        id: `t-${Date.now()}`,
        codigoVerificacion: `ESU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        fechaCreacion: new Date().toISOString().split('T')[0],
      };
      turnosState = [nuevoTurno, ...turnosState];
      return nuevoTurno;
    }
  },

  async updateEstado(id: string, estado: EstadoTurno): Promise<Turno | null> {
    try {
      const response = await apiClient.patch<Turno>(`/turnos/${id}/estado`, { estado });
      return response.data;
    } catch {
      const index = turnosState.findIndex((t) => t.id === id);
      if (index !== -1) {
        turnosState[index] = { ...turnosState[index], estado };
        return turnosState[index];
      }
      return null;
    }
  },

  async checkIn(id: string): Promise<Turno | null> {
    const now = new Date();
    const horaCheckIn = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    try {
      const response = await apiClient.put<Turno>(`/turnos/${id}/check-in`, { horaCheckIn });
      return response.data;
    } catch {
      const index = turnosState.findIndex((t) => t.id === id);
      if (index !== -1) {
        turnosState[index] = {
          ...turnosState[index],
          estado: 'EN_SALA_DE_ESPERA',
          horaCheckIn,
        };
        return turnosState[index];
      }
      return null;
    }
  },

  async registrarCopago(id: string, data: { obraSocial?: string; numeroAfiliado?: string; copagoMonto: number; numeroBono: string }): Promise<Turno | null> {
    try {
      const response = await apiClient.put<Turno>(`/turnos/${id}/copago`, data);
      return response.data;
    } catch {
      const index = turnosState.findIndex((t) => t.id === id);
      if (index !== -1) {
        turnosState[index] = {
          ...turnosState[index],
          ...data,
        };
        return turnosState[index];
      }
      return null;
    }
  },

  async crearTurnoMostrador(data: Omit<Turno, 'id' | 'codigoVerificacion' | 'fechaCreacion'>): Promise<Turno> {
    try {
      const response = await apiClient.post<Turno>('/turnos/mostrador', data);
      return response.data;
    } catch {
      const nuevoTurno: Turno = {
        ...data,
        id: `t-mst-${Date.now()}`,
        codigoVerificacion: `ESU-MST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        fechaCreacion: new Date().toISOString().split('T')[0],
      };
      turnosState = [nuevoTurno, ...turnosState];
      return nuevoTurno;
    }
  },

  async cancelarTurno(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/turnos/${id}`);
      turnosState = turnosState.map((t) => (t.id === id ? { ...t, estado: 'CANCELADO' } : t));
      return true;
    } catch {
      turnosState = turnosState.map((t) => (t.id === id ? { ...t, estado: 'CANCELADO' } : t));
      return true;
    }
  },

  async cancelarConJustificativo(id: string, motivo: string): Promise<boolean> {
    try {
      await apiClient.put(`/turnos/${id}/cancelar-mostrador`, { justificativo: motivo });
      turnosState = turnosState.map((t) =>
        t.id === id ? { ...t, estado: 'CANCELADO', justificativoCancelacion: motivo } : t
      );
      return true;
    } catch {
      turnosState = turnosState.map((t) =>
        t.id === id ? { ...t, estado: 'CANCELADO', justificativoCancelacion: motivo } : t
      );
      return true;
    }
  },

  async llamarPaciente(id: string, consultorio: string): Promise<Turno | null> {
    const now = new Date();
    const horaLlamado = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    try {
      const response = await apiClient.put<Turno>(`/turnos/${id}/llamar`, { consultorio, horaLlamado });
      return response.data;
    } catch {
      const index = turnosState.findIndex((t) => t.id === id);
      if (index !== -1) {
        turnosState[index] = {
          ...turnosState[index],
          estado: 'ATENDIENDO',
          consultorioNumero: consultorio,
          horaLlamado,
        };
        return turnosState[index];
      }
      return null;
    }
  },
};
