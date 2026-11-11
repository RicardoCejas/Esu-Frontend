import type { CentroSalud } from '@/types';

export interface SedeFormValues {
  nombre: string;
  tipo: CentroSalud['tipo'];
  direccion: string;
  ciudad: string;
  telefono: string;
  horarioAtencion: string;
  cantidadPlantas: string;
  disponibleGuardia: boolean;
  permiteConsultas: boolean;
  permiteEstudios: boolean;
  estudiosDisponibles: string[];
  latitud: string;
  longitud: string;
}

export type SedeFormErrors = Partial<Record<keyof SedeFormValues, string>>;

export const INITIAL_SEDE_VALUES: SedeFormValues = {
  nombre: '',
  tipo: 'HOSPITAL',
  direccion: '',
  ciudad: 'Cruz del Eje',
  telefono: '',
  horarioAtencion: '',
  cantidadPlantas: '1',
  disponibleGuardia: false,
  permiteConsultas: true,
  permiteEstudios: false,
  estudiosDisponibles: [],
  latitud: '',
  longitud: '',
};

export function toSedeFormValues(centro: CentroSalud): SedeFormValues {
  return {
    nombre: centro?.nombre ?? '',
    tipo: centro?.tipo ?? 'HOSPITAL',
    direccion: centro?.direccion ?? '',
    ciudad: centro?.ciudad ?? 'Cruz del Eje',
    telefono: centro?.telefono ?? '',
    horarioAtencion: centro?.horarioAtencion ?? '',
    cantidadPlantas: String(centro?.cantidadPlantas && centro.cantidadPlantas >= 1 ? centro.cantidadPlantas : 1),
    disponibleGuardia: Boolean(centro?.disponibleGuardia),
    permiteConsultas: centro?.permiteConsultas !== false,
    permiteEstudios: Boolean(centro?.permiteEstudios),
    estudiosDisponibles: Array.isArray(centro?.estudiosDisponibles) ? centro.estudiosDisponibles : [],
    latitud: centro?.latitud !== undefined && centro?.latitud !== null ? String(centro.latitud) : '',
    longitud: centro?.longitud !== undefined && centro?.longitud !== null ? String(centro.longitud) : '',
  };
}

export function validateSedeField(name: keyof SedeFormValues, value: string): string | undefined {
  const trimmed = value.trim();
  if (name === 'nombre' && trimmed.length < 3) {
    return 'Ingresá un nombre institucional válido (mínimo 3 caracteres).';
  }
  if (name === 'direccion' && trimmed.length < 4) {
    return 'Ingresá la dirección física del establecimiento.';
  }
  if (name === 'ciudad' && trimmed.length < 2) {
    return 'Ingresá la localidad o ciudad de la sede.';
  }
  if (name === 'telefono' && trimmed.length < 6) {
    return 'Ingresá un teléfono de contacto válido.';
  }
  if (name === 'horarioAtencion' && trimmed.length < 3) {
    return 'Especificá el horario de atención al público.';
  }
  if (name === 'cantidadPlantas') {
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 30) {
      return 'Ingresá una cantidad entera entre 1 y 30 plantas.';
    }
  }
  if (name === 'latitud' && trimmed) {
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < -90 || parsed > 90) {
      return 'La latitud debe ser un número entre -90 y 90.';
    }
  }
  if (name === 'longitud' && trimmed) {
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < -180 || parsed > 180) {
      return 'La longitud debe ser un número entre -180 y 180.';
    }
  }
  return undefined;
}

export function validateAllSedeFields(values: SedeFormValues): SedeFormErrors {
  const fields: (keyof SedeFormValues)[] = [
    'nombre',
    'direccion',
    'ciudad',
    'telefono',
    'horarioAtencion',
    'cantidadPlantas',
    'latitud',
    'longitud',
  ];
  const nextErrors: SedeFormErrors = {};
  for (const field of fields) {
    const msg = validateSedeField(field, String(values[field] ?? ''));
    if (msg) nextErrors[field] = msg;
  }
  if (values.permiteEstudios && values.estudiosDisponibles.length === 0) {
    nextErrors.estudiosDisponibles =
      'Seleccioná al menos un estudio diagnóstico habilitado o desmarcá "Estudios Diagnósticos".';
  }
  return nextErrors;
}
