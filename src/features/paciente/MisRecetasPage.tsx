import React, { useState, useEffect } from 'react';
import { Pill, QrCode, CheckCircle2, User, Building2, X, Download, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clinicaService } from '@/api/clinicaService';
import type { RecetaDigitalDto } from '@/types';

export const MisRecetasPage: React.FC = () => {
  const { user } = useAuth();
  const pacienteId = user?.pacienteId;
  const [recetas, setRecetas] = useState<RecetaDigitalDto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'VIGENTES' | 'DISPENSADAS'>('TODAS');
  const [selectedRecetaQr, setSelectedRecetaQr] = useState<RecetaDigitalDto | null>(null);
  const [descargandoPdfId, setDescargandoPdfId] = useState<string | number | null>(null);

  const cargarRecetas = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      let data: RecetaDigitalDto[] = [];
      try {
        data = await clinicaService.getMisRecetas();
      } catch (err) {
        // Fallback por pacienteId solo si falló la consulta directa por usuario
        if (pacienteId) {
          data = await clinicaService.getRecetasPorPaciente(pacienteId);
        } else {
          throw err;
        }
      }
      setRecetas(data || []);
    } catch (err) {
      console.error('Error al cargar recetas del paciente:', err);
      setErrorCarga('No se pudieron obtener las recetas en este momento. Por favor intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRecetas();
  }, [pacienteId]);

  const handleDescargarPdf = async (recetaId: number | string) => {
    try {
      setDescargandoPdfId(recetaId);
      const blob = await clinicaService.descargarRecetaPdf(recetaId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receta_Oficial_${recetaId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      alert('No se pudo generar el archivo PDF de la receta oficial.');
    } finally {
      setDescargandoPdfId(null);
    }
  };

  const recetasFiltradas = recetas.filter((r) => {
    if (filtroEstado === 'VIGENTES') {
      return r.estadoReceta === 'PENDIENTE' || r.estadoReceta === 'DISPONIBLE';
    }
    if (filtroEstado === 'DISPENSADAS') {
      return r.estadoReceta === 'DISPENSADA';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
            Mis Recetas y Medicación
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prescripciones electrónicas activas y recetas con código QR oficial para retiro en farmacias hospitalarias y dispensarios de Cruz del Eje.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarRecetas}
          disabled={cargando}
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent transition shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-primary ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Aviso de Retiro en Farmacias */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/80 dark:border-sky-800 dark:bg-sky-950/40 p-4 flex items-start gap-3.5 text-xs text-sky-950 dark:text-sky-200 shadow-xs">
        <Pill className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sm">¿Cómo retirar tus medicamentos en farmacia?</p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
            Presentá el código QR en la farmacia del Hospital Provincial Dr. Aurelio Crespo o en tu dispensario barrial asignado junto con tu DNI físico. Las recetas cuentan con firma digital homologada bajo la Ley 27.553.
          </p>
        </div>
      </div>

      {/* Filtros de Estado */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setFiltroEstado('TODAS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filtroEstado === 'TODAS'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          Todas ({recetas.length})
        </button>
        <button
          type="button"
          onClick={() => setFiltroEstado('VIGENTES')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filtroEstado === 'VIGENTES'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          Vigentes ({recetas.filter((r) => r.estadoReceta === 'PENDIENTE' || r.estadoReceta === 'DISPONIBLE').length})
        </button>
        <button
          type="button"
          onClick={() => setFiltroEstado('DISPENSADAS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filtroEstado === 'DISPENSADAS'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          Entregadas ({recetas.filter((r) => r.estadoReceta === 'DISPENSADA').length})
        </button>
      </div>

      {/* Estado de Carga */}
      {cargando && (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Consultando prescripciones digitales del paciente...</p>
        </div>
      )}

      {/* Estado de Error */}
      {!cargando && errorCarga && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-bold text-sm">{errorCarga}</p>
            <button
              type="button"
              onClick={cargarRecetas}
              className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-800 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Estado Vacío */}
      {!cargando && !errorCarga && recetasFiltradas.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Pill className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No tenés recetas médicas registradas</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Cuando un profesional médico te prescriba medicamentos en una consulta ambulatoria o de guardia, aparecerán aquí con su código QR oficial de retiro.
          </p>
        </div>
      )}

      {/* Listado de Recetas Reales */}
      {!cargando && !errorCarga && recetasFiltradas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recetasFiltradas.map((receta) => {
            const esVigente = receta.estadoReceta === 'PENDIENTE' || receta.estadoReceta === 'DISPONIBLE';
            const esDispensada = receta.estadoReceta === 'DISPENSADA';
            const esAnulada = receta.estadoReceta === 'ANULADA';

            return (
              <div
                key={receta.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/50 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                          REC-CDE-{receta.id}
                        </span>
                        {esVigente && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Vigente para retiro
                          </span>
                        )}
                        {esDispensada && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                            Entregada en Farmacia
                          </span>
                        )}
                        {esAnulada && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                            Anulada
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-foreground mt-2">
                        {receta.diagnostico || 'Prescripción médica ambulatoria'}
                        {receta.codigoCie10 && <span className="font-mono text-xs text-muted-foreground ml-1.5">[{receta.codigoCie10}]</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Emisión: {receta.fechaEmision} • Vencimiento: {receta.fechaVencimiento}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedRecetaQr(receta)}
                        className="flex items-center gap-1 rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer shadow-2xs"
                        title="Ver Código QR"
                      >
                        <QrCode className="h-4 w-4 text-primary" />
                        <span>Ver QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDescargarPdf(receta.id)}
                        disabled={descargandoPdfId === receta.id}
                        className="flex items-center gap-1 rounded-xl border border-input bg-background p-1.5 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer shadow-2xs"
                        title="Descargar PDF oficial"
                      >
                        <Download className={`h-4 w-4 text-sky-600 ${descargandoPdfId === receta.id ? 'animate-bounce' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Fármacos Prescriptos */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Fármacos Prescriptos:
                    </span>
                    <div className="space-y-2">
                      {receta.medicamentos && receta.medicamentos.length > 0 ? (
                        receta.medicamentos.map((med, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-muted/40 p-3 border border-border/80 space-y-1 text-xs"
                          >
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-extrabold text-sm text-foreground">
                                {med.droga}
                                {med.nombreComercial && med.nombreComercial !== med.droga && (
                                  <span className="font-normal text-muted-foreground text-xs ml-1">
                                    ({med.nombreComercial})
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-background px-2 py-0.5 rounded border border-border shrink-0">
                                {med.presentacion}
                              </span>
                            </div>
                            <p className="text-xs text-foreground font-medium">
                              Posología: {med.posologia || med.dosisIndicada}
                            </p>
                            <p className="text-[11px] text-primary font-bold">
                              Cantidad: {med.cantidad} {med.duracion ? `• Duración: ${med.duracion}` : ''}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Detalle de fármacos disponible en documento oficial.</p>
                      )}
                    </div>
                  </div>

                  {/* Indicaciones Generales */}
                  {receta.indicacionesGenerales && (
                    <div className="rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 p-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-sky-900 dark:text-sky-300 font-semibold">Indicaciones:</strong>{' '}
                      {receta.indicacionesGenerales}
                    </div>
                  )}
                </div>

                {/* Trazabilidad: Centro Emisor, Profesional y Lugar de Retiro / Farmacia */}
                <div className="space-y-2 pt-3 border-t border-border/80 text-xs">
                  {/* Profesional y Centro Emisor */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{receta.profesionalNombre || 'Médico Prescriptor'} {receta.profesionalMatricula ? `(${receta.profesionalMatricula})` : ''}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <Building2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="font-semibold text-foreground">Emisor:</span> {receta.centroSaludEmisorNombre || 'Hospital Provincial Dr. Aurelio Crespo'}
                    </span>
                  </div>

                  {/* Lugar de Retiro o Farmacia de Dispensación */}
                  {esDispensada && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-2 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Dispensada en: {receta.farmaciaDispensadoraNombre || 'Farmacia Oficial'}
                      </span>
                      {receta.fechaDispensacion && (
                        <span className="text-muted-foreground font-mono">
                          {receta.fechaDispensacion.replace('T', ' ').substring(0, 16)}
                        </span>
                      )}
                    </div>
                  )}

                  {esVigente && (
                    <div className="rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 p-2 text-[11px] text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span>
                        <strong className="font-semibold">Lugar sugerido de retiro:</strong>{' '}
                        {receta.lugarRetiroSugerido || 'Farmacia Hospital Provincial Dr. Aurelio Crespo o Dispensario Barrial'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal QR de Receta Oficial */}
      {selectedRecetaQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="rounded-3xl border border-border bg-card p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Código QR de Prescripción Oficial
              </span>
              <button
                type="button"
                onClick={() => setSelectedRecetaQr(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-sky-200 inline-block mx-auto shadow-xs">
              <QrCode className="h-36 w-36 text-slate-900 mx-auto" />
              <p className="font-mono text-xs font-bold text-slate-800 mt-2">
                REC-CDE-{selectedRecetaQr.id}
              </p>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">
                {selectedRecetaQr.centroSaludEmisorNombre || 'Hospital Provincial Dr. Aurelio Crespo'}
              </p>
              <p>
                Presentá este código QR en la farmacia para validar e ingresar la entrega oficial bajo la Ley 27.553.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDescargarPdf(selectedRecetaQr.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Descargar PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecetaQr(null)}
                className="flex-1 rounded-xl bg-muted py-2.5 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
