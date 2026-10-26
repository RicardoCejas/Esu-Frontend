import { apiClient } from './apiClient';
import { MOCK_PROFESIONALES, MOCK_ESPECIALIDADES } from './mockData';
import type {
  Profesional,
  Especialidad,
  DisponibilidadProfesional,
  DisponibilidadRequest,
  BloqueoAgenda,
  BloqueoRequest,
} from '@/types';

// Estado persistente local para desarrollo y pruebas
const STORAGE_KEY_PROFESIONALES = 'esu_profesionales_list';
const STORAGE_KEY_ESPECIALIDADES = 'esu_especialidades_list';
const STORAGE_KEY_DISPONIBILIDADES = 'esu_disponibilidades_list';
const STORAGE_KEY_BLOQUEOS = 'esu_bloqueos_agenda_list';

const INITIAL_DISPONIBILIDADES: DisponibilidadProfesional[] = [
  {
    id: 'disp-1',
    profesionalId: 'p1',
    diaSemana: 'MONDAY',
    horaInicio: '08:00',
    horaFin: '13:00',
    intervaloMinutos: 20,
    centroSaludId: 'c1',
    centroSaludNombre: 'Hospital Provincial Aurelio Crespo',
    activo: true,
  },
  {
    id: 'disp-2',
    profesionalId: 'p1',
    diaSemana: 'WEDNESDAY',
    horaInicio: '09:00',
    horaFin: '14:00',
    intervaloMinutos: 20,
    centroSaludId: 'c1',
    centroSaludNombre: 'Hospital Provincial Aurelio Crespo',
    activo: true,
  },
  {
    id: 'disp-3',
    profesionalId: 'p1',
    diaSemana: 'FRIDAY',
    horaInicio: '08:00',
    horaFin: '12:00',
    intervaloMinutos: 20,
    centroSaludId: 'c2',
    centroSaludNombre: 'Dispensario Municipal San Pantaleón',
    activo: true,
  },
];

const INITIAL_BLOQUEOS: BloqueoAgenda[] = [
  {
    id: 'blq-1',
    profesionalId: 'p1',
    profesionalNombre: 'Dr. Carlos Bustos',
    fechaInicio: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    motivo: 'Congreso de Medicina Interna',
    turnosAfectados: 2,
    pacientesAfectados: [
      {
        turnoId: 't-blq-1',
        pacienteNombre: 'Roberto Gómez',
        pacienteDni: '28441992',
        fecha: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        hora: '09:00',
      },
      {
        turnoId: 't-blq-2',
        pacienteNombre: 'Lucía Benítez',
        pacienteDni: '35128994',
        fecha: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
        hora: '10:30',
      },
    ],
    fechaCreacion: new Date().toISOString().split('T')[0],
  },
];

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

const getInitialDisponibilidades = (): DisponibilidadProfesional[] => {
  const saved = localStorage.getItem(STORAGE_KEY_DISPONIBILIDADES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return [...INITIAL_DISPONIBILIDADES];
};

const getInitialBloqueos = (): BloqueoAgenda[] => {
  const saved = localStorage.getItem(STORAGE_KEY_BLOQUEOS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return [...INITIAL_BLOQUEOS];
};

let profesionalesState: Profesional[] = getInitialProfesionales();
let especialidadesState: Especialidad[] = getInitialEspecialidades();
let disponibilidadesState: DisponibilidadProfesional[] = getInitialDisponibilidades();
let bloqueosState: BloqueoAgenda[] = getInitialBloqueos();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_PROFESIONALES, JSON.stringify(profesionalesState));
  localStorage.setItem(STORAGE_KEY_ESPECIALIDADES, JSON.stringify(especialidadesState));
  localStorage.setItem(STORAGE_KEY_DISPONIBILIDADES, JSON.stringify(disponibilidadesState));
  localStorage.setItem(STORAGE_KEY_BLOQUEOS, JSON.stringify(bloqueosState));
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
          foto: d.foto,
          biografia: d.biografia,
          idiomas: d.idiomas || ['Español'],
          calificacion: d.calificacion || 4.9,
          opinionesCount: d.opinionesCount || 38,
          proximoTurnoLibre: d.proximoTurnoLibre,
        }));
      }
      return [...profesionalesState];
    } catch {
      return [...profesionalesState];
    }
  },

  async getById(id: string): Promise<Profesional | undefined> {
    try {
      const res = await apiClient.get<Profesional>(`/profesionales/${id}`);
      return res.data;
    } catch {
      return profesionalesState.find((p) => p.id === id);
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

  // HU-FE-61: Configuración de Grilla Horaria
  async getDisponibilidad(profesionalId: string): Promise<DisponibilidadProfesional[]> {
    try {
      const res = await apiClient.get<DisponibilidadProfesional[]>(`/profesionales/${profesionalId}/disponibilidad`);
      return res.data;
    } catch {
      return disponibilidadesState.filter(
        (d) => d.profesionalId === profesionalId || profesionalId === 'all' || !profesionalId
      );
    }
  },

  async guardarDisponibilidad(data: DisponibilidadRequest): Promise<DisponibilidadProfesional> {
    try {
      const res = await apiClient.post<DisponibilidadProfesional>('/disponibilidades', data);
      return res.data;
    } catch {
      const nueva: DisponibilidadProfesional = {
        id: `disp-${Date.now()}`,
        profesionalId: data.profesionalId,
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        intervaloMinutos: Number(data.intervaloMinutos),
        centroSaludId: data.centroSaludId,
        centroSaludNombre: data.centroSaludId === 'c1'
          ? 'Hospital Provincial Aurelio Crespo'
          : data.centroSaludId === 'c2'
          ? 'Dispensario Municipal San Pantaleón'
          : 'Clínica Privada Cruz del Eje',
        activo: true,
      };
      disponibilidadesState = [nueva, ...disponibilidadesState];
      saveState();
      return nueva;
    }
  },

  async eliminarDisponibilidad(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/disponibilidades/${id}`);
      disponibilidadesState = disponibilidadesState.filter((d) => d.id !== id);
      saveState();
      return true;
    } catch {
      disponibilidadesState = disponibilidadesState.filter((d) => d.id !== id);
      saveState();
      return true;
    }
  },

  // HU-FE-62: Bloqueo de Agenda Médica
  async getBloqueos(profesionalId: string): Promise<BloqueoAgenda[]> {
    try {
      const res = await apiClient.get<BloqueoAgenda[]>(`/profesionales/${profesionalId}/bloqueos`);
      return res.data;
    } catch {
      return bloqueosState.filter(
        (b) => b.profesionalId === profesionalId || profesionalId === 'all' || !profesionalId
      );
    }
  },

  async bloquearAgenda(profesionalId: string, data: BloqueoRequest): Promise<BloqueoAgenda> {
    try {
      const res = await apiClient.post<BloqueoAgenda>(`/profesionales/${profesionalId}/bloquear-agenda`, data);
      return res.data;
    } catch {
      const nuevoBloqueo: BloqueoAgenda = {
        id: `blq-${Date.now()}`,
        profesionalId: data.profesionalId,
        profesionalNombre: 'Profesional de Salud',
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        motivo: data.motivo,
        turnosAfectados: 1,
        pacientesAfectados: [
          {
            turnoId: `t-afectado-${Date.now()}`,
            pacienteNombre: 'Paciente Programado',
            pacienteDni: '33498112',
            fecha: data.fechaInicio,
            hora: data.horaInicio || '10:00',
          },
        ],
        fechaCreacion: new Date().toISOString().split('T')[0],
      };
      bloqueosState = [nuevoBloqueo, ...bloqueosState];
      saveState();
      return nuevoBloqueo;
    }
  },

  // HU-FE-64 & HU-BE-92: Búsqueda Optimizada de Prestadores Disponibles
  async getBuscarDisponibles(params: {
    especialidadId?: string;
    centroSaludId?: string;
    soloConDisponibilidad?: boolean;
  }): Promise<Profesional[]> {
    try {
      const res = await apiClient.get<any[]>('/profesionales/buscar-disponibles', { params });
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
          foto: d.foto,
          biografia: d.biografia,
          idiomas: d.idiomas || ['Español'],
          calificacion: d.calificacion || 4.9,
          opinionesCount: d.opinionesCount || 38,
          proximoTurnoLibre: d.proximoTurnoLibre || 'Mañana 08:30',
        }));
      }
      return [...profesionalesState];
    } catch {
      return [...profesionalesState];
    }
  },
};
