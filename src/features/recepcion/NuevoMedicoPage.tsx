import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { profesionalesService } from '@/api/profesionalesService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { Especialidad } from '@/types';
import { Stethoscope, ArrowLeft, Save, Building2, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const NuevoMedicoPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const centroId = user?.centroSaludId ? String(user.centroSaludId) : '1';
  const centroNombre = user?.centroSaludNombre || 'Centro de Salud Cruz del Eje';

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    especialidadId: '',
    email: '',
    password: '',
    telefono: '',
    diasAtencion: ['Lunes', 'Miércoles', 'Viernes'] as string[],
    duracionTurnoMin: 20,
  });

  const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    profesionalesService.getEspecialidades().then((data) => {
      setEspecialidades(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, especialidadId: data[0].id }));
      }
    }).catch((err) => {
      setSubmitError(extractApiErrorMessage(err, 'No se pudo cargar la lista de especialidades.'));
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiaToggle = (dia: string) => {
    setFormData((prev) => {
      const existe = prev.diasAtencion.includes(dia);
      const updated = existe
        ? prev.diasAtencion.filter((d) => d !== dia)
        : [...prev.diasAtencion, dia];
      return { ...prev, diasAtencion: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.matricula.trim() || !formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const centroIdNum = Number(centroId);
      const centrosIds = Number.isFinite(centroIdNum) && centroIdNum > 0 ? [centroId] : [];

      await profesionalesService.createProfesional({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        matricula: formData.matricula.trim(),
        especialidadId: formData.especialidadId,
        email: formData.email.trim().toLowerCase(),
        password: formData.password || undefined,
        telefono: formData.telefono.trim(),
        centrosSaludIds: centrosIds,
        diasAtencion: formData.diasAtencion,
        duracionTurnoMin: Number(formData.duracionTurnoMin),
      });

      success(`Dr. ${formData.nombre} ${formData.apellido} registrado exitosamente en ${centroNombre}`);
      navigate('/dashboard/recepcion/medicos');
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo registrar al profesional médico.');
      setSubmitError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/recepcion/medicos"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            title="Volver al Plantel Médico"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span>Crear Cuenta para Nuevo Médico</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alta de profesional médico perteneciente a <strong>{centroNombre}</strong>.
            </p>
          </div>
        </div>


      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-foreground flex items-center gap-2.5">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span>Centro médico asignado: <strong>{centroNombre}</strong></span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              El médico quedará matriculado e integrado a las agendas de atención de esta institución.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Nombre del Médico *</label>
            <input
              type="text"
              required
              name="nombre"
              placeholder="ej: Carlos Alberto"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Apellido *</label>
            <input
              type="text"
              required
              name="apellido"
              placeholder="ej: Bustos"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Matrícula Provincial (MP) *</label>
            <input
              type="text"
              required
              name="matricula"
              placeholder="ej: MP-34982"
              value={formData.matricula}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Especialidad Médica *</label>
            <select
              name="especialidadId"
              value={formData.especialidadId}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credenciales de Acceso para el Médico */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Credenciales de Inicio de Sesión del Médico</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Correo Electrónico Institucional *
              </label>
              <input
                type="email"
                required
                name="email"
                placeholder="ej: carlos.bustos@esu.salud.gob.ar"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Contraseña de Acceso *
              </label>
              <input
                type="password"
                required
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Días de Atención */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Días de Atención en este Centro</label>
          <div className="flex flex-wrap gap-2">
            {DIAS_SEMANA.map((dia) => {
              const seleccionado = formData.diasAtencion.includes(dia);
              return (
                <button
                  key={dia}
                  type="button"
                  onClick={() => handleDiaToggle(dia)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                    seleccionado
                      ? 'border-primary bg-primary text-primary-foreground font-bold'
                      : 'border-input bg-card text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {dia}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Duración del Turno (minutos)</label>
            <input
              type="number"
              name="duracionTurnoMin"
              min={10}
              max={60}
              step={5}
              value={formData.duracionTurnoMin}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Teléfono de Contacto</label>
            <input
              type="tel"
              name="telefono"
              placeholder="ej: 3549-401122"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <Link
            to="/dashboard/recepcion/medicos"
            className="flex-1 rounded-xl border border-input py-2.5 text-xs font-semibold text-center hover:bg-accent transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta y Asignar Médico'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
