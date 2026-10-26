import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { clinicaService } from '@/api/clinicaService';
import type { EstudioAdjunto, TipoEstudio } from '@/types';

interface MedicalAttachmentViewerProps {
  pacienteId: string | number;
  evolucionId?: string | number;
  onEstudioSubido?: () => void;
  readOnly?: boolean;
}

const EXTENSIONES_PROHIBIDAS = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.jar', '.com', '.vbs', '.js', '.ps1'];
const EXTENSIONES_VALIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export const MedicalAttachmentViewer: React.FC<MedicalAttachmentViewerProps> = ({
  pacienteId,
  evolucionId,
  onEstudioSubido,
  readOnly = false,
}) => {
  const [estudios, setEstudios] = useState<EstudioAdjunto[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag and drop / Formulario
  const [isDragging, setIsDragging] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [tipoEstudio, setTipoEstudio] = useState<TipoEstudio>('LABORATORIO');
  const [fechaToma, setFechaToma] = useState(new Date().toISOString().split('T')[0]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  // Visor Interactivo Modal
  const [estudioEnVisor, setEstudioEnVisor] = useState<EstudioAdjunto | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotacion, setRotacion] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargarEstudios = async () => {
    try {
      setLoading(true);
      const data = await clinicaService.getEstudiosPaciente(pacienteId);
      setEstudios(data);
    } catch {
      // Ignorar fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteId) {
      cargarEstudios();
    }
  }, [pacienteId]);

  const validarArchivo = (file: File): string | null => {
    const nombre = file.name.toLowerCase();
    for (const ext of EXTENSIONES_PROHIBIDAS) {
      if (nombre.endsWith(ext)) {
        return `Seguridad: El archivo '${file.name}' contiene una extensión ejecutable prohibida (${ext}).`;
      }
    }

    const tieneExtValida = EXTENSIONES_VALIDAS.some(ext => nombre.endsWith(ext));
    if (!tieneExtValida) {
      return 'Formato inválido. Únicamente se permiten archivos PDF, JPG y PNG.';
    }

    if (file.size > MAX_BYTES) {
      return `El archivo supera el tamaño máximo permitido de 15MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`;
    }

    return null;
  };

  const procesarArchivo = (file: File) => {
    setErrorCarga(null);
    setExitoMsg(null);
    const error = validarArchivo(file);
    if (error) {
      setErrorCarga(error);
      setArchivoSeleccionado(null);
      return;
    }
    setArchivoSeleccionado(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleSubir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      setErrorCarga('Seleccione o arrastre un archivo primero.');
      return;
    }

    setSubiendo(true);
    setErrorCarga(null);
    setExitoMsg(null);

    const formData = new FormData();
    formData.append('archivo', archivoSeleccionado);
    formData.append('pacienteId', String(pacienteId));
    if (evolucionId) formData.append('evolucionId', String(evolucionId));
    formData.append('tipoEstudio', tipoEstudio);
    formData.append('fechaEstudio', fechaToma);

    try {
      await clinicaService.subirEstudio(formData);
      setExitoMsg('Estudio médico cargado y resguardado con hash de integridad SHA-256.');
      setArchivoSeleccionado(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await cargarEstudios();
      if (onEstudioSubido) onEstudioSubido();
    } catch (err: any) {
      setErrorCarga(err.response?.data?.detail || 'Error al comunicarse con el servidor de almacenamiento.');
    } finally {
      setSubiendo(false);
    }
  };

  const abrirVisor = (estudio: EstudioAdjunto) => {
    setEstudioEnVisor(estudio);
    setZoom(1);
    setRotacion(0);
  };

  const cerrarVisor = () => {
    setEstudioEnVisor(null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotar = () => setRotacion(prev => (prev + 90) % 360);

  return (
    <div className="space-y-6">
      {/* Zona de Carga Drag-and-Drop con Formulario de Metadatos (HU-73) */}
      {!readOnly && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-primary" />
              Carga de Estudios Médicos Complementarios
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjunte informes de laboratorio, ecografías o radiografías a la consulta médica (PDF/JPG/PNG max 15MB).
            </p>
          </div>
        </div>

        {errorCarga && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorCarga}</span>
          </div>
        )}

        {exitoMsg && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{exitoMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubir} className="space-y-4">
          {/* Zona Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-primary/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  procesarArchivo(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            {archivoSeleccionado ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" /> {archivoSeleccionado.name}
                </span>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {(archivoSeleccionado.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Arrastre su archivo aquí o <span className="text-primary underline">explore su equipo</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Formatos autorizados: PDF, JPG, PNG (hasta 15MB). Ejecutables estrictamente bloqueados.
                </p>
              </div>
            )}
          </div>

          {/* Metadatos del Estudio: Tipo y Fecha de toma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Tipo de Estudio *</label>
              <select
                value={tipoEstudio}
                onChange={e => setTipoEstudio(e.target.value as TipoEstudio)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="LABORATORIO">Informe de Laboratorio Clínico</option>
                <option value="RAYOS_X">Radiografía / Rayos X</option>
                <option value="IMAGEN">Ecografía / Tomografía / Resonancia</option>
                <option value="INFORME">Informe Médico / Epicrisis</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Fecha de Toma / Realización *
              </label>
              <input
                type="date"
                required
                value={fechaToma}
                onChange={e => setFechaToma(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!archivoSeleccionado || subiendo}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{subiendo ? 'Almacenando con SHA-256...' : 'Adjuntar a Historia Clínica'}</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Listado de Estudios Adjuntos */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Estudios Adjuntos al Paciente ({estudios.length})
        </h4>

        {loading ? (
          <p className="text-xs text-muted-foreground">Cargando estudios médicos...</p>
        ) : estudios.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No se han registrado estudios complementarios para este paciente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {estudios.map(estudio => {
              const esPdf = estudio.mimeType.includes('pdf') || estudio.nombreArchivo.toLowerCase().endsWith('.pdf');
              return (
                <div
                  key={estudio.id}
                  className="rounded-xl border border-border bg-slate-50/70 dark:bg-slate-900/40 p-3 flex flex-col justify-between gap-3 hover:border-primary/40 transition"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                      {esPdf ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate" title={estudio.nombreArchivo}>
                        {estudio.nombreArchivo}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {estudio.tipoEstudio} • {estudio.fechaEstudio || 'Fecha no registrada'}
                      </p>
                      <p className="text-[9px] font-mono text-slate-500 truncate" title={estudio.checksumSha256}>
                        SHA-256: {estudio.checksumSha256.substring(0, 16)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => abrirVisor(estudio)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary py-1.5 text-[11px] font-semibold transition cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Previsualizar</span>
                    </button>
                    <a
                      href={estudio.urlDescarga}
                      download={estudio.nombreArchivo}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      title="Descargar archivo original"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Visor Interactivo con Zoom, Rotación y Descarga (HU-73) */}
      {estudioEnVisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[85vh] rounded-2xl border border-slate-700 bg-slate-950 text-white flex flex-col shadow-2xl overflow-hidden">
            {/* Barra superior de herramientas */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/90">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-sky-400 shrink-0" />
                <div className="truncate">
                  <h4 className="text-xs font-bold truncate">{estudioEnVisor.nombreArchivo}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {estudioEnVisor.tipoEstudio} • Checksum SHA-256: {estudioEnVisor.checksumSha256}
                  </p>
                </div>
              </div>

              {/* Controles de Zoom y Rotación */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                    title="Alejar"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-mono px-1 font-semibold">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                    title="Acercar"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRotar}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                  title="Rotar 90°"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                <a
                  href={estudioEnVisor.urlDescarga}
                  download={estudioEnVisor.nombreArchivo}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar</span>
                </a>

                <button
                  type="button"
                  onClick={cerrarVisor}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Lienzo de Visualización */}
            <div className="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-4">
              {estudioEnVisor.mimeType.includes('pdf') || estudioEnVisor.nombreArchivo.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={estudioEnVisor.urlDescarga}
                  title="Visor PDF"
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotacion}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease',
                  }}
                />
              ) : (
                <img
                  src={estudioEnVisor.urlDescarga}
                  alt={estudioEnVisor.nombreArchivo}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotacion}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
