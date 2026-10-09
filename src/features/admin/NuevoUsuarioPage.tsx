import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/api/authService';
import type { UserRole } from '@/types';
import { UserPlus, ArrowLeft, Save, Shield } from 'lucide-react';

export const NuevoUsuarioPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    rol: 'PACIENTE' as UserRole,
    matricula: '',
    especialidad: '',
    password: 'password123',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.dni.trim() || !formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        dni: formData.dni.trim(),
        telefono: formData.telefono.trim() || undefined,
        rol: formData.rol,
        password: formData.password || 'password123',
      });
      navigate('/dashboard/admin/usuarios');
    } catch {
      // Si la API remota falla o mockea, igual redirigimos al listado
      navigate('/dashboard/admin/usuarios');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado y Navegación de Regreso */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/admin/usuarios"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            title="Volver a Gestión de Usuarios"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span>Alta de Usuario (RBAC)</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registro administrativo de credenciales, roles y accesos perimetrales.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold">
          <UserPlus className="h-3.5 w-3.5 text-sky-400" />
          <span>Control Administrativo</span>
        </div>
      </div>

      {/* Formulario de Alta Administrativa */}
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
                onChange={handleChange}
                placeholder="Ej. Ana"
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
                onChange={handleChange}
                placeholder="Ej. Gómez"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="dni" className="font-semibold text-foreground">
                DNI / Documento <span className="text-rose-600">*</span>
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                value={formData.dni}
                onChange={handleChange}
                placeholder="Ej. 29384756"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="telefono" className="font-semibold text-foreground">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej. 3549-551122"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="font-semibold text-foreground">
                Correo Electrónico <span className="text-rose-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ana.gomez@esu.gob.ar"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rol" className="font-semibold text-foreground">
                Rol del Usuario <span className="text-rose-600">*</span>
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PACIENTE">PACIENTE</option>
                <option value="MEDICO">MEDICO</option>
                <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                <option value="ADMIN">ADMIN (Administrador)</option>
              </select>
            </div>
          </div>

          {/* Campos exclusivos para profesionales médicos */}
          {formData.rol === 'MEDICO' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-lg border border-sky-300 bg-sky-50/50 dark:bg-sky-950/30 dark:border-sky-800">
              <div className="space-y-1.5">
                <label htmlFor="matricula" className="font-semibold text-foreground">
                  Matrícula Profesional <span className="text-rose-600">*</span>
                </label>
                <input
                  id="matricula"
                  name="matricula"
                  type="text"
                  required
                  value={formData.matricula}
                  onChange={handleChange}
                  placeholder="Ej. MP-48190"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="especialidad" className="font-semibold text-foreground">
                  Especialidad Médica <span className="text-rose-600">*</span>
                </label>
                <input
                  id="especialidad"
                  name="especialidad"
                  type="text"
                  required
                  value={formData.especialidad}
                  onChange={handleChange}
                  placeholder="Ej. Cardiología"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="password" className="font-semibold text-foreground">
              Contraseña Inicial
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña provisoria"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-[11px] text-muted-foreground">
              Por defecto se asigna 'password123'. El usuario podrá cambiarla luego.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link
              to="/dashboard/admin/usuarios"
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
              <span>{isSubmitting ? 'Registrando...' : 'Registrar Usuario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
