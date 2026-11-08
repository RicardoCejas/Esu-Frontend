import type { Turno, EstadoTurno } from '@/types';

export function normalizeEstado(raw: unknown): EstadoTurno {
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
      typeof d.codigoVerificacion === 'string' && d.codigoVerificacion.trim()
        ? d.codigoVerificacion.trim()
        : '',
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
      typeof d.consultorioNumero === 'string' ? d.consultorioNumero : undefined,
    planta: typeof d.planta === 'string' ? d.planta : undefined,
    profesionalId: String(prof?.id ?? d.profesionalId ?? ''),
    profesionalNombre: prof
      ? `${String(prof.nombre ?? '')} ${String(prof.apellido ?? '')}`.trim()
      : String(d.profesionalNombre ?? ''),
    especialidadNombre: String(
      profEsp?.nombre ?? d.especialidadNombre ?? ''
    ),
    centroSaludId: d.centroSaludId != null ? String(d.centroSaludId).replace(/^c/, '') : '',
    centroSaludNombre: typeof d.centroSaludNombre === 'string' ? d.centroSaludNombre : '',
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
    fechaCreacion: typeof d.fechaCreacion === 'string' ? d.fechaCreacion : '',
    horaCheckIn,
    horaLlamado: typeof d.horaLlamado === 'string' ? d.horaLlamado : undefined,
    esSobreturno: Boolean(d.esSobreturno),
    motivoSobreturno: typeof d.motivoSobreturno === 'string' ? d.motivoSobreturno : undefined,
    tipoAtencion: (typeof d.tipoAtencion === 'string' ? d.tipoAtencion : undefined) as Turno['tipoAtencion'],
    servicio: typeof d.servicio === 'string' ? d.servicio : undefined,
    especialidadId: (d.especialidadId as string | number | undefined) ?? (profEsp?.id as string | number | undefined),
  };
}
