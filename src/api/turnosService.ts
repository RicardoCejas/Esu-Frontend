import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import type { Turno, EstadoTurno, SobreturnoRequest } from '@/types';
import {
  createPersistedTurno,
  type CreateTurnoRequest,
  type CreatedTurnoResponse,
} from './turnoCreation';

function toNumericId(raw: string | number | undefined, fallback = 1): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const digits = String(raw ?? '').replace(/\D/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeEstado(raw: unknown): EstadoTurno {
  const s = String(raw ?? 'PENDIENTE').trim().toUpperCase();
  if (s === 'ATENDIDO' || s === 'FINALIZADO' || s === 'COMPLETADO') return 'COMPLETADO';
  if (
    s === 'PENDIENTE' ||
    s === 'CONFIRMADO' ||
    s === 'EN_ESPERA' ||
    s === 'EN_SALA_DE_ESPERA' ||
    s === 'ATENDIENDO' ||
    s === 'CANCELADO' ||
    s === 'CANCELADO_POR_MEDICO' ||
    s === 'AUSENTE'
  ) {
    return s;
  }
  return 'PENDIENTE';
}

export function normalizeTurno(d: Record<string, unknown>): Turno {
  const pac = d.paciente as Record<string, unknown> | undefined;
  const prof = d.profesional as Record<string, unknown> | undefined;
  const profEsp =
    (prof?.especialidad as Record<string, unknown> | undefined) ??
    (Array.isArray(prof?.especialidades)
      ? (prof?.especialidades[0] as Record<string, unknown> | undefined)
      : undefined);

  const rawFechaHora = typeof d.fechaHora === 'string' ? d.fechaHora : '';
  const fecha = rawFechaHora.includes('T')
    ? rawFechaHora.split('T')[0]!
    : String(d.fecha ?? '');
  const hora = rawFechaHora.includes('T')
    ? rawFechaHora.split('T')[1]!.slice(0, 5)
    : String(d.hora ?? '08:00').slice(0, 5);

  const rawCheckIn = typeof d.fechaCheckIn === 'string' ? d.fechaCheckIn : '';
  const horaCheckIn = rawCheckIn.includes('T')
    ? rawCheckIn.split('T')[1]!.slice(0, 5)
    : typeof d.horaCheckIn === 'string'
    ? d.horaCheckIn
    : undefined;

  const idStr = String(d.id ?? '');

  return {
    id: idStr,
    codigoVerificacion:
      typeof d.codigoVerificacion === 'string'
        ? d.codigoVerificacion
        : `ESU-2026-${idStr.padStart(4, '0')}`,
    fecha,
    hora,
    pacienteId: String(pac?.id ?? d.pacienteId ?? ''),
    pacienteNombre: pac
      ? `${String(pac.nombre ?? '')} ${String(pac.apellido ?? '')}`.trim()
      : String(d.pacienteNombre ?? ''),
    pacienteDni: String(pac?.dni ?? d.pacienteDni ?? ''),
    pacienteTelefono: String(pac?.telefono ?? d.pacienteTelefono ?? ''),
    obraSocial:
      typeof pac?.obraSocial === 'string'
        ? pac.obraSocial
        : typeof d.obraSocial === 'string'
        ? d.obraSocial
        : undefined,
    nroAfiliado:
      typeof pac?.nroAfiliado === 'string'
        ? pac.nroAfiliado
        : typeof d.nroAfiliado === 'string'
        ? d.nroAfiliado
        : undefined,
    numeroAfiliado:
      typeof pac?.nroAfiliado === 'string'
        ? pac.nroAfiliado
        : typeof d.numeroAfiliado === 'string'
        ? d.numeroAfiliado
        : undefined,
    grupoSanguineo:
      typeof pac?.grupoSanguineo === 'string'
        ? pac.grupoSanguineo
        : typeof d.grupoSanguineo === 'string'
        ? d.grupoSanguineo
        : undefined,
    copagoMonto:
      typeof d.montoCopago === 'number'
        ? d.montoCopago
        : typeof d.copagoMonto === 'number'
        ? d.copagoMonto
        : undefined,
    numeroBono: typeof d.numeroBono === 'string' ? d.numeroBono : undefined,
    esPrimeraVez: Boolean(d.esPrimeraVez),
    consultorioNumero:
      typeof d.consultorioNumero === 'string' ? d.consultorioNumero : '102',
    planta: typeof d.planta === 'string' ? d.planta : 'Planta Baja',
    profesionalId: String(prof?.id ?? d.profesionalId ?? '1'),
    profesionalNombre: prof
      ? `${String(prof.nombre ?? '')} ${String(prof.apellido ?? '')}`.trim()
      : String(d.profesionalNombre ?? ''),
    especialidadNombre: String(
      profEsp?.nombre ?? d.especialidadNombre ?? 'Medicina General'
    ),
    centroSaludId: String(d.centroSaludId ?? '1').replace(/^c/, ''),
    centroSaludNombre: String(
      d.centroSaludNombre ?? 'Hospital Regional Aurelio Crespo'
    ),
    estado: normalizeEstado(d.estado),
    motivoConsulta:
      typeof d.motivoTurno === 'string'
        ? d.motivoTurno
        : typeof d.motivoConsulta === 'string'
        ? d.motivoConsulta
        : undefined,
    observaciones:
      typeof d.observacionesAtencion === 'string'
        ? d.observacionesAtencion
        : typeof d.observaciones === 'string'
        ? d.observaciones
        : undefined,
    justificativoCancelacion:
      typeof d.motivoCancelacion === 'string'
        ? d.motivoCancelacion
        : typeof d.justificativoCancelacion === 'string'
        ? d.justificativoCancelacion
        : undefined,
    fechaCreacion:
      typeof d.fechaCreacion === 'string' ? d.fechaCreacion : fecha,
    horaCheckIn,
    horaLlamado: typeof d.horaLlamado === 'string' ? d.horaLlamado : undefined,
    esSobreturno: Boolean(d.esSobreturno),
    motivoSobreturno:
      typeof d.motivoSobreturno === 'string' ? d.motivoSobreturno : undefined,
  };
}

export const turnosService = {
  async getById(id: string): Promise<Turno | null> {
    try {
      const numId = toNumericId(id);
      const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.turnos.byId(numId));
      return response.data ? normalizeTurno(response.data) : null;
    } catch {
      return null;
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
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo obtener el listado de turnos.')
      );
    }
  },

  async getByPaciente(pacienteId: string): Promise<Turno[]> {
    try {
      const numId = toNumericId(pacienteId);
      const response = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.turnos.byPaciente(numId)
      );
      return Array.isArray(response.data)
        ? response.data.map(normalizeTurno)
        : [];
    } catch (err: unknown) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudieron obtener los turnos del paciente.'
        )
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo obtener la agenda de turnos del profesional.'
        )
      );
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
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo cargar su agenda médica.')
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo consultar la disponibilidad horaria.'
        )
      );
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
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo confirmar el turno.')
      );
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
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo reprogramar el turno.')
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo actualizar el estado del turno.'
        )
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo registrar el check-in del paciente.'
        )
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo registrar el copago ni la cobertura del turno.'
        )
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo generar el turno presencial de mostrador.'
        )
      );
    }
  },

  // Reserva pública de turnos con persistencia directa en base de datos
  async reservarTurnoPublico(payload: {
    centroSaludId: number | string;
    profesionalId: number | string;
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
  }): Promise<Turno> {
    try {
      const response = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.turnos.reservarPublico,
        {
          centroSaludId: toNumericId(payload.centroSaludId),
          profesionalId: toNumericId(payload.profesionalId),
          fecha: payload.fecha,
          hora: payload.hora,
          dni: payload.dni.replace(/\D/g, ''),
          nombre: payload.nombre.trim(),
          apellido: payload.apellido.trim(),
          telefono: payload.telefono.trim(),
          email: payload.email?.trim() || undefined,
          obraSocial: payload.obraSocial?.trim() || undefined,
          numeroAfiliado: payload.numeroAfiliado?.trim() || undefined,
          motivoConsulta: payload.motivoConsulta?.trim() || undefined,
        }
      );
      return normalizeTurno(response.data);
    } catch (err: unknown) {
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo registrar la reserva del turno.')
      );
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
        motivoSobreturno: data.motivoSobreturno,
      };
      const response = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.turnos.sobreturno,
        payload
      );
      return normalizeTurno(response.data);
    } catch (err: unknown) {
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo asignar el sobreturno.')
      );
    }
  },

  async cancelarTurno(id: string): Promise<boolean> {
    try {
      const numId = toNumericId(id);
      await apiClient.put(API_ENDPOINTS.turnos.cancelar(numId));
      return true;
    } catch (err: unknown) {
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo cancelar el turno.')
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo registrar la cancelación con justificativo.'
        )
      );
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
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo llamar al paciente a consultorio.'
        )
      );
    }
  },
};
