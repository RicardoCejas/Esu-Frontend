import React, { useState, useEffect } from 'react';
import { clinicaService } from '@/api/clinicaService';
import type { PlantillaClinica } from '@/types';
import {
  FileText,
  Sparkles,
  Check,
  AlertTriangle,
  PlusCircle,
  BookmarkPlus,
  X,
  Stethoscope,
  Filter,
  Copy
} from 'lucide-react';

interface ClinicalTemplatePickerProps {
  currentEspecialidad?: string;
  currentValues: {
    motivo: string;
    anamnesis: string;
    examenFisico: string;
    tratamiento: string;
  };
  onApplyTemplate: (
    template: PlantillaClinica,
    mode: 'REPLACE' | 'APPEND'
  ) => void;
  onSaveCurrentAsTemplate?: () => void;
}

export const ClinicalTemplatePicker: React.FC<ClinicalTemplatePickerProps> = ({
  currentEspecialidad = 'Todas',
  currentValues,
  onApplyTemplate,
}) => {
  const [plantillas, setPlantillas] = useState<PlantillaClinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>(currentEspecialidad || 'Todas');
  const [selectedTemplate, setSelectedTemplate] = useState<PlantillaClinica | null>(null);

  // Modales
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<PlantillaClinica | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Formulario para guardar nueva plantilla personalizada
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState(currentEspecialidad !== 'Todas' ? currentEspecialidad : 'Medicina General');
  const [isSaving, setIsSaving] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarPlantillas = async () => {
    setLoading(true);
    try {
      const data = await clinicaService.getPlantillasEvolucion(
        filtroEspecialidad === 'Todas' ? undefined : filtroEspecialidad
      );
      setPlantillas(data);
      if (data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, [filtroEspecialidad]);

  // Manejar selección de plantilla con verificación de sobrescritura (DoD HU-80)
  const handleSelectTemplate = (template: PlantillaClinica) => {
    setSelectedTemplate(template);

    // Comprobar si ya hay texto significativo en los campos
    const hayTextoPrevio =
      (currentValues.anamnesis && currentValues.anamnesis.trim().length > 10) ||
      (currentValues.examenFisico && currentValues.examenFisico.trim().length > 10);

    if (hayTextoPrevio) {
      setPendingTemplate(template);
      setShowConfirmOverwrite(true);
    } else {
      onApplyTemplate(template, 'REPLACE');
      mostrarAviso('Plantilla aplicada directamente a la consulta.');
    }
  };

  const handleConfirmAction = (mode: 'REPLACE' | 'APPEND') => {
    if (pendingTemplate) {
      onApplyTemplate(pendingTemplate, mode);
      setShowConfirmOverwrite(false);
      setPendingTemplate(null);
      mostrarAviso(
        mode === 'REPLACE'
          ? 'Campos actualizados con la plantilla seleccionada.'
          : 'Texto de la plantilla anexado al contenido existente.'
      );
    }
  };

  const handleGuardarPersonalizada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    setIsSaving(true);
    try {
      await clinicaService.guardarPlantillaPersonalizada({
        titulo: nuevoTitulo,
        especialidad: nuevaEspecialidad,
        motivo: currentValues.motivo,
        anamnesis: currentValues.anamnesis,
        examenFisico: currentValues.examenFisico,
        tratamientoSugerido: currentValues.tratamiento,
      });
      setShowSaveModal(false);
      setNuevoTitulo('');
      cargarPlantillas();
      mostrarAviso('¡Tu plantilla personalizada se guardó exitosamente!');
    } finally {
      setIsSaving(false);
    }
  };

  const mostrarAviso = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs mb-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              Plantillas Rápidas de Evolución (Macro-Textos)
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                HU-80
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Estandarización de anamnesis y examen físico por especialidad
            </p>
          </div>
        </div>

        {/* Botón para guardar lo escrito actualmente como plantilla */}
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          title="Guardar lo que redactaste en la consulta como una plantilla reutilizable"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          Guardar texto actual como Plantilla
        </button>
      </div>

      {mensajeExito && (
        <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Selector de Especialidad & Plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mb-3">
        {/* Filtro por especialidad */}
        <div className="md:col-span-4 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filtroEspecialidad}
            onChange={(e) => setFiltroEspecialidad(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Todas">Todas las especialidades</option>
            <option value="Medicina General">Medicina General</option>
            <option value="Cardiología">Cardiología</option>
            <option value="Pediatría">Pediatría</option>
            <option value="Traumatología">Traumatología</option>
          </select>
        </div>

        {/* Selector de plantilla específica */}
        <div className="md:col-span-8 flex items-center gap-2">
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const encontrada = plantillas.find((p) => p.id === e.target.value);
              if (encontrada) setSelectedTemplate(encontrada);
            }}
            className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            {loading ? (
              <option>Cargando plantillas...</option>
            ) : plantillas.length === 0 ? (
              <option>No hay plantillas para esta especialidad</option>
            ) : (
              plantillas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.esPersonalizada ? '⭐ (Mi Plantilla) ' : ''}
                  [{p.especialidad}] {p.titulo}
                </option>
              ))
            )}
          </select>

          <button
            type="button"
            disabled={!selectedTemplate}
            onClick={() => selectedTemplate && handleSelectTemplate(selectedTemplate)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Aplicar a Consulta
          </button>
        </div>
      </div>

      {/* Previsualización colapsable rápida de la plantilla seleccionada */}
      {selectedTemplate && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              Vista previa: {selectedTemplate.titulo}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              {selectedTemplate.esPersonalizada ? 'Plantilla personalizada' : 'Plantilla clínica oficial'}
            </span>
          </div>
          <p className="line-clamp-1">
            <strong className="text-slate-700">Anamnesis:</strong> {selectedTemplate.anamnesis}
          </p>
          <p className="line-clamp-1">
            <strong className="text-slate-700">Examen Físico:</strong> {selectedTemplate.examenFisico}
          </p>
        </div>
      )}

      {/* Modal de Advertencia de Sobrescritura (DoD HU-80) */}
      {showConfirmOverwrite && pendingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  ¿Cómo deseas aplicar la plantilla?
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Ya has redactado texto en los campos de la consulta actual. Elige cómo incorporar la plantilla{' '}
                  <strong className="text-indigo-900">"{pendingTemplate.titulo}"</strong>:
                </p>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-4 space-y-1">
              <p>
                • <strong>Sobrescribir:</strong> Reemplaza el texto actual de Anamnesis y Examen Físico con los valores predefinidos de la plantilla.
              </p>
              <p>
                • <strong>Anexar al final:</strong> Conserva tu redacción actual y agrega los párrafos de la plantilla al final.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmOverwrite(false)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAction('APPEND')}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Anexar al final (Conservar actual)
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAction('REPLACE')}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                Sobrescribir campos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Guardar Plantilla Personalizada (DoD HU-80) */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Guardar como Plantilla Personalizada
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarPersonalizada} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej. Control de Diabetes tipo 2 / Rinofaringitis habitual"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Especialidad Asignada
                </label>
                <input
                  type="text"
                  value={nuevaEspecialidad}
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  placeholder="Ej. Medicina General, Cardiología..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5 max-h-48 overflow-y-auto">
                <span className="font-bold text-slate-800 block text-xs">
                  Contenido que se guardará en tu plantilla:
                </span>
                <p>
                  <strong>Motivo:</strong> {currentValues.motivo || '(Vacío)'}
                </p>
                <p>
                  <strong>Anamnesis:</strong> {currentValues.anamnesis || '(Vacío)'}
                </p>
                <p>
                  <strong>Examen Físico:</strong> {currentValues.examenFisico || '(Vacío)'}
                </p>
                <p>
                  <strong>Tratamiento:</strong> {currentValues.tratamiento || '(Vacío)'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !nuevoTitulo.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {isSaving ? 'Guardando...' : 'Crear y Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
