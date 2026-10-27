import React, { useState } from 'react';
import { Pill, QrCode, CheckCircle2, User, Building2, X } from 'lucide-react';
interface RecetaPaciente {
  id: string;
  codigoReceta: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'DISPONIBLE' | 'DISPENSADA' | 'VENCIDA';
  medicoNombre: string;
  medicoMatricula: string;
  especialidad: string;
  centroSaludNombre: string;
  diagnostico: string;
  medicamentos: {
    droga: string;
    nombreComercial: string;
    presentacion: string;
    dosisIndicada: string;
    posologia: string;
    duracion: string;
    cantidad: string;
  }[];
}

export const MisRecetasPage: React.FC = () => {
  const [selectedRecetaQr, setSelectedRecetaQr] = useState<RecetaPaciente | null>(null);

  const recetasDemo: RecetaPaciente[] = [
    {
      id: 'rec-01',
      codigoReceta: 'REC-CDE-2026-001',
      fechaEmision: '22/10/2026',
      fechaVencimiento: '21/11/2026',
      estado: 'DISPONIBLE',
      medicoNombre: 'Dr. Alejandro Morales',
      medicoMatricula: 'MP-34982',
      especialidad: 'Medicina General',
      centroSaludNombre: 'Hospital Regional Aurelio Crespo · Cruz del Eje',
      diagnostico: 'Rinofaringitis aguda con odinofagia (J00)',
      medicamentos: [
        {
          droga: 'Paracetamol',
          nombreComercial: 'Termofren / Tafirol',
          presentacion: 'Comprimidos 500mg',
          dosisIndicada: '500 mg',
          posologia: '1 comprimido cada 8 horas si hay fiebre o dolor',
          duracion: '5 días',
          cantidad: '1 caja (16 comprimidos)',
        },
        {
          droga: 'Loratadina',
          nombreComercial: 'Alerpriv',
          presentacion: 'Comprimidos 10mg',
          dosisIndicada: '10 mg',
          posologia: '1 comprimido diario por la noche',
          duracion: '7 días',
          cantidad: '1 caja (10 comprimidos)',
        },
      ],
    },
    {
      id: 'rec-02',
      codigoReceta: 'REC-CDE-2026-002',
      fechaEmision: '10/09/2026',
      fechaVencimiento: '10/10/2026',
      estado: 'DISPENSADA',
      medicoNombre: 'Dra. María Elena Vázquez',
      medicoMatricula: 'MP-28190',
      especialidad: 'Cardiología',
      centroSaludNombre: 'Clínica Cabrera · Cruz del Eje',
      diagnostico: 'Hipertensión arterial primaria (I10)',
      medicamentos: [
        {
          droga: 'Enalapril',
          nombreComercial: 'Lotrial',
          presentacion: 'Comprimidos 10mg',
          dosisIndicada: '10 mg',
          posologia: '1 comprimido cada 12 horas en ayunas',
          duracion: '30 días',
          cantidad: '2 cajas (30 comprimidos c/u)',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-heading text-slate-900">
          Mis Recetas y Medicación
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Prescripciones electrónicas activas y recetas con código QR oficial para retiro en farmacias hospitalarias y dispensarios de Cruz del Eje.
        </p>
      </div>

      {/* Aviso de Retiro en Farmacias */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 flex items-start gap-3 text-xs text-sky-900">
        <Pill className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">¿Cómo retirar tus medicamentos en farmacia?</p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Presentá el código QR en la farmacia del Hospital Regional Aurelio Crespo o en tu dispensario barrial asignado junto con tu DNI físico. Las recetas cuentan con firma digital homologada bajo la Ley 27.553.
          </p>
        </div>
      </div>

      {/* Listado de Recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recetasDemo.map((receta) => (
          <div
            key={receta.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 hover:border-sky-300 transition"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                    {receta.codigoReceta}
                  </span>
                  {receta.estado === 'DISPONIBLE' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Vigente
                    </span>
                  )}
                  {receta.estado === 'DISPENSADA' && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      Entregada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 font-semibold mt-1.5">{receta.diagnostico}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecetaQr(receta)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition cursor-pointer shrink-0"
              >
                <QrCode className="h-4 w-4" />
                <span>Ver QR</span>
              </button>
            </div>

            {/* Medicamentos indicados */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fármacos prescriptos:
              </span>
              {receta.medicamentos.map((med, idx) => (
                <div key={idx} className="rounded-xl bg-slate-50/70 p-3 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{med.droga}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{med.presentacion}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{med.posologia}</p>
                  <p className="text-[10px] text-sky-700 font-semibold">Cantidad: {med.cantidad} • Duración: {med.duracion}</p>
                </div>
              ))}
            </div>

            {/* Profesional y Centro */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                {receta.medicoNombre} ({receta.medicoMatricula})
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                {receta.centroSaludNombre.split('·')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal QR de Receta */}
      {selectedRecetaQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="rounded-3xl border border-sky-100 bg-white p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Código QR de Prescripción</span>
              <button
                type="button"
                onClick={() => setSelectedRecetaQr(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mx-auto">
              <QrCode className="h-36 w-36 text-slate-900 mx-auto" />
              <p className="font-mono text-xs font-bold text-slate-800 mt-2">
                {selectedRecetaQr.codigoReceta}
              </p>
            </div>

            <p className="text-xs text-slate-600">
              Presentá este QR en ventanilla de farmacia para escanear y validar la entrega de medicamentos.
            </p>

            <button
              type="button"
              onClick={() => setSelectedRecetaQr(null)}
              className="w-full rounded-xl bg-sky-700 py-2.5 text-xs font-bold text-white hover:bg-sky-800 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
