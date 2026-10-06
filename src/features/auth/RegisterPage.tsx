import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.email) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
        rol: 'PACIENTE',
      });
      navigate('/dashboard/paciente');
    } catch (err: any) {
      setError(err?.message || 'Error al crear la cuenta. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/20 p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio de sesión</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <img src="/logo-icon.png" alt="Luvia Logo" className="h-14 w-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Registro de Paciente</h1>
            <p className="text-xs text-muted-foreground">
              Crea tu cuenta en Luvia para gestionar turnos y acceder a tu Historia Clínica Digital
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">DNI (Sin puntos) *</label>
                <input
                  type="text"
                  name="dni"
                  placeholder="38123456"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Teléfono de contacto</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="3549-123456"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Correo electrónico *</label>
              <input
                type="email"
                name="email"
                placeholder="juan.perez@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Contraseña *</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta de Paciente'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
