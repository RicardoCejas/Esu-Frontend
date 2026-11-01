import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profesionalesService } from '@/api/profesionalesService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { Stethoscope, ArrowLeft, Save, Building2, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const NuevaEspecialidadPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await profesionalesService.createEspecialidad({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || 'Atención médica especializada en Cruz del Eje.',
      });
      success(`Especialidad "${formData.nombre.trim()}" creada exitosamente.`);
      navigate('/dashboard/admin/especialidades');
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo crear la especialidad médica.');
      setSubmitError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado y Navegación de Regreso */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/admin/especialidades"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            title="Volver al Catálogo de Especialidades"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span>Nueva Especialidad Médica</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Habilitación de rama médica en la red de efectores de Cruz del Eje.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold">
          <Building2 className="h-3.5 w-3.5 text-sky-400" />
          <span>Efectores Sanitarios</span>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Formulario de Creación */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="nombre" className="font-semibold text-foreground">
              Nombre de la Especialidad <span className="text-rose-600">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Traumatología y Ortopedia"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="descripcion" className="font-semibold text-foreground">
              Descripción Clínica y Campo de Actuación <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              required
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe el alcance de las consultas, patologías atendidas y aparatología vinculada..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link
              to="/dashboard/admin/especialidades"
              className="rounded-lg border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Guardando...' : 'Crear Especialidad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
