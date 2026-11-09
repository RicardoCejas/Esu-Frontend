import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usuariosService } from '@/api/usuariosService';
import { centrosService } from '@/api/centrosService';
import { permisosService } from '@/api/permisosService';
import { PermisosMatrixSelector, DEFAULT_PERMISSIONS_BY_ROLE } from './components/PermisosMatrixSelector';
import type { Permiso, PermissionCode } from '@/types';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { CentroSalud, BackendUserRole } from '@/types';
import { UserPlus, ArrowLeft, Save, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const NuevoUsuarioPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(false);
  const [catalogoPermisos, setCatalogoPermisos] = useState<Permiso[]>([]);
  const [selectedPermisos, setSelectedPermisos] = useState<PermissionCode[]>(DEFAULT_PERMISSIONS_BY_ROLE['RECEPCIONISTA'] ?? []);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    rol: 'RECEPCIONISTA' as BackendUserRole,
    nombre: '',
    apellido: '',
    dni: '',
    centroSaludId: '',
  });

  useEffect(() => {
    let isMounted = true;
    setLoadingCentros(true);
    centrosService
      .getAll()
      .then((data) => {
        if (isMounted) setCentros(data);
      })
      .catch(() => {
        // Fallback silencioso si las sedes no están disponibles
      })
      .finally(() => {
        if (isMounted) setLoadingCentros(false);
      });

    permisosService
      .getCatalogo()
      .then((data) => {
        if (isMounted) setCatalogoPermisos(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'rol') {
      const preset = DEFAULT_PERMISSIONS_BY_ROLE[value] ?? [];
      setSelectedPermisos(preset);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const emailTrimmed = formData.username.trim().toLowerCase();
    if (!emailTrimmed) {
      setSubmitError('El correo electrónico es obligatorio.');
      return;
    }

    if (formData.password.length < 6) {
      setSubmitError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nuevoUsuario = await usuariosService.crearUsuario({
        username: emailTrimmed,
        password: formData.password,
        rol: formData.rol,
        nombre: formData.nombre.trim() || undefined,
        apellido: formData.apellido.trim() || undefined,
        dni: formData.dni.trim() || undefined,
        centroSaludId: formData.centroSaludId || undefined,
        permisos: selectedPermisos,
      });

      success(`Usuario ${nuevoUsuario.email} (${nuevoUsuario.rol}) creado exitosamente.`);
      navigate('/dashboard/admin/usuarios');
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'No se pudo registrar el usuario en el sistema.');
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
            to="/dashboard/admin/usuarios"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            title="Volver a Cuentas de Usuarios"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>Alta de Nuevo Usuario</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Crea credenciales institucionales para administradores, médicos y personal de recepción.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800">
          <Shield className="h-3.5 w-3.5 text-sky-700" />
          <span>Administración Central</span>
        </div>
      </div>

      {/* Nota Explicativa de Seguridad */}
      <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-xs text-sky-950 space-y-1">
        <p className="font-bold text-sky-900">Seguridad de la Sesión del Administrador</p>
        <p className="text-muted-foreground leading-relaxed">
          El alta de nuevos usuarios registra las credenciales directamente en el servidor sin alterar tu sesión administrativa actual ni tus permisos de acceso.
        </p>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
        {/* Selector de Rol */}
        <div className="space-y-1">
          <label htmlFor="rol" className="text-xs font-bold text-foreground">
            Rol en el Sistema *
          </label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
          >
            <option value="RECEPCIONISTA">Recepción / Gestión de Turnos Institucional</option>
            <option value="PROFESIONAL">Profesional Médico (Atención Clínica y Recetas)</option>
            <option value="ADMIN">Administrador General del Sistema</option>
          </select>
          <p className="text-[11px] text-muted-foreground">
            Define los permisos de navegación y acceso a las funcionalidades del ecosistema de salud.
          </p>
        </div>

        {/* Datos Personales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="nombre" className="text-xs font-bold text-foreground">Nombre</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="ej: María Laura"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="apellido" className="text-xs font-bold text-foreground">Apellido</label>
            <input
              id="apellido"
              type="text"
              name="apellido"
              placeholder="ej: Fernández"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="dni" className="text-xs font-bold text-foreground">DNI / Documento</label>
            <input
              id="dni"
              type="text"
              name="dni"
              placeholder="ej: 34567890"
              value={formData.dni}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="centroSaludId" className="text-xs font-bold text-foreground">Sede / Centro de Salud Asignado</label>
            <select
              id="centroSaludId"
              name="centroSaludId"
              value={formData.centroSaludId}
              onChange={handleChange}
              disabled={loadingCentros}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">Sin sede asignada / Global</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.tipo})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credenciales de Acceso */}
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-4 space-y-3">
          <h3 className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-sky-700" />
            <span>Credenciales de Inicio de Sesión</span>
          </h3>

          <div className="space-y-1">
            <label htmlFor="username" className="text-[11px] font-bold text-slate-700">
              Correo Institucional / Usuario de Acceso *
            </label>
            <input
              id="username"
              type="email"
              required
              name="username"
              placeholder="ej: profesional@cruzdeleje.gob.ar"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="password" className="text-[11px] font-bold text-slate-700">
                Contraseña Inicial *
              </label>
              <input
                id="password"
                type="password"
                required
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-[11px] font-bold text-slate-700">
                Confirmar Contraseña *
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                name="confirmPassword"
                placeholder="Repetir contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Selector de Permisos Granulares */}
        {catalogoPermisos.length > 0 && (
          <PermisosMatrixSelector
            catalogo={catalogoPermisos}
            selectedPermisos={selectedPermisos}
            onChange={setSelectedPermisos}
            rolBase={formData.rol}
            disabled={isSubmitting}
          />
        )}

        {/* Acciones */}
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
            <span>{isSubmitting ? 'Registrando...' : 'Crear Usuario'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
