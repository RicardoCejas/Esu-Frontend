import type { User, ConsultaMedica, TimelineItem } from '@/types';
import { isValidDniFormat } from '../lib/dniValidation.ts';

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
    const dmy = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmy) {
      return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    }
  }
  return undefined;
}

export function normalizePaciente(d: Record<string, unknown>): User {
  const dni = String(d.dni ?? '').trim();
  const telefono = typeof d.telefono === 'string' && d.telefono.trim() ? d.telefono.trim() : undefined;
  const fechaNacimiento = normalizeFechaNacimiento(d.fechaNacimiento);
  const telReal = Boolean(telefono && telefono.length >= 6 && telefono !== 'Sin especificar' && telefono !== '3549000000');

  return {
    id: String(d.id ?? ''),
    nombre: String(d.nombre ?? ''),
    apellido: String(d.apellido ?? ''),
    dni,
    email: String(d.email ?? ''),
    telefono,
    rol: 'PACIENTE',
    obraSocial: typeof d.obraSocial === 'string' ? d.obraSocial : undefined,
    nroAfiliado: typeof d.nroAfiliado === 'string' ? d.nroAfiliado : undefined,
    grupoSanguineo: typeof d.grupoSanguineo === 'string' ? d.grupoSanguineo : undefined,
    fechaNacimiento,
    centroSaludId:
      d.centroSaludReferenciaId !== undefined && d.centroSaludReferenciaId !== null
        ? String(d.centroSaludReferenciaId)
        : undefined,
    centroSaludNombre:
      typeof d.centroSaludReferenciaNombre === 'string' ? d.centroSaludReferenciaNombre : undefined,
    dniVerificado: isValidDniFormat(dni) && telReal && Boolean(fechaNacimiento),
    activo: true,
  };
}

export function normalizeConsulta(d: Record<string, unknown>): ConsultaMedica {
  const pac = d.paciente as Record<string, unknown> | undefined;
  const prof = d.profesional as Record<string, unknown> | undefined;
  const rawFecha = String(d.fechaAtencion ?? d.fecha ?? '');
  const signos = (d.signosVitales as Record<string, string> | undefined) || {};

  return {
    id: String(d.id ?? ''),
    pacienteId: String(pac?.id ?? d.pacienteId ?? ''),
    pacienteNombre: pac
      ? `${String(pac.nombre ?? '')} ${String(pac.apellido ?? '')}`.trim()
      : String(d.pacienteNombre ?? ''),
    profesionalId: String(prof?.id ?? d.profesionalId ?? ''),
    profesionalNombre: prof
      ? `Dr./Dra. ${String(prof.nombre ?? '')} ${String(prof.apellido ?? '')}`.trim()
      : String(d.profesionalNombre ?? ''),
    profesionalMatricula:
      typeof prof?.matricula === 'string'
        ? prof.matricula
        : typeof d.profesionalMatricula === 'string'
          ? d.profesionalMatricula
          : undefined,
    especialidadNombre:
      typeof prof?.especialidad === 'string'
        ? prof.especialidad
        : typeof d.especialidadNombre === 'string'
          ? d.especialidadNombre
          : undefined,
    centroSaludId: d.centroSaludId as string | number | undefined,
    centroSaludNombre: typeof d.centroSaludNombre === 'string' ? d.centroSaludNombre : undefined,
    fecha: rawFecha.includes('T') ? rawFecha.split('T')[0]! : rawFecha,
    motivo: String(d.motivoConsulta ?? d.motivo ?? 'Consulta médica'),
    diagnostico: String(d.diagnostico ?? d.descripcionCie10 ?? ''),
    codigoCie10: typeof d.codigoCie10 === 'string' ? d.codigoCie10 : undefined,
    descripcionCie10: typeof d.descripcionCie10 === 'string' ? d.descripcionCie10 : undefined,
    tratamiento: String(d.tratamiento ?? ''),
    signosVitales: {
      presionArterial:
        typeof d.presionArterial === 'string' && d.presionArterial !== '-'
          ? d.presionArterial
          : signos.presionArterial !== '-'
            ? signos.presionArterial
            : undefined,
      frecuenciaCardiaca:
        typeof d.frecuenciaCardiaca === 'string' && d.frecuenciaCardiaca !== '-'
          ? d.frecuenciaCardiaca
          : signos.frecuenciaCardiaca !== '-'
            ? signos.frecuenciaCardiaca
            : undefined,
      temperatura:
        typeof d.temperatura === 'string' && d.temperatura !== '-'
          ? d.temperatura
          : signos.temperatura !== '-'
            ? signos.temperatura
            : undefined,
      peso:
        typeof d.peso === 'string' && d.peso !== '-'
          ? d.peso
          : signos.peso !== '-'
            ? signos.peso
            : undefined,
      talla:
        typeof d.talla === 'string' && d.talla !== '-'
          ? d.talla
          : signos.talla !== '-'
            ? signos.talla
            : undefined,
      imc:
        typeof d.imc === 'string' && d.imc !== '-'
          ? d.imc
          : signos.imc !== '-'
            ? signos.imc
            : undefined,
    },
    recetaId: d.recetaId as string | number | undefined,
    hashIntegridad: typeof d.hashIntegridad === 'string' ? d.hashIntegridad : undefined,
    adendas: Array.isArray(d.adendas) ? (d.adendas as string[]) : undefined,
    pdfUrl: typeof d.pdfUrl === 'string' ? d.pdfUrl : undefined,
  };
}

export function normalizeTimelineToConsulta(t: TimelineItem, pacienteId: string): ConsultaMedica {
  const signos = t.signosVitales || {};
  return {
    id: String(t.id),
    pacienteId,
    pacienteNombre: '',
    profesionalId: '',
    profesionalNombre: t.profesionalNombre || 'Profesional Médico',
    profesionalMatricula: t.profesionalMatricula,
    especialidadNombre: t.especialidad,
    fecha: t.fecha
      ? t.fecha.includes(' ')
        ? t.fecha.split(' ')[0]!
        : t.fecha.includes('T')
          ? t.fecha.split('T')[0]!
          : t.fecha
      : '',
    motivo: t.motivo || 'Atención médica',
    diagnostico: t.diagnostico || t.descripcionCie10 || '',
    codigoCie10: t.codigoCie10,
    descripcionCie10: t.descripcionCie10,
    tratamiento: t.tratamiento || '',
    signosVitales: {
      presionArterial:
        signos.presionArterial && signos.presionArterial !== '-' ? signos.presionArterial : undefined,
      frecuenciaCardiaca:
        signos.frecuenciaCardiaca && signos.frecuenciaCardiaca !== '-'
          ? signos.frecuenciaCardiaca
          : undefined,
      temperatura: signos.temperatura && signos.temperatura !== '-' ? signos.temperatura : undefined,
      peso: signos.peso && signos.peso !== '-' ? signos.peso : undefined,
      talla: signos.talla && signos.talla !== '-' ? signos.talla : undefined,
      imc: signos.imc && signos.imc !== '-' ? signos.imc : undefined,
    },
    recetaId: t.recetaId,
    hashIntegridad: t.hashIntegridad,
    adendas: Array.isArray(t.adendas) ? t.adendas : undefined,
    pdfUrl: t.pdfUrl,
  };
}
