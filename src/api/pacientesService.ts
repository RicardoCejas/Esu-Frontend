import { apiClient } from './apiClient.ts';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints.ts';
import type { User, ConsultaMedica, TimelineItem } from '@/types';
import {
  normalizePaciente,
  normalizeConsulta,
  normalizeTimelineToConsulta,
} from './pacienteNormalizer.ts';

export { normalizePaciente, normalizeConsulta, normalizeTimelineToConsulta };

function toNumericId(raw: string | number | undefined, fieldName = 'pacienteId'): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  const digits = String(raw ?? '').replace(/\D/g, '');
  const parsed = Number(digits);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  throw new Error(`El identificador '${fieldName}' es obligatorio y debe ser un número válido.`);
}

export const pacientesService = {
  async getAll(): Promise<User[]> {
    try {
      const res = await apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.pacientes.base);
      return Array.isArray(res.data) ? res.data.map(normalizePaciente) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el padrón de pacientes.'), { cause: err });
    }
  },

  async getByDni(dni: string): Promise<User | undefined> {
    try {
      const res = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.pacientes.byDni(dni));
      return res.data ? normalizePaciente(res.data) : undefined;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return undefined;
      }
      throw new Error(extractApiErrorMessage(err, 'Error al buscar paciente por DNI.'), { cause: err });
    }
  },

  async getHistoriaClinica(pacienteId: string | number): Promise<ConsultaMedica[]> {
    try {
      const numId = toNumericId(pacienteId);
      // Intentar primero obtener el timeline completo estructurado (HU-52 / HU-95)
      try {
        const timelineRes = await apiClient.get<TimelineItem[]>(
          API_ENDPOINTS.historiasClinicas.timelinePaciente(numId)
        );
        if (Array.isArray(timelineRes.data) && timelineRes.data.length > 0) {
          return timelineRes.data.map((item) => normalizeTimelineToConsulta(item, String(numId)));
        }
      } catch {
        // Fallback al endpoint clásico de historias clínicas
      }

      const res = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.historiasClinicas.byPaciente(numId)
      );
      return Array.isArray(res.data) ? res.data.map(normalizeConsulta) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener la historia clínica del paciente.'), { cause: err });
    }
  },

  async agregarConsulta(consulta: Omit<ConsultaMedica, 'id'>): Promise<ConsultaMedica> {
    try {
      const payload = {
        pacienteId: toNumericId(consulta.pacienteId),
        motivoConsulta: consulta.motivo,
        diagnostico: consulta.diagnostico,
        tratamiento: consulta.tratamiento,
      };
      const res = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.historiasClinicas.crearConsulta,
        payload
      );
      return normalizeConsulta(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar la consulta en la historia clínica.'), { cause: err });
    }
  },

  async createPaciente(paciente: Omit<User, 'id' | 'rol'>): Promise<User> {
    try {
      const payload = {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        email: paciente.email,
        telefono: paciente.telefono || 'Sin especificar',
        obraSocial: paciente.obraSocial,
        nroAfiliado: paciente.nroAfiliado,
        grupoSanguineo: paciente.grupoSanguineo,
      };
      const res = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.pacientes.base, payload);
      return normalizePaciente(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo dar de alta al paciente.'), { cause: err });
    }
  },

  async updateContacto(
    pacienteId: string | number,
    data: { telefono?: string; email?: string; obraSocial?: string; nroAfiliado?: string; dni?: string; fechaNacimiento?: string; nroTramite?: string; nombre?: string; apellido?: string }
  ): Promise<User> {
    try {
      // 1. Intentar actualizar por endpoint de perfil autenticado
      try {
        const resPerfil = await apiClient.put<Record<string, unknown>>('/pacientes/mi-perfil', data);
        if (resPerfil.data) return normalizePaciente(resPerfil.data);
      } catch {
        // Fallback a endpoint con ID numérico
      }
      const numId = toNumericId(pacienteId);
      const res = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.pacientes.contacto(numId),
        data
      );
      return normalizePaciente(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron actualizar los datos del paciente.'), { cause: err });
    }
  },
};
