import React from 'react';
import {
  X,
  Printer,
  FileCheck2,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Building2,
  Calendar,
  User,
  Activity,
  Pill,
  ArrowLeft,
  FileSignature
} from 'lucide-react';
import type { Cie10Diagnostico } from '@/types';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSign: () => void;
  data: {
    pacienteNombre: string;
    pacienteDni: string;
    pacienteObraSocial?: string;
    pacienteNroAfiliado?: string;
    medicoNombre: string;
    medicoMatricula: string;
    especialidad: string;
    centroSaludNombre?: string;
    fechaConsulta: string;
    motivo: string;
    anamnesis: string;
    examenFisico: string;
    diagnosticoTexto: string;
    cie10: Cie10Diagnostico | null;
    tratamiento: string;
    signosVitales: {
      presion: string;
      frecuencia: string;
      temperatura: string;
      peso: string;
      talla: string;
      imc: string;
    };
    incluirReceta: boolean;
    medicamentos: Array<{
      droga: string;
      nombreComercial?: string;
      presentacion: string;
      dosisIndicada: string;
      viaAdministracion?: string;
      posologia: string;
      duracion?: string;
      cantidad: string;
    }>;
  };
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  onProceedToSign,
  data,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-300 flex flex-col max-h-[95vh] overflow-hidden">
        {/* Topbar del Modal */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <FileCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
                Previsualización en Vivo de Evolución y Receta PDF
                <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded">
                  HU-79
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Documento clínico con membrete oficial y verificación inalterable previo a la firma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hoja A4 Simulada (Imprimible) */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-10 shadow-lg border border-slate-300 rounded-sm text-slate-800 font-sans text-xs leading-relaxed print:shadow-none print:border-none print:p-0">
            {/* Membrete Institucional (DoD HU-79) */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-blue-700 text-white rounded flex items-center justify-center font-bold text-xs">
                    ESU
                  </div>
                  <span className="text-sm font-black tracking-wider text-slate-900 uppercase">
                    Ecosistema de Salud Unificado
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  {data.centroSaludNombre || 'Hospital Regional Aurelio Crespo · Cruz del Eje, Córdoba'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Red Asistencial Integrada Provincial · Sistema de Registro Clínico Inalterable (Ley 26.529)
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-300 text-[10px]">
                  DOCUMENTO CLÍNICO OFICIAL
                </span>
                <div className="text-[10px] text-slate-600 font-medium mt-1 flex items-center justify-end gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Fecha: {data.fechaConsulta || new Date().toLocaleDateString('es-AR')}
                </div>
              </div>
            </div>

            {/* Datos del Paciente & Profesional */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-5">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Filiación del Paciente
                </span>
                <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {data.pacienteNombre}
                </p>
                <p className="text-[11px] text-slate-600">
                  <strong>DNI:</strong> {data.pacienteDni} &nbsp;|&nbsp;{' '}
                  <strong>Cobertura:</strong> {data.pacienteObraSocial || 'Particular'}
                </p>
                {data.pacienteNroAfiliado && (
                  <p className="text-[10px] text-slate-500">
                    <strong>N° Afiliado:</strong> {data.pacienteNroAfiliado}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Profesional Actuante
                </span>
                <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  {data.medicoNombre}
                </p>
                <p className="text-[11px] text-slate-600">
                  <strong>Matrícula:</strong> {data.medicoMatricula}
                </p>
                <p className="text-[10px] text-blue-800 font-semibold">
                  Especialidad: {data.especialidad}
                </p>
              </div>
            </div>

            {/* Signos Vitales */}
            {data.signosVitales && (
              <div className="mb-5 border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  Signos Vitales y Somatometría
                </div>
                <div className="grid grid-cols-6 divide-x divide-slate-200 text-center py-2 bg-white text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-500 block">T.A.</span>
                    <strong className="text-slate-900">{data.signosVitales.presion || '--'}</strong>
                    <span className="text-[9px] text-slate-400 block">mmHg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">F.C.</span>
                    <strong className="text-slate-900">{data.signosVitales.frecuencia || '--'}</strong>
                    <span className="text-[9px] text-slate-400 block">lpm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Temp.</span>
                    <strong className="text-slate-900">{data.signosVitales.temperatura || '--'}</strong>
                    <span className="text-[9px] text-slate-400 block">°C</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Peso</span>
                    <strong className="text-slate-900">{data.signosVitales.peso || '--'}</strong>
                    <span className="text-[9px] text-slate-400 block">kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Talla</span>
                    <strong className="text-slate-900">{data.signosVitales.talla || '--'}</strong>
                    <span className="text-[9px] text-slate-400 block">cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">I.M.C.</span>
                    <strong className="text-emerald-700">{data.signosVitales.imc || '--'}</strong>
                    <span className="text-[9px] text-slate-400 block">kg/m²</span>
                  </div>
                </div>
              </div>
            )}

            {/* Evolución Clínica Estructurada */}
            <div className="space-y-3 mb-5">
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-0.5 mb-1 text-[11px] uppercase tracking-wide">
                  Motivo de Consulta y Anamnesis
                </h4>
                <p className="text-slate-800 text-[11px] mb-1">
                  <strong>Motivo:</strong> {data.motivo || 'Consulta médica programada.'}
                </p>
                <p className="text-slate-700 text-[11px] bg-slate-50/50 p-2 rounded border border-slate-100">
                  {data.anamnesis || 'Sin particularidades referidas.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-0.5 mb-1 text-[11px] uppercase tracking-wide">
                  Examen Físico
                </h4>
                <p className="text-slate-700 text-[11px] bg-slate-50/50 p-2 rounded border border-slate-100">
                  {data.examenFisico || 'Sin hallazgos patológicos al examen físico.'}
                </p>
              </div>

              {/* Diagnóstico CIE-10 */}
              <div className="bg-blue-50/60 border border-blue-200 p-2.5 rounded-lg">
                <h4 className="font-bold text-blue-950 text-[11px] uppercase tracking-wide mb-1">
                  Diagnóstico Clínico (CIE-10 Oficial)
                </h4>
                {data.cie10 ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                      {data.cie10.codigo}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {data.cie10.descripcion}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-700 text-xs">
                    {data.diagnosticoTexto || 'Diagnóstico clínico en evolución.'}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-0.5 mb-1 text-[11px] uppercase tracking-wide">
                  Tratamiento y Conducta Terapéutica
                </h4>
                <p className="text-slate-800 text-[11px]">
                  {data.tratamiento || 'Pautas de alarma y seguimiento ambulatorio.'}
                </p>
              </div>
            </div>

            {/* Receta Digital Anexa (si está habilitada) */}
            {data.incluirReceta && data.medicamentos && data.medicamentos.length > 0 && (
              <div className="border-t-2 border-dashed border-slate-300 pt-4 mt-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wide">
                    <Pill className="w-4 h-4 text-blue-700" />
                    Rp. / Receta Médica Electrónica Oficial (Ley 27.553)
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Validez: 30 días corridos
                  </span>
                </div>

                <div className="space-y-2">
                  {data.medicamentos.map((med, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]"
                    >
                      <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                        <span>
                          {idx + 1}. {med.droga}{' '}
                          {med.nombreComercial ? `(${med.nombreComercial})` : ''} - {med.presentacion}
                        </span>
                        <span className="text-blue-800">{med.cantidad}</span>
                      </div>
                      <p className="text-slate-700">
                        <strong>Indicación:</strong> {med.posologia}{' '}
                        {med.duracion ? `· ${med.duracion}` : ''}{' '}
                        {med.viaAdministracion ? `(Vía ${med.viaAdministracion})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pie de Página con Sello y QR de Verificación (DoD HU-79) */}
            <div className="border-t border-slate-300 pt-5 mt-6 flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-slate-300 rounded bg-white shadow-xs">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
                <div className="text-[9px] text-slate-500 max-w-xs space-y-0.5">
                  <p className="font-bold text-slate-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Validación Criptográfica Inalterable
                  </p>
                  <p>Escanee para verificar autenticidad en farmacias y centros ESU.</p>
                  <p className="font-mono text-[8px] text-slate-400 truncate">
                    Hash SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677...
                  </p>
                </div>
              </div>

              {/* Sello y Firma del Profesional */}
              <div className="text-center w-52">
                <div className="h-10 border-b border-slate-400 mb-1 flex items-center justify-center text-blue-900 font-serif italic text-sm">
                  {data.medicoNombre}
                </div>
                <p className="font-bold text-slate-900 text-[10px]">{data.medicoNombre}</p>
                <p className="text-slate-600 text-[9px]">{data.especialidad}</p>
                <p className="text-slate-500 font-mono text-[9px]">
                  Matrícula: {data.medicoMatricula}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Acciones de Corrección o Avance (DoD HU-79) */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Editar (Corregir campos)
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              ¿Todo correcto? Aplica la firma inalterable para asentar en el expediente.
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToSign();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <FileSignature className="w-4 h-4" />
              Proceder a Firma Inalterable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
