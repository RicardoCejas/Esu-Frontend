import { apiClient } from './apiClient.ts';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints.ts';
import type { Turno, EstadoTurno, SobreturnoRequest } from '@/types';
import {
  createPersistedTurno,
  type CreateTurnoRequest,
  type CreatedTurnoResponse,
} from './turnoCreation.ts';

const CENTER_SLUG_MAP: Record<string, number> = {
  'cde-hosp-crespo': 1,
  'cde-clin-cabrera': 2,
  'cde-centro-diag': 3,
  'cde-sanat-isabel': 5,
};

const DOCTOR_SLUG_MAP: Record<string, number> = {
  'doc-fernandez': 1,
  'doc-martinez': 2,
  'doc-castro': 3,
  'doc-gomez': 4,
  'doc-alvarez': 5,
  'doc-rossi': 6,
  'doc-lucero': 7,
  'doc-benitez': 8,
  'doc-acosta': 9,
  'doc-torres': 10,
  'doc-molina': 11,
  'doc-navarro': 12,
  'doc-morales': 13,
  'doc-suarez': 14,
  'doc-peralta': 15,
  'doc-dominguez': 16,
  'doc-vargas': 17,
  'doc-ibarra': 18,
  'doc-sanchez': 19,
  'doc-romero': 20,
  'doc-paredes': 21,
  'doc-correa': 22,
  'doc-ramos': 23,
  'doc-albarracin': 24,
};

function toNumericId(raw: string | number | undefined, fieldName = 'identificador'): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  const str = String(raw ?? '').trim();
  if (CENTER_SLUG_MAP[str]) return CENTER_SLUG_MAP[str];
  if (DOCTOR_SLUG_MAP[str]) return DOCTOR_SLUG_MAP[str];
  const digits = str.replace(/\D/g, '');
  const parsed = Number(digits);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  throw new Error(`El identificador '${fieldName}' es obligatorio y debe ser un número válido.`);
}

function toOptionalNumericId(raw: string | number | undefined | null): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const str = String(raw).trim();
  if (DOCTOR_SLUG_MAP[str]) return DOCTOR_SLUG_MAP[str];
  if (CENTER_SLUG_MAP[str]) return CENTER_SLUG_MAP[str];
  const digits = str.replace(/\D/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

import { normalizeTurno, normalizeEstado } from './turnoNormalizer.ts';
export { normalizeTurno, normalizeEstado };

export const turnosService = {
  async getById(id: string): Promise<Turno | null> {
    try {
      const numId = toNumericId(id);
      const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.turnos.byId(numId));
      return response.data ? normalizeTurno(response.data) : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el turno solicitado.'), { cause: err });
    }
  },

  
  async getTurnosHoyCentro(centroId: string | number): Promise<Turno[]> {
    try {
      const numId = toNumericId(centroId, 'centroSaludId');
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.hoyCentro(numId)
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los turnos del día para el centro de salud.'), { cause: err });
    }
  },

  async getTurnosCentro(
    centroId: string | number,
    filtros?: { desde?: string; hasta?: string; estado?: string }
  ): Promise<Turno[]> {
    try {
      const numId = toNumericId(centroId, 'centroSaludId');
      const params = new URLSearchParams();
      if (filtros?.desde) params.append('desde', filtros.desde);
      if (filtros?.hasta) params.append('hasta', filtros.hasta);
      if (filtros?.estado) params.append('estado', filtros.estado);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get<Record<string, unknown>[]>(
        `${API_ENDPOINTS.turnos.centro(numId)}${query}`
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los turnos del centro de salud.'), { cause: err });
    }
  },

  async getTurnosKanbanCentro(centroId: string | number): Promise<Turno[]> {
    try {
      const numId = toNumericId(centroId, 'centroSaludId');
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.kanbanCentro(numId)
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo cargar el tablero de salas de espera del centro.'), { cause: err });
    }
  },

  async getAll(): Promise<Turno[]> {
    try {
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.base
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el listado de turnos.'), { cause: err });
    }
  },

  async getByPaciente(pacienteId: string | number): Promise<Turno[]> {
    try {
      const numId = toNumericId(pacienteId);
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.byPaciente(numId)
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los turnos del paciente.'), { cause: err });
    }
  },

  async getByProfesional(
    profesionalId: string,
    params?: { fecha?: string; centroSaludId?: string } | string
  ): Promise<Turno[]> {
    const queryParams: Record<string, string | number> = {};
    if (typeof params === 'string') {
      queryParams.fecha = params;
    } else if (params) {
      if (params.fecha) queryParams.fecha = params.fecha;
      if (params.centroSaludId && params.centroSaludId !== 'TODOS') {
        queryParams.centroSaludId = toNumericId(params.centroSaludId);
      }
    }

    try {
      const numProfId = toNumericId(profesionalId);
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.byProfesional(numProfId),
        { params: queryParams }
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo obtener la agenda de turnos del profesional.'
        ), { cause: err });
    }
  },

  async getMiAgenda(params?: {
    fecha?: string;
    centroSaludId?: string;
  }): Promise<Turno[]> {
    const queryParams: Record<string, string | number> = {};
    if (params) {
      if (params.fecha) queryParams.fecha = params.fecha;
      if (params.centroSaludId && params.centroSaludId !== 'TODOS') {
        queryParams.centroSaludId = toNumericId(params.centroSaludId);
      }
    }

    try {
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.miAgenda,
        { params: queryParams }
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo cargar su agenda médica.'), { cause: err });
    }
  },

  async getDisponibles(profesionalId: string, fecha: string): Promise<string[]> {
    try {
      const numProfId = toNumericId(profesionalId);
      const response = await apiClient.get<string[]>(
        API_ENDPOINTS.turnos.disponibles,
        {
          params: { profesionalId: numProfId, fecha },
        }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo consultar la disponibilidad horaria.'
        ), { cause: err });
    }
  },

  async createTurno(
    turnoData: CreateTurnoRequest
  ): Promise<CreatedTurnoResponse> {
    return createPersistedTurno(
      (path, body) => apiClient.post<unknown>(path, body),
      turnoData
    );
  },

  async confirmarTurno(id: string): Promise<Turno> {
    try {
      const numId = toNumericId(id);
      const response = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.confirmar(numId)
      );
      return normalizeTurno(response.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo confirmar el turno.'), { cause: err });
    }
  },

  async reprogramarTurno(id: string, nuevaFechaHora: string): Promise<Turno> {
    try {
      const numId = toNumericId(id);
      const isoDateTime = nuevaFechaHora.length === 16 ? `${nuevaFechaHora}:00` : nuevaFechaHora;
      const response = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.reprogramar(numId),
        null,
        { params: { nuevaFechaHora: isoDateTime } }
      );
      return normalizeTurno(response.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo reprogramar el turno.'), { cause: err });
    }
  },

  async updateEstado(id: string, estado: EstadoTurno): Promise<Turno | null> {
    try {
      const numId = toNumericId(id);
      const response = await apiClient.patch<Record<string, unknown>>(
        API_ENDPOINTS.turnos.estado(numId),
        { estado }
      );
      return response.data ? normalizeTurno(response.data) : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo actualizar el estado del turno.'
        ), { cause: err });
    }
  },

  async checkIn(id: string): Promise<Turno | null> {
    try {
      const numId = toNumericId(id);
      const response = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.checkIn(numId)
      );
      return response.data ? normalizeTurno(response.data) : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo registrar el check-in del paciente.'
        ), { cause: err });
    }
  },

  async marcarAusente(id: string | number): Promise<Turno | null> {
    try {
      const numId = toNumericId(id);
      const response = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.ausente(numId)
      );
      return response.data ? normalizeTurno(response.data) : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo marcar el turno como ausente.'
        ), { cause: err });
    }
  },

  async registrarCopago(
    id: string,
    data: {
      obraSocial?: string;
      numeroAfiliado?: string;
      copagoMonto: number;
      numeroBono: string;
      metodoPago?: string;
    }
  ): Promise<Turno | null> {
    try {
      const numId = toNumericId(id);
      const payload = {
        monto: data.copagoMonto,
        copagoMonto: data.copagoMonto,
        numeroBono: data.numeroBono,
        metodoPago: data.metodoPago || 'EFECTIVO',
        obraSocial: data.obraSocial,
        numeroAfiliado: data.numeroAfiliado,
      };
      const response = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.copago(numId),
        payload
      );
      return response.data ? normalizeTurno(response.data) : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo registrar el copago ni la cobertura del turno.'
        ), { cause: err });
    }
  },

  async crearTurnoMostrador(
    data: Omit<Turno, 'id' | 'codigoVerificacion' | 'fechaCreacion'>
  ): Promise<Turno> {
    try {
      const payload = {
        profesionalId: toNumericId(data.profesionalId),
        pacienteId: data.pacienteId ? toNumericId(data.pacienteId) : undefined,
        pacienteDni: data.pacienteDni,
        pacienteNombre: data.pacienteNombre,
        pacienteTelefono: data.pacienteTelefono,
        obraSocial: data.obraSocial,
        fecha: data.fecha,
        hora: data.hora,
        centroSaludId: toNumericId(data.centroSaludId),
        centroSaludNombre: data.centroSaludNombre,
        consultorioNumero: data.consultorioNumero,
        planta: data.planta,
        motivoTurno: data.motivoConsulta,
        copagoMonto: data.copagoMonto,
        numeroBono: data.numeroBono,
      };
      const response = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.turnos.mostrador,
        payload
      );
      return normalizeTurno(response.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo generar el turno presencial de mostrador.'
        ), { cause: err });
    }
  },

  // Reserva pública de turnos con persistencia directa en base de datos
  async reservarTurnoPublico(payload: {
    centroSaludId: number | string;
    profesionalId?: number | string | null;
    tipoAtencion?: 'CONSULTA' | 'ESTUDIO' | string;
    servicio?: string;
    especialidadId?: number | string | null;
    fecha: string;
    hora: string;
    dni: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email?: string;
    obraSocial?: string;
    numeroAfiliado?: string;
    motivoConsulta?: string;
    idempotencyKey?: string;
  }): Promise<Turno> {
    try {
      const formattedTime = payload.hora.trim().padStart(5, '0');
      const timeWithSeconds = formattedTime.length === 5 ? `${formattedTime}:00` : formattedTime;
      const fechaHoraIso = `${payload.fecha.trim()}T${timeWithSeconds}`;
      const idempotencyKey = payload.idempotencyKey ||
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

      const response = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.turnos.reservarPublico,
        {
          centroSaludId: toNumericId(payload.centroSaludId),
          profesionalId: toOptionalNumericId(payload.profesionalId),
          tipoAtencion: payload.tipoAtencion || (payload.profesionalId ? 'CONSULTA' : 'ESTUDIO'),
          servicio: payload.servicio?.trim() || undefined,
          especialidadId: toOptionalNumericId(payload.especialidadId),
          fechaHora: fechaHoraIso,
          fecha: payload.fecha,
          hora: payload.hora,
          dni: payload.dni.replace(/\D/g, ''),
          nombre: payload.nombre.trim(),
          apellido: payload.apellido.trim(),
          telefono: payload.telefono.trim(),
          email: payload.email?.trim() || undefined,
          obraSocial: payload.obraSocial?.trim() || undefined,
          nroAfiliado: payload.numeroAfiliado?.trim() || undefined,
          numeroAfiliado: payload.numeroAfiliado?.trim() || undefined,
          motivoTurno: payload.motivoConsulta?.trim() || undefined,
          motivoConsulta: payload.motivoConsulta?.trim() || undefined,
          idempotencyKey,
        }
      );
      return normalizeTurno(response.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar la reserva del turno.'), { cause: err });
    }
  },

  // HU-FE-63: Endpoint y lógica de Sobreturnos y Demanda Espontánea
  async crearSobreturno(data: SobreturnoRequest): Promise<Turno> {
    try {
      const payload = {
        profesionalId: toNumericId(data.profesionalId),
        pacienteId: data.pacienteId ? toNumericId(data.pacienteId) : undefined,
        pacienteDni: data.pacienteDni,
        pacienteNombre: data.pacienteNombre,
        pacienteTelefono: data.pacienteTelefono,
        obraSocial: data.obraSocial,
        centroSaludId: toNumericId(data.centroSaludId),
        fecha: data.fecha,
        hora: data.hora,
        consultorioNumero: data.consultorioNumero,
        planta: data.planta,
        motivoSobreturno: data.motivoSobreturno,
      };
      const response = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.turnos.sobreturno,
        payload
      );
      return normalizeTurno(response.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo asignar el sobreturno.'), { cause: err });
    }
  },

  async cancelarTurno(id: string): Promise<boolean> {
    try {
      const numId = toNumericId(id);
      await apiClient.put(API_ENDPOINTS.turnos.cancelar(numId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo cancelar el turno.'), { cause: err });
    }
  },

  async cancelarConJustificativo(id: string, motivo: string): Promise<boolean> {
    try {
      const numId = toNumericId(id);
      await apiClient.put(API_ENDPOINTS.turnos.cancelarMostrador(numId), {
        justificativo: motivo,
      });
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo registrar la cancelación con justificativo.'
        ), { cause: err });
    }
  },

  async llamarPaciente(id: string, consultorio: string): Promise<Turno | null> {
    const now = new Date();
    const horaLlamado = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    try {
      const numId = toNumericId(id);
      const response = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.llamar(numId),
        { consultorio, horaLlamado }
      );
      const normalized = response.data ? normalizeTurno(response.data) : null;
      return normalized ? { ...normalized, horaLlamado } : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se pudo llamar al paciente a consultorio.'
        ), { cause: err });
    }
  },

  async finalizarAtencion(id: string | number): Promise<Turno | null> {
    try {
      const numId = toNumericId(id);
      const response = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.finalizarAtencion(numId)
      );
      return response.data ? normalizeTurno(response.data) : null;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo finalizar la atención del turno.'), { cause: err });
    }
  },

  async getTurnosCarteleraPublica(centroId: string | number): Promise<Turno[]> {
    try {
      const numId = toNumericId(centroId, 'centroSaludId');
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.carteleraPublica(numId)
      );
      return Array.isArray(response.data) ? response.data.map(normalizeTurno) : [];
    } catch (err: unknown) {
      try {
        return await this.getTurnosKanbanCentro(centroId);
      } catch {
        throw new Error(extractApiErrorMessage(err, 'No se pudo cargar la cartelera de turnos.'), { cause: err });
      }
    }
  },
};
