import { apiClient } from './apiClient';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import type {
  ResumenClinico,
  Cie10Diagnostico,
  TimelineItem,
  AlergiaPaciente,
  AlergiaRequest,
  EstudioAdjunto,
  ConsentimientoRequest,
  ConsentimientoInformado,
  PageResponse,
  PlantillaClinica,
  RecetaValidacion,
  RecetaDigitalDto,
} from '@/types';

function toNumericId(raw: string | number | undefined, fieldName = 'identificador'): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  const digits = String(raw ?? '').replace(/\D/g, '');
  const parsed = Number(digits);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  throw new Error(`El identificador '${fieldName}' es obligatorio y debe ser un número válido.`);
}

function normalizeRecetaValidacion(d: Record<string, unknown>, fallbackCodigo: string): RecetaValidacion {
  const rawEstado = String(d.estado ?? d.estadoReceta ?? 'PENDIENTE').toUpperCase();
  const estado: RecetaValidacion['estado'] =
    rawEstado === 'DISPENSADA' ? 'DISPENSADA' : rawEstado === 'VENCIDA' ? 'VENCIDA' : 'PENDIENTE';

  const meds = Array.isArray(d.medicamentos)
    ? (d.medicamentos as Array<Record<string, unknown>>).map((m) => ({
        droga: String(m.droga ?? ''),
        nombreComercial: typeof m.nombreComercial === 'string' ? m.nombreComercial : undefined,
        presentacion: String(m.presentacion ?? ''),
        dosisIndicada: String(m.dosisIndicada ?? ''),
        viaAdministracion: String(m.viaAdministracion ?? 'Oral'),
        posologia: String(m.posologia ?? ''),
        duracion: String(m.duracion ?? ''),
        cantidad: String(m.cantidad ?? '1'),
      }))
    : [];

  return {
    codigoReceta: String(d.codigoReceta ?? d.id ?? fallbackCodigo),
    fechaEmision: String(d.fechaEmision ?? ''),
    fechaVencimiento: String(d.fechaVencimiento ?? ''),
    estado,
    medicoNombre: String(d.medicoNombre ?? d.profesionalNombre ?? ''),
    medicoMatricula: String(d.medicoMatricula ?? d.profesionalMatricula ?? ''),
    especialidad: String(d.especialidad ?? d.profesionalEspecialidad ?? 'Medicina General'),
    centroSaludNombre: String(
      d.centroSaludNombre ?? d.centroSaludEmisorNombre ?? 'Hospital Regional Aurelio Crespo'
    ),
    pacienteNombre: String(d.pacienteNombre ?? ''),
    pacienteDni: String(d.pacienteDni ?? ''),
    pacienteObraSocial: String(d.pacienteObraSocial ?? 'Sin cobertura informada'),
    pacienteNroAfiliado: String(d.pacienteNroAfiliado ?? '-'),
    diagnostico: String(d.diagnostico ?? ''),
    codigoCie10: typeof d.codigoCie10 === 'string' ? d.codigoCie10 : undefined,
    medicamentos: meds,
    farmaciaDispensadora:
      typeof d.farmaciaDispensadora === 'string'
        ? d.farmaciaDispensadora
        : typeof d.farmaciaDispensadoraNombre === 'string'
        ? d.farmaciaDispensadoraNombre
        : typeof d.matriculaFarmaciaDispensadora === 'string'
        ? `Farmacia Mat. ${d.matriculaFarmaciaDispensadora}`
        : undefined,
    fechaDispensacion: typeof d.fechaDispensacion === 'string' ? d.fechaDispensacion : undefined,
    hashIntegridad: typeof d.hashIntegridad === 'string' ? d.hashIntegridad : undefined,
  };
}

function normalizePlantilla(d: Record<string, unknown>): PlantillaClinica {
  return {
    id: String(d.id ?? ''),
    titulo: String(d.titulo ?? ''),
    especialidad: String(d.especialidad ?? d.especialidadNombre ?? 'Medicina General'),
    motivo: String(d.motivo ?? d.titulo ?? ''),
    anamnesis: String(d.anamnesis ?? d.estructuraAnamnesis ?? ''),
    examenFisico: String(d.examenFisico ?? d.estructuraExamenFisico ?? ''),
    tratamientoSugerido: typeof d.tratamientoSugerido === 'string' ? d.tratamientoSugerido : undefined,
    esPersonalizada: Boolean(d.esPersonalizada ?? d.esPublica === false),
  };
}

export const clinicaService = {
  // HU-49: Resumen Clínico del Paciente y Alertas Críticas
  async getResumenClinico(pacienteId: string | number): Promise<ResumenClinico> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<ResumenClinico>(API_ENDPOINTS.pacientes.resumenClinico(numId));
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el resumen clínico del paciente.'), { cause: err });
    }
  },

  // HU-49: Auto-guardado de Borrador
  async guardarBorrador(borrador: Record<string, unknown>): Promise<boolean> {
    try {
      const payload = {
        ...borrador,
        turnoId: borrador.turnoId ? toNumericId(borrador.turnoId as string | number) : undefined,
        pacienteId: borrador.pacienteId
          ? toNumericId(borrador.pacienteId as string | number)
          : undefined,
      };
      await apiClient.post(API_ENDPOINTS.historiasClinicas.borrador, payload);
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo sincronizar el borrador de la consulta en el servidor.'), { cause: err });
    }
  },

  // HU-50: Búsqueda reactiva de CIE-10
  async buscarCie10(termino: string): Promise<Cie10Diagnostico[]> {
    try {
      const res = await apiClient.get<Cie10Diagnostico[]>(API_ENDPOINTS.cie10.buscar, {
        params: { q: termino },
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo consultar el catálogo CIE-10.'), { cause: err });
    }
  },

  // Fase 3: Consulta de recetas digitales del paciente autenticado
  async getMisRecetas(estado?: string): Promise<RecetaDigitalDto[]> {
    try {
      const res = await apiClient.get<RecetaDigitalDto[]>(API_ENDPOINTS.recetas.misRecetas, {
        params: estado ? { estado } : undefined,
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener sus recetas digitales.'), { cause: err });
    }
  },

  async getRecetasPorPaciente(
    pacienteId: string | number,
    estado?: string
  ): Promise<RecetaDigitalDto[]> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<RecetaDigitalDto[]>(API_ENDPOINTS.recetas.byPaciente(numId), {
        params: estado ? { estado } : undefined,
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener las recetas digitales del paciente.'), { cause: err });
    }
  },

  // HU-50: Validación de Matrícula y Prescripción
  async validarPrescripcion(
    datos: Record<string, unknown>
  ): Promise<{ valido: boolean; mensaje: string }> {
    try {
      const payload = {
        ...datos,
        pacienteId: toNumericId(datos.pacienteId as string | number),
        profesionalId: toNumericId(datos.profesionalId as string | number),
      };
      const res = await apiClient.post<{ valido: boolean; mensaje: string }>(
        API_ENDPOINTS.recetas.validarPrescripcion,
        payload
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'La prescripción no superó la validación médica.'), { cause: err });
    }
  },

  // HU-51: Finalización de atención médica y firma definitiva inalterable
  async finalizarAtencion(
    turnoId: string | number,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const numTurnoId = toNumericId(turnoId);
      const res = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.turnos.finalizarAtencion(numTurnoId),
        payload
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo finalizar ni firmar electrónicamente la consulta.'), { cause: err });
    }
  },

  // HU-51: Emisión de Adenda / Fe de Erratas sobre evolución previa
  async registrarAdenda(
    evolucionId: string | number,
    adenda: { profesionalId: number | string; justificacionClinica: string; contenidoAdicional: string }
  ): Promise<Record<string, unknown>> {
    try {
      const numEvId = toNumericId(evolucionId);
      const res = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.historiasClinicas.adendaEvolucion(numEvId),
        {
          profesionalId: toNumericId(adenda.profesionalId),
          justificacionClinica: adenda.justificacionClinica,
          contenidoAdicional: adenda.contenidoAdicional,
        }
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar la adenda médica.'), { cause: err });
    }
  },

  // HU-52: Línea de Tiempo del Paciente
  async getTimelinePaciente(pacienteId: string | number): Promise<TimelineItem[]> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<TimelineItem[]>(
        API_ENDPOINTS.historiasClinicas.timelinePaciente(numId)
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener la línea de tiempo clínica del paciente.'), { cause: err });
    }
  },

  // HU-52: Descarga de Receta en PDF
  async descargarRecetaPdf(recetaId: number | string): Promise<Blob> {
    try {
      const numId = toNumericId(recetaId);
      const res = await apiClient.get<Blob>(API_ENDPOINTS.recetas.pdf(numId), {
        responseType: 'blob',
      });
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo descargar el PDF de la receta.'), { cause: err });
    }
  },

  // HU-52: Descarga de Evolución en PDF
  async descargarEvolucionPdf(evolucionId: number | string): Promise<Blob> {
    try {
      const numId = toNumericId(evolucionId);
      const res = await apiClient.get<Blob>(API_ENDPOINTS.historiasClinicas.pdfEvolucion(numId), {
        responseType: 'blob',
      });
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo descargar el PDF de la evolución.'), { cause: err });
    }
  },

  // Verificación pública
  async verificarHash(hash: string): Promise<Record<string, unknown>> {
    try {
      const res = await apiClient.get<Record<string, unknown>>(
        API_ENDPOINTS.recetas.verificarPublico(hash)
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo verificar la autenticidad del documento.'), { cause: err });
    }
  },

  // ==========================================
  // HU-76 / HU-104: Alergias Críticas y Factores de Riesgo
  // ==========================================
  async getAlergias(pacienteId: string | number): Promise<AlergiaPaciente[]> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<AlergiaPaciente[]>(API_ENDPOINTS.pacientes.alergias(numId));
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener las alergias registradas del paciente.'), { cause: err });
    }
  },

  async agregarAlergia(pacienteId: string | number, data: AlergiaRequest): Promise<AlergiaPaciente> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.post<AlergiaPaciente>(
        API_ENDPOINTS.pacientes.alergias(numId),
        data
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar la alergia del paciente.'), { cause: err });
    }
  },

  async eliminarAlergia(alergiaId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.pacientes.alergiaById(alergiaId));
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo eliminar la alergia registrada.'), { cause: err });
    }
  },

  // ==========================================
  // HU-73 / HU-101: Visor y Carga de Estudios Médicos
  // ==========================================
  async subirEstudio(formData: FormData): Promise<EstudioAdjunto> {
    try {
      const res = await apiClient.post<EstudioAdjunto>(API_ENDPOINTS.estudios.subir, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo cargar el estudio médico adjunto.'), { cause: err });
    }
  },

  async getEstudiosPaciente(pacienteId: string | number): Promise<EstudioAdjunto[]> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<EstudioAdjunto[]>(API_ENDPOINTS.estudios.byPaciente(numId));
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los estudios adjuntos del paciente.'), { cause: err });
    }
  },

  // ==========================================
  // HU-75 / HU-103: Consentimientos Informados (Ley 26.529)
  // ==========================================
  async firmarConsentimiento(data: ConsentimientoRequest): Promise<ConsentimientoInformado> {
    try {
      const payload = {
        ...data,
        pacienteId: toNumericId(data.pacienteId),
        profesionalId: toNumericId(data.profesionalId),
      };
      const res = await apiClient.post<ConsentimientoInformado>(
        API_ENDPOINTS.consentimientos.firmar,
        payload
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo firmar ni registrar el consentimiento informado.'), { cause: err });
    }
  },

  async getConsentimientosPaciente(
    pacienteId: string | number
  ): Promise<ConsentimientoInformado[]> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<ConsentimientoInformado[]>(
        API_ENDPOINTS.consentimientos.byPaciente(numId)
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener los consentimientos informados.'), { cause: err });
    }
  },

  // ==========================================
  // HU-74 / HU-102: Timeline Clínico Parametrizado
  // ==========================================
  async getTimelineParametrizado(
    pacienteId: string | number,
    params?: { q?: string; cie10?: string; desde?: string; hasta?: string; page?: number; size?: number }
  ): Promise<PageResponse<TimelineItem>> {
    try {
      const numId = toNumericId(pacienteId);
      const res = await apiClient.get<PageResponse<TimelineItem>>(
        API_ENDPOINTS.historiasClinicas.timelineParametrizado(numId),
        { params }
      );
      return res.data;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo consultar el historial clínico parametrizado.'), { cause: err });
    }
  },

  // HU-77: Validación de Receta para Farmacias
  async validarReceta(codigoOQr: string): Promise<RecetaValidacion> {
    try {
      const res = await apiClient.get<Record<string, unknown>>(
        API_ENDPOINTS.recetas.validarPorCodigo(codigoOQr)
      );
      return normalizeRecetaValidacion(res.data, codigoOQr);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(
          err,
          'No se encontró ninguna receta médica válida con el código o QR ingresado.'
        ), { cause: err });
    }
  },

  // HU-77: Dispensar Receta
  async dispensarReceta(
    codigo: string,
    farmaciaMatricula: string,
    farmaciaNombre: string
  ): Promise<{ success: boolean; mensaje: string; receta: RecetaValidacion }> {
    try {
      const res = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.recetas.dispensar, {
        codigoOQr: codigo,
        matriculaFarmacia: farmaciaMatricula,
        farmaciaNombre,
      });
      const recetaActualizada = await this.validarReceta(codigo);
      return {
        success: true,
        mensaje: String(
          res.data?.mensaje ??
            `Receta ${codigo} dispensada exitosamente por ${farmaciaNombre}.`
        ),
        receta: recetaActualizada,
      };
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo dispensar la receta médica.'), { cause: err });
    }
  },

  // HU-80: Obtener Plantillas Clínicas por Especialidad
  async getPlantillasEvolucion(especialidad?: string): Promise<PlantillaClinica[]> {
    try {
      const res = await apiClient.get<Record<string, unknown>[]>(
        API_ENDPOINTS.plantillasEvolucion.base,
        {
          params: especialidad && especialidad !== 'Todas' ? { especialidad } : undefined,
        }
      );
      return Array.isArray(res.data) ? res.data.map(normalizePlantilla) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener las plantillas de evolución médica.'), { cause: err });
    }
  },

  // HU-80: Guardar Plantilla Personalizada
  async guardarPlantillaPersonalizada(
    plantilla: Omit<PlantillaClinica, 'id'>
  ): Promise<PlantillaClinica> {
    try {
      const res = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.plantillasEvolucion.base,
        {
          titulo: plantilla.titulo,
          especialidad: plantilla.especialidad,
          motivo: plantilla.motivo,
          estructuraAnamnesis: plantilla.anamnesis,
          estructuraExamenFisico: plantilla.examenFisico,
          tratamientoSugerido: plantilla.tratamientoSugerido,
          esPublica: false,
        }
      );
      return normalizePlantilla(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo guardar la plantilla clínica personalizada.'), { cause: err });
    }
  },
};
