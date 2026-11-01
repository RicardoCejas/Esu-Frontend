import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import type { User, ConsultaMedica } from '@/types';

function toNumericId(raw: string | number | undefined, fallback = 1): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const digits = String(raw ?? '').replace(/\D/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizePaciente(d: Record<string, unknown>): User {
  return {
    id: String(d.id ?? ''),
    nombre: String(d.nombre ?? ''),
    apellido: String(d.apellido ?? ''),
    dni: String(d.dni ?? ''),
    email: String(d.email ?? `${d.dni ?? 'paciente'}@esu.gob.ar`),
    telefono: typeof d.telefono === 'string' ? d.telefono : undefined,
    rol: 'PACIENTE',
    obraSocial: typeof d.obraSocial === 'string' ? d.obraSocial : undefined,
    nroAfiliado: typeof d.nroAfiliado === 'string' ? d.nroAfiliado : undefined,
    grupoSanguineo: typeof d.grupoSanguineo === 'string' ? d.grupoSanguineo : undefined,
    activo: true,
  };
}

function normalizeConsulta(d: Record<string, unknown>): ConsultaMedica {
  const pac = d.paciente as Record<string, unknown> | undefined;
  const prof = d.profesional as Record<string, unknown> | undefined;
  const rawFecha = String(d.fechaAtencion ?? d.fecha ?? '');
  return {
    id: String(d.id ?? ''),
    pacienteId: String(pac?.id ?? d.pacienteId ?? ''),
    pacienteNombre: pac
      ? `${String(pac.nombre ?? '')} ${String(pac.apellido ?? '')}`.trim()
      : String(d.pacienteNombre ?? ''),
    profesionalId: String(prof?.id ?? d.profesionalId ?? '1'),
    profesionalNombre: prof
      ? `Dr./Dra. ${String(prof.nombre ?? '')} ${String(prof.apellido ?? '')}`.trim()
      : String(d.profesionalNombre ?? 'Profesional ESU'),
    centroSaludId: (d.centroSaludId as string | number | undefined) ?? 1,
    centroSaludNombre: String(d.centroSaludNombre ?? 'Hospital Regional Aurelio Crespo'),
    fecha: rawFecha.includes('T') ? rawFecha.split('T')[0]! : rawFecha,
    motivo: String(d.motivoConsulta ?? d.motivo ?? 'Consulta médica'),
    diagnostico: String(d.diagnostico ?? ''),
    tratamiento: String(d.tratamiento ?? ''),
  };
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

  async getHistoriaClinica(pacienteId: string): Promise<ConsultaMedica[]> {
    try {
      const numId = toNumericId(pacienteId);
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
    data: { telefono?: string; email?: string; obraSocial?: string; nroAfiliado?: string; dni?: string }
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
