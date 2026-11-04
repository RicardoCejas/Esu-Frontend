import React, { useState } from 'react';
import { Download, Calendar, Building2, User, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EstudioItem {
  id: string;
  tipoEstudio: string;
  nombre: string;
  fecha: string;
  centroSalud: string;
  medicoSolicitante: string;
  estado: 'INFORME_DISPONIBLE' | 'EN_PROCESAMIENTO';
  tamano: string;
  esDatoDePrueba: boolean;
}

export const MisEstudiosPage: React.FC = () => {
  const { user } = useAuth();
  const [cargando] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const estudiosDemo: EstudioItem[] = [
    {
      id: 'est-01',
      tipoEstudio: 'Laboratorio de Análisis Clínicos',
      nombre: 'Hemograma Completo, Glucemia, Lipidograma y Función Renal',
      fecha: '18/10/2026',
      centroSalud: 'Hospital Provincial Dr. Aurelio Crespo',
      medicoSolicitante: 'Dr. Alejandro Morales',
      estado: 'INFORME_DISPONIBLE',
      tamano: '1.4 MB',
      esDatoDePrueba: true,
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
      esDatoDePrueba: true,
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
      esDatoDePrueba: true,
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
      esDatoDePrueba: true,
    },
  ];

  const handleDescargar = (nombre: string) => {
    alert(`Descargando informe oficial en PDF: ${nombre}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
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

      {/* Cartel identificatorio de simulación y resguardo de privacidad */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200/80 bg-sky-50/60 p-4 text-xs text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-sky-200 shadow-xs">
        <Info className="h-5 w-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sky-900 dark:text-sky-100">
            [DATO DE PRUEBA / SIMULACIÓN] Registros de Demostración
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Los estudios mostrados corresponden a simulaciones de prueba para validación del flujo asistencial y del portal de Cruz del Eje. La información de salud de cada paciente permanece resguardada y solo puede ser consultada por su titular y profesionales autorizados.
          </p>
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
      ) : estudiosDemo.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No registras estudios complementarios</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Cuando un centro emita un informe de laboratorio o diagnóstico por imágenes, estará disponible aquí para su descarga.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {estudiosDemo.map((est) => (
            <div
              key={est.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                    {est.tipoEstudio}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{est.tamano}</span>
                </div>

                <div className="pt-1">
                  <span className="inline-block text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 mb-1">
                    [DATO DE PRUEBA / SIMULACIÓN]
                  </span>
                  <h3 className="text-base font-bold text-foreground leading-snug font-heading">
                    {est.nombre}
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
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

              <button
                type="button"
                onClick={() => handleDescargar(est.nombre)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Descargar Informe PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
