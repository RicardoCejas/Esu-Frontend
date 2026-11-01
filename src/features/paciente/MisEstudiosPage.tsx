import React from 'react';
import { Download, Calendar, Building2, User } from 'lucide-react';

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

export const MisEstudiosPage: React.FC = () => {
  const estudiosDemo: EstudioItem[] = [
    {
      id: 'est-01',
      tipoEstudio: 'Laboratorio de Análisis Clínicos',
      nombre: 'Hemograma Completo, Glucemia, Lipidograma y Función Renal',
      fecha: '18/10/2026',
      centroSalud: 'Hospital Regional Aurelio Crespo',
      medicoSolicitante: 'Dr. Alejandro Morales',
      estado: 'INFORME_DISPONIBLE',
      tamano: '1.4 MB',
    },
    {
      id: 'est-02',
      tipoEstudio: 'Diagnóstico por Imágenes (Radiología)',
      nombre: 'Radiografía de Tórax Frente y Perfil',
      fecha: '05/09/2026',
      centroSalud: 'Centro de Diagnóstico Cruz del Eje',
      medicoSolicitante: 'Dra. María Elena Vázquez',
      estado: 'INFORME_DISPONIBLE',
      tamano: '3.8 MB',
    },
    {
      id: 'est-03',
      tipoEstudio: 'Cardiología Intervencionista',
      nombre: 'Electrocardiograma (ECG) de 12 Derivaciones con Informe',
      fecha: '15/07/2026',
      centroSalud: 'Clínica Cabrera · Cruz del Eje',
      medicoSolicitante: 'Dr. Roberto Sánchez',
      estado: 'INFORME_DISPONIBLE',
      tamano: '850 KB',
    },
  ];

  const handleDescargar = (nombre: string) => {
    alert(`Descargando informe oficial en PDF: ${nombre}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-heading text-slate-900">
          Estudios y Resultados
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Informes de laboratorio, estudios complementarios por imágenes y derivaciones oficiales vinculadas a tu Historia Clínica Única.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {estudiosDemo.map((est) => (
          <div
            key={est.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-sky-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  {est.tipoEstudio}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{est.tamano}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug font-heading">
                {est.nombre}
              </h3>

              <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 pt-1">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Realizado: {est.fecha}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{est.centroSalud}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Solicitó: {est.medicoSolicitante}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDescargar(est.nombre)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-sky-700" />
              <span>Descargar Informe PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
