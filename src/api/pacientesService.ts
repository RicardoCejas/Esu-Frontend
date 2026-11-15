import { isAxiosError } from 'axios';
import { apiClient } from './apiClient.ts';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints.ts';
import type { User, ConsultaMedica, TimelineItem, CarnetDigital, Familiar, FamiliarRequest } from '@/types';
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

  async getById(id: string | number): Promise<User | undefined> {
    try {
      const numId = toNumericId(id);
      const res = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.pacientes.byId(numId));
      return res.data ? normalizePaciente(res.data) : undefined;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return undefined;
      }
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el paciente.'), { cause: err });
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

  async createPaciente(paciente: Omit<User, 'id' | 'rol' | 'email'> & { email?: string }): Promise<User> {
    try {
      const payload = {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        email: paciente.email?.trim() || undefined,
        telefono: paciente.telefono || 'Sin especificar',
        obraSocial: paciente.obraSocial,
        nroAfiliado: paciente.nroAfiliado,
        grupoSanguineo: paciente.grupoSanguineo,
        fechaNacimiento: paciente.fechaNacimiento || undefined,
        centroSaludReferenciaId: paciente.centroSaludId ? Number(paciente.centroSaludId) : undefined,
      };
      const res = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.pacientes.base, payload);
      return normalizePaciente(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo dar de alta al paciente.'), { cause: err });
    }
  },

  async getPaginado(
    page = 0,
    size = 10
  ): Promise<{ content: User[]; totalElements: number; totalPages: number }> {
    try {
      const res = await apiClient.get<{ content: Record<string, unknown>[]; totalElements: number; totalPages: number }>(
        API_ENDPOINTS.pacientes.paginado,
        { params: { page, size } }
      );
      const items = Array.isArray(res.data?.content) ? res.data.content.map(normalizePaciente) : [];
      return {
        content: items,
        totalElements: res.data?.totalElements ?? items.length,
        totalPages: res.data?.totalPages ?? 1,
      };
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el padrón paginado.'), { cause: err });
    }
  },

  async actualizarCompleto(
    pacienteId: string | number,
    data: Record<string, unknown>
  ): Promise<User> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.pacientes.byId(numId),
        data
      );
      return normalizePaciente(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo actualizar la información del paciente.'), { cause: err });
    }
  },

  async getCarnetDigital(pacienteId: string | number): Promise<CarnetDigital> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<CarnetDigital>(API_ENDPOINTS.pacientes.carnetDigital(numId));
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo emitir el carnet digital.'), { cause: err });
    }
  },

  async verificarCarnet(qrPayload: string): Promise<boolean> {
    try {
      const res = await apiClient.post<boolean>(
        API_ENDPOINTS.pacientes.verificarCarnet,
        null,
        { params: { qrPayload } }
      );
      return Boolean(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'Error al verificar carnet digital.'), { cause: err });
    }
  },

  async getFamiliares(pacienteId: string | number): Promise<Familiar[]> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<Familiar[]>(API_ENDPOINTS.pacientes.familiares(numId));
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el grupo familiar.'), { cause: err });
    }
  },

  async vincularFamiliar(
    pacienteId: string | number,
    request: FamiliarRequest
  ): Promise<Familiar> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.post<Familiar>(
        API_ENDPOINTS.pacientes.familiares(numId),
        request
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo vincular el familiar.'), { cause: err });
    }
  },

  async desvincularFamiliar(
    titularId: string | number,
    vinculoId: string | number
  ): Promise<void> {
    try {
      const numTitular = toNumericId(titularId, 'titularId');
      const numVinculo = toNumericId(vinculoId, 'vinculoId');
      await apiClient.delete(API_ENDPOINTS.pacientes.familiarById(numTitular, numVinculo));
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo desvincular al familiar.'), { cause: err });
    }
  },

  async updateContacto(
    pacienteId: string | number,
    data: {
      telefono?: string;
      email?: string;
      obraSocial?: string;
      nroAfiliado?: string;
      dni?: string;
      fechaNacimiento?: string;
      nroTramite?: string;
      nombre?: string;
      apellido?: string;
      grupoSanguineo?: string;
      centroSaludReferenciaNombre?: string;
    }
  ): Promise<User> {
    try {
      // 1. Si es recepción o admin editando por ID, llamar a actualizarCompleto
      const numId = toNumericId(pacienteId);
      try {
        const resAdmin = await apiClient.put<Record<string, unknown>>(
          API_ENDPOINTS.pacientes.byId(numId),
          data
        );
        if (resAdmin.data) return normalizePaciente(resAdmin.data);
      } catch (err: unknown) {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status !== 403 && status !== 404) {
          throw err;
        }
      }

      // 2. Fallback a endpoint de contacto por ID
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
