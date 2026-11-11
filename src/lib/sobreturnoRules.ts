import {
  DNI_VALIDATION_ERROR,
  isValidDniFormat,
  normalizeDniDigits,
} from './dniValidation.ts';

export const LIMITE_SOBRETURNOS_DIARIOS = 3;

export const MOTIVOS_SOBRETURNO: string[] = [
  'Urgencia Menor / Síntoma Agudo',
  'Demanda Espontánea en Sala',
  'Control Post-Alta Inmediato',
  'Revisión de Estudios Urgentes',
  'Receta Crónica / Firma Prioritaria',
];

export interface ValidarSobreturnoParams {
  profesionalId?: string;
  centroSaludId?: string | number;
  sobreturnosHoyCount: number;
  nombre: string;
  apellido: string;
  dni: string;
  motivo: string;
  observacion?: string;
}

export interface ValidacionSobreturnoResult {
  valido: boolean;
  error?: string;
  motivoCompleto: string;
}

export function validarCupoSobreturno(sobreturnosHoyCount: number): {
  cupoAlcanzado: boolean;
  cuposRestantes: number;
} {
  const count = Math.max(0, Number.isFinite(sobreturnosHoyCount) ? sobreturnosHoyCount : 0);
  const cupoAlcanzado = count >= LIMITE_SOBRETURNOS_DIARIOS;
  const cuposRestantes = Math.max(0, LIMITE_SOBRETURNOS_DIARIOS - count);
  return { cupoAlcanzado, cuposRestantes };
}

export function validarDatosSobreturno(
  params: ValidarSobreturnoParams
): ValidacionSobreturnoResult {
  const { cupoAlcanzado } = validarCupoSobreturno(params.sobreturnosHoyCount);
  if (cupoAlcanzado) {
    return {
      valido: false,
      error: `Cupo máximo diario de sobreturnos (${LIMITE_SOBRETURNOS_DIARIOS}) alcanzado.`,
      motivoCompleto: '',
    };
  }

  if (!params.profesionalId || !String(params.profesionalId).trim()) {
    return {
      valido: false,
      error: 'El profesional médico es obligatorio.',
      motivoCompleto: '',
    };
  }

  if (!params.centroSaludId || !String(params.centroSaludId).trim()) {
    return {
      valido: false,
      error: 'El centro de salud es obligatorio para registrar un sobreturno.',
      motivoCompleto: '',
    };
  }

  const nombreLimpio = (params.nombre ?? '').trim();
  const apellidoLimpio = (params.apellido ?? '').trim();
  if (!nombreLimpio || !apellidoLimpio) {
    return {
      valido: false,
      error: 'Nombre y apellido del paciente son obligatorios.',
      motivoCompleto: '',
    };
  }

  const dniDigits = normalizeDniDigits(params.dni);
  if (!isValidDniFormat(dniDigits)) {
    return {
      valido: false,
      error: DNI_VALIDATION_ERROR,
      motivoCompleto: '',
    };
  }

  const motivoLimpio = (params.motivo ?? '').trim();
  if (motivoLimpio.length < 3) {
    return {
      valido: false,
      error: 'El motivo de sobreturno es obligatorio y debe tener al menos 3 caracteres.',
      motivoCompleto: '',
    };
  }

  const obsLimpia = (params.observacion ?? '').trim();
  const motivoCompleto = obsLimpia ? `${motivoLimpio} (${obsLimpia})` : motivoLimpio;

  if (motivoCompleto.length > 255) {
    return {
      valido: false,
      error: `El motivo y detalle superan los 255 caracteres (actual: ${motivoCompleto.length}).`,
      motivoCompleto: '',
    };
  }

  return {
    valido: true,
    motivoCompleto,
  };
}
