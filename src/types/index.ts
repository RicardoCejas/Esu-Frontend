export type UserRole = 'PACIENTE' | 'MEDICO' | 'RECEPCIONISTA' | 'ADMIN';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono?: string;
  rol: UserRole;
  matricula?: string; // Para médicos
  especialidad?: string; // Para médicos
  centroSaludId?: string; // Para recepcionistas o médicos asociados a un centro
  obraSocial?: string;
  nroAfiliado?: string;
  grupoSanguineo?: string; // Para pacientes
  activo?: boolean;
  twoFactorEnabled?: boolean; // HU-42
  emailVerified?: boolean; // HU-43
}

export interface CentroSalud {
  id: string;
  nombre: string;
  tipo: 'HOSPITAL' | 'CLINICA' | 'DISPENSARIO' | 'CONSULTORIO_PRIVADO';
  direccion: string;
  telefono: string;
  ciudad: string;
  horarioAtencion: string;
  disponibleGuardia: boolean;
}

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion: string;
  icono?: string;
}

export interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidadId: string;
  especialidadNombre: string;
  centrosSaludIds: string[];
  diasAtencion: string[]; // ['Lunes', 'Miércoles', 'Viernes']
  duracionTurnoMin: number;
  foto?: string;
  biografia?: string;
  idiomas?: string[];
  calificacion?: number;
  opinionesCount?: number;
  proximoTurnoLibre?: string;
}

// HU-FE-61: Configuración de Grilla Horaria
export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface DisponibilidadProfesional {
  id: string;
  profesionalId: string;
  diaSemana: string;
  horaInicio: string; // HH:mm
  horaFin: string;    // HH:mm
  intervaloMinutos: number; // 15, 20, 30
  centroSaludId: string;
  centroSaludNombre?: string;
  activo?: boolean;
}

export interface DisponibilidadRequest {
  profesionalId: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  intervaloMinutos: number;
  centroSaludId: string;
}

// HU-FE-62: Bloqueo de Agenda Médica
export type MotivoBloqueo = 'LICENCIA' | 'CONGRESO' | 'FERIADO' | 'VACACIONES' | 'OTRO';

export interface BloqueoAgenda {
  id: string;
  profesionalId: string;
  profesionalNombre?: string;
  fechaInicio: string; // YYYY-MM-DD o ISO
  fechaFin: string;    // YYYY-MM-DD o ISO
  horaInicio?: string; // HH:mm
  horaFin?: string;    // HH:mm
  motivo: string;
  turnosAfectados?: number;
  pacientesAfectados?: Array<{
    turnoId: string;
    pacienteNombre: string;
    pacienteDni: string;
    hora: string;
    fecha: string;
  }>;
  fechaCreacion?: string;
}

export interface BloqueoRequest {
  profesionalId: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  motivo: string;
}

export type EstadoTurno =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_ESPERA'
  | 'EN_SALA_DE_ESPERA'
  | 'ATENDIENDO'
  | 'COMPLETADO'
  | 'CANCELADO'
  | 'CANCELADO_POR_MEDICO'
  | 'AUSENTE';

export interface ConsultorioFisico {
  id: string;
  centroSaludId: string;
  numero: string;
  planta: string; // ej: 'Planta Baja', 'Piso 1'
  especialidadAsignada?: string;
  activo: boolean;
}

export interface Turno {
  id: string;
  codigoVerificacion: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm
  pacienteId: string;
  pacienteNombre: string;
  pacienteDni: string;
  pacienteTelefono: string;
  obraSocial?: string;
  nroAfiliado?: string;
  grupoSanguineo?: string;
  numeroAfiliado?: string;
  copagoMonto?: number;
  numeroBono?: string;
  esPrimeraVez?: boolean;
  consultorioNumero?: string;
  planta?: string;
  profesionalId: string;
  profesionalNombre: string;
  especialidadNombre: string;
  centroSaludId: string;
  centroSaludNombre: string;
  estado: EstadoTurno;
  motivoConsulta?: string;
  observaciones?: string;
  justificativoCancelacion?: string;
  fechaCreacion: string;
  horaCheckIn?: string;
  horaLlamado?: string;
  // HU-FE-63: Sobreturnos
  esSobreturno?: boolean;
  motivoSobreturno?: string;
}

export interface SobreturnoRequest {
  profesionalId: string;
  pacienteId?: string;
  pacienteNombre: string;
  pacienteDni: string;
  pacienteTelefono?: string;
  obraSocial?: string;
  centroSaludId: string;
  fecha: string; // YYYY-MM-DD
  hora?: string;  // HH:mm
  motivoSobreturno: string;
}

export interface ConsultaMedica {
  id: string;
  turnoId?: string;
  pacienteId: string;
  pacienteNombre: string;
  profesionalId: string;
  profesionalNombre: string;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  signosVitales?: {
    presionArterial?: string;
    frecuenciaCardiaca?: string;
    temperatura?: string;
    peso?: string;
  };
  receta?: RecetaDigital;
}

export interface RecetaDigital {
  id: string;
  codigoQR: string;
  fechaEmision: string;
  fechaVencimiento: string;
  medicoNombre: string;
  medicoMatricula: string;
  pacienteNombre: string;
  pacienteDni: string;
  medicamentos: Array<{
    nombreComercial: string;
    droga: string;
    presentacion: string;
    dosisIndicada: string;
    cantidad: string;
  }>;
  diagnostico: string;
  indicacionesGenerales: string;
}

export interface Cie10Diagnostico {
  id?: number;
  codigo: string;
  descripcion: string;
  capitulo?: string;
}

export interface ResumenClinico {
  pacienteId: number | string;
  nombreCompleto: string;
  dni: string;
  edad?: number;
  fechaNacimiento?: string;
  obraSocial?: string;
  nroAfiliado?: string;
  grupoSanguineo?: string;
  telefono?: string;
  alertasCriticas: string[];
  antecedentes: string[];
  ultimosSignosVitales: {
    presionArterial?: string;
    frecuenciaCardiaca?: string;
    temperatura?: string;
    peso?: string;
    talla?: string;
    imc?: string;
  };
  ultimaConsultaFecha?: string;
  ultimoDiagnostico?: string;
}

export interface TimelineItem {
  id: number | string;
  fecha: string;
  tipo: string;
  profesionalNombre: string;
  profesionalMatricula: string;
  especialidad: string;
  motivo: string;
  diagnostico: string;
  codigoCie10?: string;
  descripcionCie10?: string;
  tratamiento?: string;
  signosVitales?: Record<string, string>;
  recetaId?: number;
  tieneAdendas?: boolean;
  adendas?: string[];
  hashIntegridad?: string;
  pdfUrl?: string;
}

// ==========================================
// HU-73 / HU-101: Estudios Médicos Adjuntos
// ==========================================
export type TipoEstudio = 'LABORATORIO' | 'IMAGEN' | 'INFORME' | 'RAYOS_X';

export interface EstudioAdjunto {
  id: number;
  pacienteId: number | string;
  evolucionId?: number | string;
  nombreArchivo: string;
  mimeType: string;
  tamanioBytes: number;
  checksumSha256: string;
  tipoEstudio: TipoEstudio | string;
  fechaEstudio?: string;
  fechaCarga: string;
  urlDescarga: string;
}

// ==========================================
// HU-75 / HU-103: Consentimientos Informados
// ==========================================
export interface ConsentimientoInformado {
  id: number;
  pacienteId: number | string;
  profesionalId: number | string;
  profesionalNombre?: string;
  profesionalMatricula?: string;
  procedimiento: string;
  textoLegal: string;
  firmaDigitalBase64: string;
  ipFirma: string;
  hashIntegridadSha256: string;
  fechaHoraFirma: string;
  estado: 'FIRMADO' | 'REVOCADO';
}

export interface ConsentimientoRequest {
  pacienteId: number | string;
  profesionalId: number | string;
  procedimiento: string;
  textoLegal: string;
  firmaDigitalBase64: string;
}

// ==========================================
// HU-76 / HU-104: Alergias Críticas y Factores de Riesgo
// ==========================================
export type SeveridadAlergia = 'LEVE' | 'MODERADA' | 'GRAVE';

export interface AlergiaPaciente {
  id: number;
  pacienteId: number | string;
  sustanciaAlergeno: string;
  severidad: SeveridadAlergia;
  fechaDiagnostico?: string;
  observaciones?: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface AlergiaRequest {
  sustanciaAlergeno: string;
  severidad: SeveridadAlergia;
  fechaDiagnostico?: string;
  observaciones?: string;
}

// ==========================================
// Paginación y Respuestas de Búsqueda
// ==========================================
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}



// ==========================================
// HU-77, HU-78, HU-80: Plantillas y Recetas Farmacia
// ==========================================
export interface PlantillaClinica {
  id: string;
  titulo: string;
  especialidad: string;
  motivo: string;
  anamnesis: string;
  examenFisico: string;
  tratamientoSugerido?: string;
  esPersonalizada?: boolean;
}

export interface MedicamentoRecetaDetalle {
  droga: string;
  nombreComercial?: string;
  presentacion: string;
  dosisIndicada: string;
  viaAdministracion: string;
  posologia: string;
  duracion: string;
  cantidad: string;
}

export interface RecetaValidacion {
  codigoReceta: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'DISPENSADA' | 'VENCIDA';
  medicoNombre: string;
  medicoMatricula: string;
  especialidad: string;
  centroSaludNombre: string;
  pacienteNombre: string;
  pacienteDni: string;
  pacienteObraSocial: string;
  pacienteNroAfiliado: string;
  diagnostico: string;
  codigoCie10?: string;
  medicamentos: MedicamentoRecetaDetalle[];
  farmaciaDispensadora?: string;
  fechaDispensacion?: string;
  hashIntegridad?: string;
}
