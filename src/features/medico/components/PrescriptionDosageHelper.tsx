import React, { useState, useEffect } from 'react';
import { Pill, Clock, Compass, Calendar, Package, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';

export interface DosageHelperValues {
  presentacion: string;
  viaAdministracion: string;
  dosisIndicada: string;
  posologia: string;
  duracion: string;
  cantidad: string;
}

interface PrescriptionDosageHelperProps {
  droga: string;
  initialValues: Partial<DosageHelperValues>;
  onApply: (values: DosageHelperValues) => void;
  onClose?: () => void;
  isInline?: boolean;
}

const PRESENTACIONES = [
  'Comprimidos',
  'Comprimidos recubiertos',
  'Cápsulas',
  'Jarabe',
  'Gotas orales',
  'Inyectable (ampolla)',
  'Pomada / Crema tópica',
  'Aerosol / Inhalador',
  'Suspensión oral',
  'Colirio oftálmico',
];

const VIAS_ADMINISTRACION = [
  'Oral',
  'Tópica',
  'Endovenosa (EV)',
  'Intramuscular (IM)',
  'Sublingual',
  'Inhalatoria',
  'Oftálmica',
  'Otológica',
  'Nasal',
];

const FRECUENCIAS = [
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 6 horas',
  'Cada 24 horas (1 vez al día)',
  'Cada 4 horas (según dolor/fiebre)',
  'Antes del desayuno (en ayunas)',
  'Con el almuerzo y cena',
  'Por la noche al acostarse',
  'Dosis única',
];

const DURACIONES = [
  'por 3 días',
  'por 5 días',
  'por 7 días',
  'por 10 días',
  'por 14 días',
  'por 30 días (tratamiento mensual)',
  'tratamiento continuo crónico',
  'según evolución clínica (SOS)',
];

const CANTIDADES = [
  '1 caja',
  '2 cajas',
  '3 cajas',
  '1 frasco',
  '2 frascos',
  '1 pomo / tubo',
  '1 aerosol (inhalador)',
  '5 ampollas',
];

export const PrescriptionDosageHelper: React.FC<PrescriptionDosageHelperProps> = ({
  droga,
  initialValues,
  onApply,
  onClose,
  isInline = false,
}) => {
  const [presentacion, setPresentacion] = useState(initialValues.presentacion || 'Comprimidos');
  const [dosis, setDosis] = useState(initialValues.dosisIndicada || '500 mg');
  const [via, setVia] = useState(initialValues.viaAdministracion || 'Oral');
  const [frecuencia, setFrecuencia] = useState(initialValues.posologia || 'Cada 8 horas');
  const [duracion, setDuracion] = useState(initialValues.duracion || 'por 5 días');
  const [cantidad, setCantidad] = useState(initialValues.cantidad || '1 caja');
  const [expandido, setExpandido] = useState(!isInline);

  // Sincronizar con cambios externos
  useEffect(() => {
    if (initialValues.presentacion) setPresentacion(initialValues.presentacion);
    if (initialValues.dosisIndicada) setDosis(initialValues.dosisIndicada);
    if (initialValues.viaAdministracion) setVia(initialValues.viaAdministracion);
    if (initialValues.posologia) setFrecuencia(initialValues.posologia);
    if (initialValues.duracion) setDuracion(initialValues.duracion);
    if (initialValues.cantidad) setCantidad(initialValues.cantidad);
  }, [initialValues]);

  // Generación reactiva de la indicación posológica estructurada (DoD HU-78)
  const indicacionGenerada = `${droga ? droga + ' ' : ''}${dosis ? dosis + ' - ' : ''}${presentacion}. Vía ${via}, ${frecuencia} ${duracion} (${cantidad}).`;

  const handleAplicar = () => {
    onApply({
      presentacion,
      dosisIndicada: dosis,
      viaAdministracion: via,
      posologia: frecuencia,
      duracion,
      cantidad,
    });
    if (onClose) onClose();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-200/80 rounded-xl p-4 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3 border-b border-blue-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              Asistente de Dosificación y Posología
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                HU-78
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Prescripción guiada para: <strong className="text-blue-900">{droga || 'Fármaco'}</strong>
            </p>
          </div>
        </div>

        {isInline && (
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            {expandido ? 'Minimizar' : 'Configurar'}
            {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {expandido && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {/* 1. Presentación Farmacéutica */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Pill className="w-3 h-3 text-blue-600" />
                Presentación
              </label>
              <select
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRESENTACIONES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Dosis por toma */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Dosis por Toma
              </label>
              <input
                type="text"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej. 500 mg, 10 ml, 2 puff"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 3. Vía de Administración */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Compass className="w-3 h-3 text-emerald-600" />
                Vía de Administración
              </label>
              <select
                value={via}
                onChange={(e) => setVia(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {VIAS_ADMINISTRACION.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Frecuencia / Intervalo */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Frecuencia / Intervalo
              </label>
              <select
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {FRECUENCIAS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Duración del Tratamiento */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-rose-600" />
                Duración del Tratamiento
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {DURACIONES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Cantidad total para dispensación */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Package className="w-3 h-3 text-purple-600" />
                Cantidad a Dispensar
              </label>
              <select
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {CANTIDADES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista Previa Dinámica de la Indicación Médica (DoD HU-78) */}
          <div className="bg-white border border-blue-200 rounded-lg p-2.5 mb-3 shadow-xs">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
              Vista previa de la indicación médica para el paciente y la farmacia:
            </span>
            <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
              "{indicacionGenerada}"
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleAplicar}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Aplicar Posología a la Receta
            </button>
          </div>
        </>
      )}
    </div>
  );
};
