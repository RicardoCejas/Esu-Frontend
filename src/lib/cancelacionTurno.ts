export interface MotivoCancelacionOpcion {
  id: string;
  label: string;
  descripcion: string;
}

export const MOTIVOS_CANCELACION_MOSTRADOR: MotivoCancelacionOpcion[] = [
  {
    id: 'DESISTIMIENTO_PACIENTE',
    label: 'Desistimiento voluntario del paciente',
    descripcion: 'El paciente comunica que no se presentará a la consulta',
  },
  {
    id: 'IMPREVISTO_PACIENTE',
    label: 'Imprevisto o fuerza mayor del paciente',
    descripcion: 'Complicaciones climáticas, de transporte o personales de último momento',
  },
  {
    id: 'DEMORA_EXCESIVA',
    label: 'Paciente retirado por demora excesiva',
    descripcion: 'El paciente se retira de sala tras superar tiempo límite de espera',
  },
  {
    id: 'ERROR_CARGA',
    label: 'Error de carga o duplicado en mostrador',
    descripcion: 'Anulación de registro emitido incorrectamente',
  },
  {
    id: 'AUSENCIA_MEDICA',
    label: 'Ausencia o emergencia del profesional',
    descripcion: 'El médico debió ausentarse o suspender agenda de forma imprevista',
  },
  {
    id: 'REAGENDADO_MOSTRADOR',
    label: 'Reagendamiento coordinado en mostrador',
    descripcion: 'Cancelación del turno actual por reagendamiento en otra fecha',
  },
];

export function validarMotivoCancelacion(
  motivo: string,
  observacion?: string
): { valido: boolean; error?: string; motivoFinal: string } {
  const motivoTrimmed = (motivo ?? '').trim();
  if (!motivoTrimmed) {
    return {
      valido: false,
      error: 'Debe seleccionar un motivo de cancelación obligatorio.',
      motivoFinal: '',
    };
  }

  const obsTrimmed = (observacion ?? '').trim();
  if (obsTrimmed.length > 255) {
    return {
      valido: false,
      error: `La observación no puede superar los 255 caracteres (actual: ${obsTrimmed.length}).`,
      motivoFinal: '',
    };
  }

  const motivoFinal = obsTrimmed
    ? `${motivoTrimmed} - Detalle: ${obsTrimmed}`
    : motivoTrimmed;

  return { valido: true, motivoFinal };
}
