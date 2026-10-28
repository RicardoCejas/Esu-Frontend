import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_USERS, MOCK_CENTROS } from '@/api/mockData';
import type { CentroSalud, User } from '@/types';
import { Building2, ArrowLeft, Save, Shield } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const NuevoUsuarioPage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombreCentro: '',
    tipo: 'CLINICA' as CentroSalud['tipo'],
    direccion: '',
    telefono: '',
    emailInstitucional: '',
    password: '',
    horarioAtencion: 'Lunes a Viernes 08:00 a 20:00',
    disponibleGuardia: false,
    responsable: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCentro.trim() || !formData.emailInstitucional.trim() || !formData.password.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const nuevoId = `c-${Date.now()}`;
      
      // Registrar en MOCK_CENTROS
      const nuevoCentro: CentroSalud = {
        id: nuevoId,
        nombre: formData.nombreCentro.trim(),
        tipo: formData.tipo,
        direccion: formData.direccion.trim() || 'Cruz del Eje, Córdoba',
        telefono: formData.telefono.trim() || '03549-422001',
        ciudad: 'Cruz del Eje',
        horarioAtencion: formData.horarioAtencion,
        disponibleGuardia: formData.disponibleGuardia,
      };
      MOCK_CENTROS.push(nuevoCentro);

      // Registrar cuenta institucional en MOCK_USERS
      const nuevaCuentaUser: User = {
        id: `u-${nuevoId}`,
        nombre: formData.nombreCentro.trim(),
        apellido: '(Centro de Salud)',
        email: formData.emailInstitucional.trim().toLowerCase(),
        dni: String(Date.now()).slice(-8),
        telefono: formData.telefono.trim(),
        rol: 'RECEPCIONISTA',
        centroSaludId: nuevoId,
        centroSaludNombre: formData.nombreCentro.trim(),
        activo: true,
      };
      MOCK_USERS.push(nuevaCuentaUser);

      success(`Cuenta creada exitosamente para ${formData.nombreCentro}`);
      navigate('/dashboard/admin/usuarios');
    } catch {
      navigate('/dashboard/admin/usuarios');
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
            to="/dashboard/admin/usuarios"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            title="Volver a Cuentas de Centros de Salud"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Crear Cuenta para Centro de Salud</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alta institucional de centro médico y creación de credenciales de acceso.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800">
          <Shield className="h-3.5 w-3.5 text-sky-700" />
          <span>Administración Central</span>
        </div>
      </div>

      {/* Nota Explicativa */}
      <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-xs text-sky-950 space-y-1">
        <p className="font-bold text-sky-900">Responsabilidad de la cuenta del Centro de Salud</p>
        <p className="text-muted-foreground leading-relaxed">
          Una vez creada la cuenta, el centro de salud podrá iniciar sesión de forma autónoma para <strong>crear las cuentas de sus médicos</strong>, <strong>asignar especialidades</strong> y <strong>gestionar la recepción de turnos</strong>.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground">
            Nombre Oficial de la Institución Sanitaria *
          </label>
          <input
            type="text"
            required
            name="nombreCentro"
            placeholder="ej: Hospital Regional Aurelio Crespo, Clínica Cabrera"
            value={formData.nombreCentro}
            onChange={handleChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Tipo de Centro Médico *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="HOSPITAL">Hospital Público</option>
              <option value="CLINICA">Clínica Privada</option>
              <option value="CONSULTORIO_PRIVADO">Centro de Diagnóstico / Consultorio</option>
              <option value="DISPENSARIO">Centro de Salud Barrial (CAPS)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Teléfono Institucional *</label>
            <input
              type="tel"
              required
              name="telefono"
              placeholder="ej: 03549-422001"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground">Dirección en Cruz del Eje *</label>
          <input
            type="text"
            required
            name="direccion"
            placeholder="ej: Av. Juan B. Justo 1200, Cruz del Eje"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Credenciales de Acceso para el Centro */}
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-4 space-y-3">
          <h3 className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-sky-700" />
            <span>Credenciales de Inicio de Sesión del Centro de Salud</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Correo Institucional de Acceso *
              </label>
              <input
                type="email"
                required
                name="emailInstitucional"
                placeholder="ej: centro.salud@esu.gob.ar"
                value={formData.emailInstitucional}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Contraseña Inicial de Acceso *
              </label>
              <input
                type="password"
                required
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Horario de Atención</label>
            <input
              type="text"
              name="horarioAtencion"
              placeholder="ej: Lunes a Viernes 08:00 a 20:00"
              value={formData.horarioAtencion}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Responsable / Director de Sede</label>
            <input
              type="text"
              name="responsable"
              placeholder="ej: Dr. Fernando Cabrera"
              value={formData.responsable}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="disponibleGuardia"
            name="disponibleGuardia"
            checked={formData.disponibleGuardia}
            onChange={handleChange}
            className="rounded border-input text-primary h-4 w-4 cursor-pointer"
          />
          <label htmlFor="disponibleGuardia" className="text-xs text-foreground font-medium cursor-pointer select-none">
            Centro con servicio de Guardia Médica Permanente (24 horas)
          </label>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <Link
            to="/dashboard/admin/usuarios"
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
            <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta Institucional'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
