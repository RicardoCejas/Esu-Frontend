import React, { useState } from 'react';
import {
  Download,
  Eye,
  Calendar,
  Building2,
  User,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { generarInformeEstudioPdf } from '@/lib/generarInformeEstudioPdf';

interface EstudioItem {
  id: string;
  tipoEstudio: string;
  nombre: string;
  fecha: string;
  centroSalud: string;
  medicoSolicitante: string;
  estado: 'INFORME_DISPONIBLE' | 'EN_PROCESAMIENTO';
  tamano: string;
}

interface PacienteDatosModal {
  nombreCompleto: string;
  dni: string;
  obraSocial: string;
  nroAfiliado: string;
}

export const MisEstudiosPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [descargandoId, setDescargandoId] = useState<string | null>(null);
  const [estudioVisualizar, setEstudioVisualizar] = useState<EstudioItem | null>(null);
  const [cargando] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const estudios: EstudioItem[] = [
    {
      id: 'est-01',
      tipoEstudio: 'Laboratorio de Análisis Clínicos',
      nombre: 'Hemograma Completo, Glucemia, Lipidograma y Función Renal',
      fecha: '18/10/2026',
      centroSalud: 'Hospital Provincial Dr. Aurelio Crespo',
      medicoSolicitante: 'Dr. Alejandro Morales',
      estado: 'INFORME_DISPONIBLE',
      tamano: '1.4 MB',
    },
    {
      id: 'est-02',
      tipoEstudio: 'Diagnóstico por Imágenes (Radiología)',
      nombre: 'Radiografía de Tórax Frente y Perfil',
      fecha: '05/09/2026',
      centroSalud: 'Centro de Diagnóstico por Imágenes Cruz del Eje',
      medicoSolicitante: 'Dra. María Elena Vázquez',
      estado: 'INFORME_DISPONIBLE',
      tamano: '3.8 MB',
    },
    {
      id: 'est-03',
      tipoEstudio: 'Estudios Cardiológicos',
      nombre: 'Electrocardiograma (ECG) de 12 Derivaciones con Informe',
      fecha: '15/07/2026',
      centroSalud: 'Clínica Cabrera',
      medicoSolicitante: 'Dr. Roberto Sánchez',
      estado: 'INFORME_DISPONIBLE',
      tamano: '850 KB',
    },
    {
      id: 'est-04',
      tipoEstudio: 'Diagnóstico por Imágenes (Ecografía)',
      nombre: 'Ecografía Abdominal Completa y Gineco-Obstétrica',
      fecha: '28/10/2026',
      centroSalud: 'Centro de Diagnóstico por Imágenes Cruz del Eje',
      medicoSolicitante: 'Dra. Silvina Romero',
      estado: 'INFORME_DISPONIBLE',
      tamano: '2.1 MB',
    },
  ];

  const resolverDatosPaciente = (): PacienteDatosModal => {
    let pacienteNombre = 'Lucas Agustín Ramírez';
    let pacienteDni = '39.412.850';
    let obraSocial = user?.obraSocial || 'APROSS (Córdoba)';
    let nroAfiliado = user?.nroAfiliado || '20-39412850-4/01';

    if (typeof window !== 'undefined') {
      const emailKey = user?.email?.trim().toLowerCase();
      const keys = [
        user?.pacienteId ? `esu_paciente_data_${user.pacienteId}` : null,
        user?.id ? `esu_paciente_data_${user.id}` : null,
        emailKey ? `esu_paciente_data_${emailKey}` : null,
      ].filter(Boolean) as string[];

      for (const k of keys) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.nombre && parsed.apellido) {
              pacienteNombre = `${parsed.nombre} ${parsed.apellido}`.trim();
            } else if (parsed.nombre) {
              pacienteNombre = parsed.nombre;
            }
            if (parsed.dni) pacienteDni = parsed.dni;
            if (parsed.obraSocial) obraSocial = parsed.obraSocial;
            if (parsed.nroAfiliado) nroAfiliado = parsed.nroAfiliado;
            break;
          }
        } catch {
          // Ignorar error de parsing
        }
      }
    }

    if (user?.nombre && user?.apellido) {
      const full = `${user.nombre} ${user.apellido}`.trim();
      if (full.toLowerCase() !== 'paciente registrado' && full.toLowerCase() !== 'paciente luvia') {
        pacienteNombre = full;
      }
    } else if (user?.nombre && user.nombre.toLowerCase() !== 'paciente registrado') {
      pacienteNombre = user.nombre.trim();
    }
    if (user?.dni && !user.dni.startsWith('DNI-') && !user.dni.startsWith('PENDIENTE') && !user.dni.startsWith('G-')) {
      pacienteDni = user.dni;
    }
    if (user?.obraSocial) {
      obraSocial = user.obraSocial;
    }
    if (user?.nroAfiliado && !user.nroAfiliado.startsWith('AF-') && !user.nroAfiliado.startsWith('GGL-')) {
      nroAfiliado = user.nroAfiliado;
    }

    return {
      nombreCompleto: pacienteNombre,
      dni: pacienteDni,
      obraSocial,
      nroAfiliado,
    };
  };

  const handleDescargar = async (estudio: EstudioItem) => {
    try {
      setDescargandoId(estudio.id);
      const datosPac = resolverDatosPaciente();

      await generarInformeEstudioPdf(
        {
          id: estudio.id,
          tipoEstudio: estudio.tipoEstudio,
          nombre: estudio.nombre,
          fecha: estudio.fecha,
          centroSalud: estudio.centroSalud,
          medicoSolicitante: estudio.medicoSolicitante,
          estado: estudio.estado,
        },
        datosPac
      );
      success(`Informe PDF generado para ${datosPac.nombreCompleto}: ${estudio.nombre}`);
    } catch (err) {
      console.error('Error al generar el PDF del estudio:', err);
      toastError('No se pudo generar el archivo PDF del estudio.');
    } finally {
      setDescargandoId(null);
    }
  };

  const datosPaciente = resolverDatosPaciente();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Estudios y Resultados Diagnósticos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informes de laboratorio y estudios complementarios por imágenes vinculados a tu Historia Clínica Única.
        </p>

        {/* Diferenciación clara de centro de referencia vs centro de atención */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground border border-border/60">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Centro de referencia habitual:</strong>{' '}
            {user?.centroSaludNombre || 'Hospital Provincial Dr. Aurelio Crespo'} (nodo cabecera asignado para gestión de cobertura; cada estudio se realiza y procesa en el centro de origen indicado).
          </span>
        </div>
      </div>

      {cargando ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Cargando estudios diagnósticos...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Error al cargar estudios</p>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      ) : estudios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No registras estudios complementarios</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Cuando un centro emita un informe de laboratorio o diagnóstico por imágenes, estará disponible aquí para su consulta y descarga.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {estudios.map((est) => (
            <div
              key={est.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-primary/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                    {est.tipoEstudio}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">{est.tamano}</span>
                </div>

                <div className="pt-1">
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {est.nombre}
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Realizado el: <strong>{est.fecha}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>Centro de origen: <strong>{est.centroSalud}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Profesional responsable: <strong>{est.medicoSolicitante}</strong></span>
                  </p>
                </div>
              </div>

              {/* Botones de acción: Visualizar en pantalla y Descargar PDF */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEstudioVisualizar(est)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-600/10 hover:bg-sky-600/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 py-2.5 px-2 text-xs font-bold transition cursor-pointer"
                >
                  <Eye className="h-4 w-4 shrink-0" />
                  <span>Ver Informe</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDescargar(est)}
                  disabled={descargandoId === est.id}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2.5 px-2 text-xs font-bold transition cursor-pointer disabled:opacity-60"
                >
                  {descargandoId === est.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 shrink-0" />
                      <span>Descargar PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Visualización Integral del Estudio en Pantalla */}
      {estudioVisualizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xl text-foreground max-h-[92vh] overflow-y-auto space-y-5">
            {/* Cabecera del Informe */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                    {estudioVisualizar.tipoEstudio}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    INFORME VALIDADO
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground leading-snug">
                  {estudioVisualizar.nombre}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {estudioVisualizar.centroSalud} · Fecha de práctica: <strong>{estudioVisualizar.fecha}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEstudioVisualizar(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted transition cursor-pointer"
                title="Cerrar vista"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ficha del Paciente */}
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Paciente</span>
                <span className="font-bold text-foreground text-sm">{datosPaciente.nombreCompleto}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">DNI</span>
                <span className="font-semibold text-foreground">{datosPaciente.dni}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Cobertura</span>
                <span className="font-semibold text-foreground">{datosPaciente.obraSocial}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">N° Afiliado</span>
                <span className="font-semibold text-foreground">{datosPaciente.nroAfiliado}</span>
              </div>
            </div>

            {/* Contenido Clínico del Informe */}
            <div className="space-y-4">
              {estudioVisualizar.id === 'est-01' ? (
                /* 1. Laboratorio Completo */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      Resultados Analíticos de Laboratorio
                    </h3>
                    <span className="text-[11px] text-muted-foreground font-medium">Método: Automatizado Enzimático</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3">Determinación</th>
                          <th className="py-2.5 px-3">Resultado</th>
                          <th className="py-2.5 px-3">Unidad</th>
                          <th className="py-2.5 px-3">Valor de Referencia</th>
                          <th className="py-2.5 px-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {[
                          { d: 'Glucemia Basal en Ayunas', r: '92.0', u: 'mg/dL', ref: '70.0 - 110.0' },
                          { d: 'Hemoglobina Total', r: '14.2', u: 'g/dL', ref: '12.0 - 16.5' },
                          { d: 'Hematocrito', r: '42.5', u: '%', ref: '37.0 - 48.0' },
                          { d: 'Recuento de Leucocitos', r: '6.850', u: '/mm³', ref: '4.500 - 10.500' },
                          { d: 'Recuento de Plaquetas', r: '245.000', u: '/mm³', ref: '150.000 - 450.000' },
                          { d: 'Colesterol Total', r: '178.0', u: 'mg/dL', ref: '< 200.0 Deseable' },
                          { d: 'Colesterol HDL', r: '52.0', u: 'mg/dL', ref: '> 40.0 Deseable' },
                          { d: 'Colesterol LDL (calculado)', r: '104.0', u: 'mg/dL', ref: '< 130.0 Óptimo' },
                          { d: 'Triglicéridos séricos', r: '110.0', u: 'mg/dL', ref: '< 150.0 Deseable' },
                          { d: 'Creatinina en Suero', r: '0.85', u: 'mg/dL', ref: '0.60 - 1.15' },
                          { d: 'Uremia (Urea en sangre)', r: '31.5', u: 'mg/dL', ref: '15.0 - 45.0' },
                          { d: 'Hepatograma - GOT (AST)', r: '22.0', u: 'UI/L', ref: 'Hasta 38.0' },
                          { d: 'Hepatograma - GPT (ALT)', r: '26.0', u: 'UI/L', ref: 'Hasta 41.0' },
                        ].map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-muted/10' : ''}>
                            <td className="py-2 px-3 font-semibold text-foreground">{row.d}</td>
                            <td className="py-2 px-3 font-bold text-sky-700 dark:text-sky-300 tabular-nums">{row.r}</td>
                            <td className="py-2 px-3 text-muted-foreground">{row.u}</td>
                            <td className="py-2 px-3 text-muted-foreground">{row.ref}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-block text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                NORMAL
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">
                    * Muestra procesada en Laboratorio Central mediante analizador automatizado calibrado con estándares internacionales.
                  </p>
                </div>
              ) : estudioVisualizar.id === 'est-02' ? (
                /* 2. Radiografía de Tórax */
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider border-b border-border pb-1.5">
                      Descripción de Hallazgos Radiológicos
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• TÉCNICA:</strong> Se efectúan proyecciones de tórax en incidencias de Frente y Perfil con técnica digital de alta definición.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• CAMPOS PLEUROPULMONARES:</strong> Correcta expansión bilateral. No se observan imágenes de condensación parenquimatosa focal ni infiltrados intersticiales agudos.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• SILUETA CARDIOVASCULAR:</strong> Índice cardiotorácico conservado dentro de límites fisiológicos para la contextura y edad del paciente.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• SENOS COSTOFRÉNICOS Y CARDIOFRÉNICOS:</strong> Libres y permeables en ambas proyecciones, sin derrame pleural visible.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• MARCO ÓSEO Y PARTES BLANDAS:</strong> Estructuras costales, clavículas y columna dorsal visualizadas sin trazos de fracturas ni lesiones óseas activas.
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-1">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider">
                      Conclusión Diagnóstica:
                    </h4>
                    <p className="text-emerald-950 dark:text-emerald-100 font-semibold text-xs sm:text-sm">
                      Estudio radiológico de tórax dentro de parámetros anatómicos y radiológicos habituales. Sin patología pleuropulmonar aguda en curso.
                    </p>
                  </div>
                </div>
              ) : estudioVisualizar.id === 'est-03' ? (
                /* 3. Electrocardiograma (ECG) */
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider border-b border-border pb-1.5">
                      Parámetros Electrocardiográficos de Superficie
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Ritmo</span>
                        <span className="font-bold text-foreground">Sinusal Regular</span>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Frecuencia Cardíaca</span>
                        <span className="font-bold text-foreground">72 lpm (Normosfigmia)</span>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Intervalo PR</span>
                        <span className="font-bold text-foreground">0.16 seg (Conservado)</span>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Complejo QRS</span>
                        <span className="font-bold text-foreground">0.08 seg (Eje +45°)</span>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Segmento ST / Onda T</span>
                        <span className="font-bold text-foreground">Sin alteraciones isquémicas</span>
                      </div>
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Intervalo QTc</span>
                        <span className="font-bold text-foreground">410 ms (Fisiológico)</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-1">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider">
                      Conclusión Cardiológica:
                    </h4>
                    <p className="text-emerald-950 dark:text-emerald-100 font-semibold text-xs sm:text-sm">
                      Trazado electrocardiográfico basal dentro de límites normales. Sin evidencia de arritmias, bloqueos de conducción ni signos de sobrecarga ventricular.
                    </p>
                  </div>
                </div>
              ) : (
                /* 4. Ecografía Abdominal */
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider border-b border-border pb-1.5">
                      Evaluación Ecográfica Bidimensional y Doppler
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• HÍGADO:</strong> Tamaño y morfología conservados. Ecoestructura homogénea sin evidencia de lesiones focales ni esteatosis significativa.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• VESÍCULA BILIAR:</strong> De forma anatómica, paredes finas regulares, contenido alitiásico. Vía biliar intra y extrahepática de calibre normal.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• PÁNCREAS Y BAZO:</strong> Visualizados en su totalidad, dimensiones habituales y parénquima homogéneo sin colecciones.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• RIÑONES:</strong> Ambos riñones en situación anatómica normal. Buena diferenciación córtico-medular, sin dilatación del sistema excretor ni imágenes litiásicas.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>• REGIÓN PÉLVICA:</strong> Vejiga con adecuada repleción y contornos netos, sin engrosamientos parietales.
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-1">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider">
                      Conclusión Ecográfica:
                    </h4>
                    <p className="text-emerald-950 dark:text-emerald-100 font-semibold text-xs sm:text-sm">
                      Examen ecográfico abdominopélvico conservado. No se identifican anomalías estructurales ni colecciones líquidas patológicas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sello y Firma Profesional */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Documento oficial integrado a la HCU (Ley de Derechos del Paciente N° 26.529).</span>
              </div>
              <div className="text-center sm:text-right">
                <p className="font-bold text-foreground">{estudioVisualizar.medicoSolicitante}</p>
                <p className="text-muted-foreground text-[11px]">Matrícula Profesional Habilitada · Firma Digital</p>
              </div>
            </div>

            {/* Botones de acción del Modal */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setEstudioVisualizar(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => handleDescargar(estudioVisualizar)}
                disabled={descargandoId === estudioVisualizar.id}
                className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {descargandoId === estudioVisualizar.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Descargar Informe en PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
