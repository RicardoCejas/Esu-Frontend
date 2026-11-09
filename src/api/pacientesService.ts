import { isAxiosError } from 'axios';
import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import type { User, ConsultaMedica } from '@/types';

function toNumericId(raw: string | number | undefined, fallback = 1): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const digits = String(raw ?? '').replace(/\D/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeFechaNacimiento(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw) && raw.length >= 3) {
    const [y, m, d] = raw;
    if (y && m && d) {
      return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  if (typeof raw === 'string') {
    const clean = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      return clean.slice(0, 10);
    }
  }
  return undefined;
}

function normalizePaciente(d: Record<string, unknown>): User {
  const dni = String(d.dni ?? '').trim();
  const telefono = typeof d.telefono === 'string' && d.telefono.trim() ? d.telefono.trim() : undefined;
  const fechaNacimiento = normalizeFechaNacimiento(d.fechaNacimiento);
  const telReal = Boolean(telefono && telefono.length >= 6 && telefono !== 'Sin especificar' && telefono !== '3549000000');

  return {
    id: String(d.id ?? ''),
    nombre: String(d.nombre ?? ''),
    apellido: String(d.apellido ?? ''),
    dni,
    email: String(d.email ?? `${d.dni ?? 'paciente'}@esu.gob.ar`),
    telefono,
    rol: 'PACIENTE',
    obraSocial: typeof d.obraSocial === 'string' ? d.obraSocial : undefined,
    nroAfiliado: typeof d.nroAfiliado === 'string' ? d.nroAfiliado : undefined,
    grupoSanguineo: typeof d.grupoSanguineo === 'string' ? d.grupoSanguineo : undefined,
    fechaNacimiento,
    centroSaludId: d.centroSaludReferenciaId !== undefined && d.centroSaludReferenciaId !== null
      ? String(d.centroSaludReferenciaId)
      : undefined,
    centroSaludNombre: typeof d.centroSaludReferenciaNombre === 'string'
      ? d.centroSaludReferenciaNombre
      : undefined,
    dniVerificado: /^\d{7,8}$/.test(dni) && telReal && Boolean(fechaNacimiento),
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
      // 1. Actualizar por endpoint de perfil autenticado (PACIENTE / ADMIN / DEV)
      try {
        const resPerfil = await apiClient.put<Record<string, unknown>>('/pacientes/mi-perfil', data);
        if (resPerfil.data) return normalizePaciente(resPerfil.data);
      } catch (err: unknown) {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        // Solo hacer fallback al endpoint administrativo por ID cuando /mi-perfil no aplica por rol o ruta
        if (status !== 403 && status !== 404) {
          throw err;
        }
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
