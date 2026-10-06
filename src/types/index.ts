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
  activo?: boolean;
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
}

export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'EN_ESPERA' | 'ATENDIENDO' | 'COMPLETADO' | 'CANCELADO' | 'AUSENTE';

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
  profesionalId: string;
  profesionalNombre: string;
  especialidadNombre: string;
  centroSaludId: string;
  centroSaludNombre: string;
  estado: EstadoTurno;
  motivoConsulta?: string;
  observaciones?: string;
  fechaCreacion: string;
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
