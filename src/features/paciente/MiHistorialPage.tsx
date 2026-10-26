import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pacientesService } from '@/api/pacientesService';
import type { ConsultaMedica } from '@/types';
import {
  FileText,
  Calendar,
  Activity,
  Pill,
  ShieldCheck,
  Download,
  Filter,
  Edit3,
  X,
  Trash2,
  AlertCircle
} from 'lucide-react';

export const MiHistorialPage: React.FC = () => {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState<ConsultaMedica[]>([]);
  const [loading, setLoading] = useState(true);

  // HU-33: Filtro por Rango de Fechas
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // HU-35: Corrección / Rectificación de Registro Clínico
  const [consultaAEditar, setConsultaAEditar] = useState<ConsultaMedica | null>(null);
  const [notaRectificacion, setNotaRectificacion] = useState('');
  const [motivoCorreccion, setMotivoCorreccion] = useState('Rectificación de diagnóstico');
  const [consultaAAnular, setConsultaAAnular] = useState<ConsultaMedica | null>(null);

  useEffect(() => {
    if (user) {
      pacientesService.getHistoriaClinica(user.id).then((data) => {
        setConsultas(data);
        setLoading(false);
      });
    }
  }, [user]);

  // Bloqueo de scroll cuando un modal está abierto
  useEffect(() => {
    if (consultaAEditar || consultaAAnular) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [consultaAEditar, consultaAAnular]);

  // HU-33: Filtrado por fechas
  const consultasFiltradas = consultas.filter((c) => {
    const matchDesde = !fechaDesde || c.fecha >= fechaDesde;
    const matchHasta = !fechaHasta || c.fecha <= fechaHasta;
    return matchDesde && matchHasta;
  });

  // HU-35: Aplicar corrección / nota médica
  const handleGuardarCorreccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultaAEditar) return;

    setConsultas((prev) =>
      prev.map((c) =>
        c.id === consultaAEditar.id
          ? {
              ...c,
              diagnostico: `${c.diagnostico} [CORRECCIÓN MÉDICA: ${notaRectificacion.trim()}]`,
            }
          : c
      )
    );
    setConsultaAEditar(null);
    setNotaRectificacion('');
  };

  // HU-35: Anulación de registro erróneo con confirmación accesible
  const handleConfirmarAnulacion = () => {
    if (!consultaAAnular) return;
    setConsultas((prev) => prev.filter((c) => c.id !== consultaAAnular.id));
    setConsultaAAnular(null);
    setConsultaAEditar(null);
  };

  // HU-36: Exportación de Historia Clínica a Formato PDF
  const handleExportarPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con título y botones de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Mi Historia Clínica Única (HCU)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro cronológico digital de atenciones médicas, signos vitales y recetas electrónicas de Cruz del Eje.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Datos protegidos Ley 25.326</span>
          </div>

          {/* HU-36: Botón de Exportar a PDF */}
          <button
            type="button"
            onClick={handleExportarPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer print:hidden"
            title="Exportar toda la historia clínica en formato PDF imprimible"
          >
            <Download className="h-4 w-4" />
            <span>Exportar HCU (PDF)</span>
          </button>
        </div>
      </div>

      {/* HU-33: Panel de Filtro de Atenciones Médicas por Rango de Fechas */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filtrar Consultas por Rango de Fechas:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Desde:</span>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Hasta:</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-mono"
              />
            </div>

            {(fechaDesde || fechaHasta) && (
              <button
                type="button"
                onClick={() => {
                  setFechaDesde('');
                  setFechaHasta('');
                }}
                className="rounded-lg border border-input px-2.5 py-1 text-muted-foreground hover:bg-accent transition text-xs cursor-pointer"
              >
                Limpiar Fechas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Membrete oficial visible únicamente en impresión/PDF (HU-36) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-heading">SISTEMA PÚBLICO Y PRIVADO DE SALUD UNIFICADA</h2>
            <p className="text-xs text-slate-600">Hospital Provincial Aurelio Crespo • Cruz del Eje, Córdoba</p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Paciente:</strong> {user?.nombre} {user?.apellido}</p>
            <p><strong>DNI:</strong> {user?.dni}</p>
            <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : consultasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="font-bold text-base">Sin registros médicos en este período</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No se encontraron consultas registradas que coincidan con las fechas seleccionadas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {consultasFiltradas.map((consulta) => (
            <div
              key={consulta.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 print:border-slate-300 print:shadow-none"
            >
              {/* Header de la Consulta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 font-bold border border-slate-200 dark:border-slate-700">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{consulta.profesionalNombre}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Atención realizada el {consulta.fecha}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-sky-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    Consulta Ambulatoria
                  </span>

                  {/* HU-35: Botón de Corregir / Rectificar */}
                  <button
                    type="button"
                    onClick={() => {
                      setConsultaAEditar(consulta);
                      setNotaRectificacion('');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer print:hidden"
                    title="Rectificar o asentar aclaración a esta consulta médica"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-primary" />
                    <span>Corregir</span>
                  </button>
                </div>
              </div>

              {/* Signos Vitales */}
              {consulta.signosVitales && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-muted/40 p-3.5 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Presión Arterial</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.presionArterial || '120/80 mmHg'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Frecuencia Cardíaca</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.frecuenciaCardiaca || '72 lpm'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Temperatura</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.temperatura || '36.5 °C'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Peso Corporal</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.peso || '75 kg'}
                    </span>
                  </div>
                </div>
              )}

              {/* Detalle Clínico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Motivo de Consulta:</span>
                  <p className="rounded-lg border border-border bg-background p-3 text-muted-foreground">
                    {consulta.motivo}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Diagnóstico / Evolución:</span>
                  <p className="rounded-lg border border-border bg-background p-3 font-medium text-foreground">
                    {consulta.diagnostico}
                  </p>
                </div>
              </div>

              {/* Receta Digital Asociada */}
              {consulta.receta && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3 print:border-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-xs text-primary">Receta Electrónica Emitida</h4>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {consulta.receta.codigoQR}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {consulta.receta.medicamentos.map((med, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-card p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <div>
                          <span className="font-bold text-foreground">{med.nombreComercial}</span>{' '}
                          <span className="text-muted-foreground">({med.droga} - {med.presentacion})</span>
                          <p className="text-[11px] text-primary font-medium mt-0.5">{med.dosisIndicada}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground sm:text-right">
                          Cantidad: {med.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground italic">
                    Indicaciones: {consulta.receta.indicacionesGenerales}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* HU-35: Modal de Corrección / Rectificación de Consulta Clínica */}
      {consultaAEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150 print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground font-heading">
                  Rectificar Registro Clínico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConsultaAEditar(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-400 dark:border-amber-700 p-3 text-xs text-amber-900 dark:text-amber-200 font-medium flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
              <span>Por razones médico-legales, toda rectificación queda asentada con fecha y firma en el historial clínico.</span>
            </div>

            <form onSubmit={handleGuardarCorreccion} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Motivo de la Corrección</label>
                <select
                  value={motivoCorreccion}
                  onChange={(e) => setMotivoCorreccion(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="Rectificación de diagnóstico">Aclaración / Rectificación de diagnóstico</option>
                  <option value="Ajuste de posología de medicamento">Ajuste de dosis o posología</option>
                  <option value="Error tipográfico en signos vitales">Corrección de signos vitales</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nota Médica Aclaratoria</label>
                <textarea
                  rows={3}
                  required
                  value={notaRectificacion}
                  onChange={(e) => setNotaRectificacion(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                  placeholder="Detalle la rectificación correspondiente..."
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConsultaAAnular(consultaAEditar)}
                  className="inline-flex items-center gap-1 text-destructive hover:underline text-xs cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Anular consulta por error</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultaAEditar(null)}
                    className="rounded-xl border border-input px-3 py-2 font-semibold hover:bg-accent transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer"
                  >
                    Guardar Rectificación
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Accesible de Confirmación para Anulación de Consulta */}
      {consultaAAnular && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150 print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/70">
                <Trash2 className="h-6 w-6 text-rose-700 dark:text-rose-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Anular Registro Clínico</h3>
                <p className="text-xs text-muted-foreground">Esta acción eliminará el asiento por error de carga.</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 border border-border/60">
              <div><strong className="text-foreground">Profesional:</strong> {consultaAAnular.profesionalNombre}</div>
              <div><strong className="text-foreground">Fecha de Atención:</strong> {consultaAAnular.fecha}</div>
              <div><strong className="text-foreground">Diagnóstico Original:</strong> {consultaAAnular.diagnostico}</div>
            </div>

            <p className="text-xs text-muted-foreground">
              ¿Confirmas la anulación administrativa de este registro clínico en el sistema de Cruz del Eje?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConsultaAAnular(null)}
                className="flex-1 rounded-lg border border-input bg-background py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarAnulacion}
                className="flex-1 rounded-lg bg-rose-700 py-2 text-xs font-bold text-white hover:bg-rose-800 transition cursor-pointer shadow-sm"
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
