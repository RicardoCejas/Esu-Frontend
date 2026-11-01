import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import type { CentroSalud, Especialidad } from '@/types';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { Stethoscope, ArrowLeft, Save, Building2, Clock, Calendar } from 'lucide-react';

export const NuevoProfesionalPage: React.FC = () => {
  const navigate = useNavigate();
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    especialidadId: '',
    centrosSaludIds: [] as string[],
    diasAtencion: ['Lunes', 'Miércoles', 'Viernes'] as string[],
    duracionTurnoMin: 20,
  });

  useEffect(() => {
    const loadData = async () => {
      const [c, e] = await Promise.all([
        centrosService.getAll(),
        profesionalesService.getEspecialidades(),
      ]);
      setCentros(c);
      setEspecialidades(e);
      if (e.length > 0) {
        setFormData((prev) => ({ ...prev, especialidadId: e[0].id }));
      }
      if (c.length > 0) {
        setFormData((prev) => ({ ...prev, centrosSaludIds: [c[0].id] }));
      }
    };
    loadData();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCentroToggle = (centroId: string) => {
    setFormData((prev) => {
      const exists = prev.centrosSaludIds.includes(centroId);
      const updated = exists
        ? prev.centrosSaludIds.filter((id) => id !== centroId)
        : [...prev.centrosSaludIds, centroId];
      return { ...prev, centrosSaludIds: updated };
    });
  };

  const handleDiaToggle = (dia: string) => {
    setFormData((prev) => {
      const exists = prev.diasAtencion.includes(dia);
      const updated = exists
        ? prev.diasAtencion.filter((d) => d !== dia)
        : [...prev.diasAtencion, dia];
      return { ...prev, diasAtencion: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.matricula.trim()) {
      return;
    }
    if (formData.centrosSaludIds.length === 0) {
      alert('Seleccione al menos un centro de salud donde atenderá el profesional.');
      return;
    }

    setIsSubmitting(true);
    const esp = especialidades.find((item) => item.id === formData.especialidadId);
    const especialidadNombre = esp ? esp.nombre : 'Medicina General';

    try {
      await profesionalesService.createProfesional({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        matricula: formData.matricula.trim(),
        especialidadId: formData.especialidadId,
        especialidadNombre,
        centrosSaludIds: formData.centrosSaludIds,
        diasAtencion: formData.diasAtencion,
        duracionTurnoMin: Number(formData.duracionTurnoMin) || 20,
      });
      navigate('/profesionales');
    } catch {
      setIsSubmitting(false);
    }
  };

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNavbar />

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Encabezado y Navegación de Regreso */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/profesionales"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
              title="Volver a Profesionales"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span>Registrar Profesional Médico</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Alta en el cuerpo médico oficial y asignación de efectores en Cruz del Eje.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold">
            <Building2 className="h-3.5 w-3.5 text-sky-400" />
            <span>Red Sanitaria</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="font-semibold text-foreground">
                  Nombre <span className="text-rose-600">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleTextChange}
                  placeholder="Ej. Martín"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="apellido" className="font-semibold text-foreground">
                  Apellido <span className="text-rose-600">*</span>
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={handleTextChange}
                  placeholder="Ej. Bustos"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="matricula" className="font-semibold text-foreground">
                  Matrícula Profesional (MP) <span className="text-rose-600">*</span>
                </label>
                <input
                  id="matricula"
                  name="matricula"
                  type="text"
                  required
                  value={formData.matricula}
                  onChange={handleTextChange}
                  placeholder="Ej. MP-34982"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="especialidadId" className="font-semibold text-foreground">
                  Especialidad Médica <span className="text-rose-600">*</span>
                </label>
                <select
                  id="especialidadId"
                  name="especialidadId"
                  value={formData.especialidadId}
                  onChange={handleTextChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                >
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Centros de Salud Habilitados */}
            <div className="space-y-2">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Centros de Salud de Atención (Efectores) *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {centros.map((centro) => {
                  const checked = formData.centrosSaludIds.includes(centro.id);
                  return (
                    <button
                      key={centro.id}
                      type="button"
                      onClick={() => handleCentroToggle(centro.id)}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition cursor-pointer ${
                        checked
                          ? 'border-primary bg-primary/5 text-foreground font-semibold'
                          : 'border-border bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-primary focus:ring-primary"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs truncate">{centro.nombre}</span>
                        <span className="block text-[10px] text-muted-foreground">{centro.direccion}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Días y Tiempos de Consulta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Días de Atención Semanal</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {diasSemana.map((dia) => {
                    const selected = formData.diasAtencion.includes(dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => handleDiaToggle(dia)}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          selected
                            ? 'bg-sky-700 text-white shadow-xs'
                            : 'border border-input bg-background text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="duracionTurnoMin" className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Duración de Consulta (Minutos)</span>
                </label>
                <select
                  id="duracionTurnoMin"
                  name="duracionTurnoMin"
                  value={formData.duracionTurnoMin}
                  onChange={handleTextChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos (Estándar)</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos (Especializada)</option>
                  <option value={60}>60 minutos (Evaluación completa)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
              <Link
                to="/profesionales"
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
                <span>{isSubmitting ? 'Guardando...' : 'Habilitar Profesional'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
