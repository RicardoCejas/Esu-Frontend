import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import type {
  Profesional,
  Especialidad,
  DisponibilidadProfesional,
  DisponibilidadRequest,
  BloqueoAgenda,
  BloqueoRequest,
} from '@/types';

const SPANISH_TO_DAY_OF_WEEK: Record<string, string> = {
  LUNES: 'MONDAY',
  MARTES: 'TUESDAY',
  MIERCOLES: 'WEDNESDAY',
  MIÉRCOLES: 'WEDNESDAY',
  JUEVES: 'THURSDAY',
  VIERNES: 'FRIDAY',
  SABADO: 'SATURDAY',
  SÁBADO: 'SATURDAY',
  DOMINGO: 'SUNDAY',
};

function toNumericId(raw: string | number | undefined, fieldName = 'profesionalId'): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  const digits = String(raw ?? '').replace(/\D/g, '');
  const parsed = Number(digits);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  throw new Error(`El identificador '${fieldName}' es obligatorio y debe ser un número válido.`);
}

function normalizeProfesional(d: Record<string, unknown>): Profesional {
  const espObj = d.especialidad as { id?: number | string; nombre?: string } | undefined;
  const espArr = Array.isArray(d.especialidades)
    ? (d.especialidades[0] as { id?: number | string; nombre?: string } | undefined)
    : undefined;
  const especialidadId = String(espObj?.id ?? espArr?.id ?? d.especialidadId ?? '1');
  const especialidadNombre = String(
    espObj?.nombre ?? espArr?.nombre ?? d.especialidadNombre ?? 'Medicina General'
  );
  const rawCentros = Array.isArray(d.centrosSaludIds) ? d.centrosSaludIds : [];
  const centrosSaludIds = rawCentros.map((c) => String(c).replace(/^c/, ''));

  return {
    id: String(d.id),
    nombre: String(d.nombre ?? ''),
    apellido: String(d.apellido ?? ''),
    matricula: String(d.matricula ?? ''),
    especialidadId,
    especialidadNombre,
    centrosSaludIds,
    diasAtencion: Array.isArray(d.diasAtencion)
      ? (d.diasAtencion as string[])
      : ['Lunes', 'Miércoles', 'Viernes'],
    duracionTurnoMin: typeof d.duracionTurnoMin === 'number' ? d.duracionTurnoMin : 20,
    foto: typeof d.foto === 'string' ? d.foto : undefined,
  };
}

function normalizeEspecialidad(d: Record<string, unknown>): Especialidad {
  return {
    id: String(d.id),
    nombre: String(d.nombre ?? ''),
    descripcion: String(d.descripcion ?? ''),
    icono: typeof d.icono === 'string' ? d.icono : undefined,
  };
}

function normalizeDisponibilidad(d: Record<string, unknown>): DisponibilidadProfesional {
  const diaSemana = String(d.diaSemana ?? 'MONDAY');
  return {
    id: String(d.id),
    profesionalId: String(d.profesionalId ?? '1'),
    centroSaludId: String(d.centroSaludId ?? '1'),
    diaSemana,
    horaInicio: String(d.horaInicio ?? '08:00'),
    horaFin: String(d.horaFin ?? '12:00'),
    intervaloMinutos: typeof d.duracionMinutos === 'number' ? d.duracionMinutos : 20,
    activo: d.activo !== false,
  };
}

function normalizeBloqueo(d: Record<string, unknown>): BloqueoAgenda {
  return {
    id: String(d.id),
    profesionalId: String(d.profesionalId ?? '1'),
    fechaInicio: String(d.fechaInicio ?? ''),
    fechaFin: String(d.fechaFin ?? ''),
    horaInicio: typeof d.horaInicio === 'string' ? d.horaInicio : undefined,
    horaFin: typeof d.horaFin === 'string' ? d.horaFin : undefined,
    motivo: String(d.motivo ?? 'Bloqueo administrativo'),
  };
}

export type CreateProfesionalPayload = Partial<Profesional> & {
  nombre: string;
  apellido: string;
  matricula: string;
  especialidadId: string;
  email?: string;
  password?: string;
  telefono?: string;
};

export const profesionalesService = {
  async getAll(): Promise<Profesional[]> {
    try {
      const res = await apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.profesionales.base);
      return Array.isArray(res.data) ? res.data.map(normalizeProfesional) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los profesionales médicos.'), { cause: err });
    }
  },

  async getById(id: string): Promise<Profesional | undefined> {
    try {
      const numId = toNumericId(id);
      const res = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.profesionales.byId(numId));
      return res.data ? normalizeProfesional(res.data) : undefined;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el profesional solicitado.'), { cause: err });
    }
  },

  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const res = await apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.especialidades.base);
      return Array.isArray(res.data) ? res.data.map(normalizeEspecialidad) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener las especialidades médicas.'), { cause: err });
    }
  },

  async getByCentro(centroId: string): Promise<Profesional[]> {
    try {
      const numCentroId = toNumericId(centroId);
      const res = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.profesionales.byCentro(numCentroId)
      );
      return Array.isArray(res.data) ? res.data.map(normalizeProfesional) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los profesionales del centro de salud.'), { cause: err });
    }
  },

  async getByEspecialidad(especialidadId: string): Promise<Profesional[]> {
    try {
      const numEspId = toNumericId(especialidadId);
      const res = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.profesionales.byEspecialidad(numEspId)
      );
      return Array.isArray(res.data) ? res.data.map(normalizeProfesional) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los profesionales de la especialidad.'), { cause: err });
    }
  },

  async createProfesional(data: CreateProfesionalPayload): Promise<Profesional> {
    try {
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        matricula: data.matricula,
        especialidadId: toNumericId(data.especialidadId),
        especialidadIds: [toNumericId(data.especialidadId)],
        centrosSaludIds: (data.centrosSaludIds || []).map((c) => toNumericId(c)),
        email: data.email,
        password: data.password,
        telefono: data.telefono,
      };
      const res = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.profesionales.base, payload);
      return normalizeProfesional(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar el profesional médico.'), { cause: err });
    }
  },

  async createEspecialidad(data: Omit<Especialidad, 'id'>): Promise<Especialidad> {
    try {
      const res = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.especialidades.base, {
        nombre: data.nombre,
        descripcion: data.descripcion,
      });
      return normalizeEspecialidad(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo crear la especialidad médica.'), { cause: err });
    }
  },

  async updateEspecialidad(id: string, data: Partial<Especialidad>): Promise<Especialidad> {
    try {
      const numId = toNumericId(id);
      const res = await apiClient.put<Record<string, unknown>>(API_ENDPOINTS.especialidades.byId(numId), {
        nombre: data.nombre,
        descripcion: data.descripcion,
      });
      return normalizeEspecialidad(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo actualizar la especialidad médica.'), { cause: err });
    }
  },

  async deleteEspecialidad(id: string): Promise<boolean> {
    try {
      const numId = toNumericId(id);
      await apiClient.delete(API_ENDPOINTS.especialidades.byId(numId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo eliminar la especialidad médica.'), { cause: err });
    }
  },

  async updateProfesional(id: string, data: Partial<Profesional>): Promise<Profesional> {
    try {
      const numId = toNumericId(id);
      const payload: Record<string, unknown> = {};
      if (data.nombre) payload.nombre = data.nombre;
      if (data.apellido) payload.apellido = data.apellido;
      if (data.matricula) payload.matricula = data.matricula;
      if (data.especialidadId) {
        payload.especialidadId = toNumericId(data.especialidadId);
        payload.especialidadIds = [toNumericId(data.especialidadId)];
      }
      if (Array.isArray(data.centrosSaludIds)) {
        payload.centrosSaludIds = data.centrosSaludIds.map((c) => toNumericId(c));
      }

      const res = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.profesionales.byId(numId),
        payload
      );
      return normalizeProfesional(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo actualizar el profesional médico.'), { cause: err });
    }
  },

  async vincularCentro(profesionalId: string, centroId: string): Promise<boolean> {
    try {
      const numProfId = toNumericId(profesionalId);
      const numCentroId = toNumericId(centroId);
      await apiClient.post(API_ENDPOINTS.profesionales.vincularCentro(numProfId, numCentroId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo vincular al profesional al centro.'), { cause: err });
    }
  },

  async desvincularCentro(profesionalId: string, centroId: string): Promise<boolean> {
    try {
      const numProfId = toNumericId(profesionalId);
      const numCentroId = toNumericId(centroId);
      await apiClient.delete(API_ENDPOINTS.profesionales.vincularCentro(numProfId, numCentroId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo desvincular al profesional del centro.'), { cause: err });
    }
  },

  async getDisponibilidad(profesionalId: string): Promise<DisponibilidadProfesional[]> {
    try {
      const numProfId = toNumericId(profesionalId);
      const res = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.disponibilidades.byProfesional(numProfId)
      );
      return Array.isArray(res.data) ? res.data.map(normalizeDisponibilidad) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener la disponibilidad del profesional.'), { cause: err });
    }
  },

  async configurarDisponibilidad(
    profesionalId: string,
    req: DisponibilidadRequest
  ): Promise<DisponibilidadProfesional> {
    try {
      const numProfId = toNumericId(profesionalId);
      const diaNormalized =
        SPANISH_TO_DAY_OF_WEEK[req.diaSemana.toUpperCase()] || req.diaSemana.toUpperCase();
      const payload = {
        profesionalId: numProfId,
        centroSaludId: toNumericId(req.centroSaludId),
        diaSemana: diaNormalized,
        horaInicio: req.horaInicio.length === 5 ? `${req.horaInicio}:00` : req.horaInicio,
        horaFin: req.horaFin.length === 5 ? `${req.horaFin}:00` : req.horaFin,
        duracionMinutos: req.intervaloMinutos,
        activo: true,
      };

      const res = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.disponibilidades.base,
        payload
      );
      return normalizeDisponibilidad(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo guardar la configuración de disponibilidad.'), { cause: err });
    }
  },

  async guardarDisponibilidad(req: DisponibilidadRequest): Promise<DisponibilidadProfesional> {
    return this.configurarDisponibilidad(req.profesionalId, req);
  },

  async eliminarDisponibilidad(disponibilidadId: string): Promise<boolean> {
    try {
      const numId = toNumericId(disponibilidadId);
      await apiClient.delete(API_ENDPOINTS.disponibilidades.byId(numId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo eliminar la franja de disponibilidad.'), { cause: err });
    }
  },

  async getBloqueos(profesionalId: string): Promise<BloqueoAgenda[]> {
    try {
      const numProfId = toNumericId(profesionalId);
      const res = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.bloqueosAgenda.byProfesional(numProfId)
      );
      return Array.isArray(res.data) ? res.data.map(normalizeBloqueo) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron consultar los bloqueos de agenda.'), { cause: err });
    }
  },

  async bloquearAgenda(profesionalId: string, req: BloqueoRequest & { centroSaludId?: string }): Promise<BloqueoAgenda> {
    try {
      const numProfId = toNumericId(profesionalId);
      const payload = {
        profesionalId: numProfId,
        centroSaludId: req.centroSaludId ? toNumericId(req.centroSaludId) : null,
        fechaInicio: req.fechaInicio,
        fechaFin: req.fechaFin,
        horaInicio: req.horaInicio ? (req.horaInicio.length === 5 ? `${req.horaInicio}:00` : req.horaInicio) : null,
        horaFin: req.horaFin ? (req.horaFin.length === 5 ? `${req.horaFin}:00` : req.horaFin) : null,
        motivo: req.motivo,
      };

      const res = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.bloqueosAgenda.base,
        payload
      );
      return normalizeBloqueo(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar el bloqueo de agenda.'), { cause: err });
    }
  },

  async eliminarBloqueo(bloqueoId: string): Promise<boolean> {
    try {
      const numId = toNumericId(bloqueoId);
      await apiClient.delete(API_ENDPOINTS.bloqueosAgenda.byId(numId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo eliminar el bloqueo de agenda.'), { cause: err });
    }
  },
};
