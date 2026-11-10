import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pacientesService } from '@/api/pacientesService';
import { UserPlus, ArrowLeft, Save } from 'lucide-react';

export const NuevoPacientePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    obraSocial: 'APROSS',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.dni.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await pacientesService.createPaciente({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: formData.dni.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || undefined,
        obraSocial: formData.obraSocial || undefined,
      });
      navigate('/dashboard/recepcion/pacientes');
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Encabezado y Navegación de Regreso */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/recepcion/pacientes"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          title="Volver al Padrón de Pacientes"
          aria-label="Volver al Padrón de Pacientes"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" aria-hidden="true" />
            <span>Registrar Nuevo Paciente</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Alta asistencial en el padrón unificado de efectores de Cruz del Eje.
          </p>
        </div>
      </div>

      {/* Formulario Clínico de Alta */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="font-semibold text-foreground text-xs">
                Nombre <span className="text-rose-600">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Lucas"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="apellido" className="font-semibold text-foreground text-xs">
                Apellido <span className="text-rose-600">*</span>
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ej. Ramírez"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="dni" className="font-semibold text-foreground text-xs">
                DNI / Documento <span className="text-rose-600">*</span>
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                value={formData.dni}
                onChange={handleChange}
                placeholder="Ej. 38123456"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="telefono" className="font-semibold text-foreground text-xs">
                Teléfono de Contacto
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej. 3549-421111"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="font-semibold text-foreground text-xs">
                Correo Electrónico <span className="text-rose-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="lucas.ramirez@correo.com"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="obraSocial" className="font-semibold text-foreground text-xs">
                Obra Social / Cobertura
              </label>
              <select
                id="obraSocial"
                name="obraSocial"
                value={formData.obraSocial}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="APROSS">APROSS (Córdoba)</option>
                <option value="PAMI">PAMI</option>
                <option value="OSDE">OSDE</option>
                <option value="Swiss Medical">Swiss Medical</option>
                <option value="Particular / Sin Cobertura">Particular / Sin Cobertura</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border">
            <Link
              to="/dashboard/recepcion/pacientes"
              className="min-h-[40px] inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Paciente en Padrón'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
