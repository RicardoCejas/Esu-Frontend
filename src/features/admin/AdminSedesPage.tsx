import React, { useState, useEffect, useCallback } from 'react';
import { centrosService } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { mapaCentrosService } from '@/features/home/mapaCentrosData';
import type { CentroSalud, User, UserRole } from '@/types';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  X,
  AlertCircle,
  RefreshCw,
  KeyRound,
  User as UserIcon,
  Eye,
  EyeOff,
  Navigation,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const ZONAS_PIN_CDE = [
  { nombre: 'Centro Cívico (Plaza 25 de Mayo)', lat: -30.7285, lng: -64.7990 },
  { nombre: 'Zona Hospital Aurelio Crespo (Sur)', lat: -30.7434, lng: -64.7876 },
  { nombre: 'Zona Clínica Cabrera (Av. Eva Perón)', lat: -30.7312, lng: -64.7945 },
  { nombre: 'Zona Sanatorio María Isabel (Pellegrini)', lat: -30.7291, lng: -64.7978 },
  { nombre: 'Zona Norte / Acceso Ruta 38', lat: -30.7210, lng: -64.8020 },
  { nombre: 'Zona Oeste / Balneario Municipal', lat: -30.7250, lng: -64.8100 },
];

export const AdminSedesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Centro (Crear / Editar)
  const [modalCentroOpen, setModalCentroOpen] = useState(false);
  const [editandoCentro, setEditandoCentro] = useState<CentroSalud | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [centroForm, setCentroForm] = useState({
    nombre: '',
    tipo: 'CLINICA' as CentroSalud['tipo'],
    direccion: '',
    // PIN de Mapa Cruz del Eje
    lat: -30.7285,
    lng: -64.7990,
    zonaSeleccionada: ZONAS_PIN_CDE[0].nombre,
    // Credenciales de Recepcionista para este centro
    usuarioEmail: '',
    usuarioPassword: '',
  });

  const [sedeAEliminar, setSedeAEliminar] = useState<CentroSalud | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const cData = await centrosService.getAll();
      setCentros(Array.isArray(cData) ? cData : []);
    } catch (err: unknown) {
      setLoadError(extractApiErrorMessage(err, 'No se pudieron cargar las sedes sanitarias del sistema.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Obtener cuenta de recepción vinculada
  const getCuentaRecepcion = (centroId: string | number, centroNombre: string) => {
    try {
      const cuentas = JSON.parse(localStorage.getItem('esu_cuentas_recepcion') || '{}');
      const found = Object.values(cuentas).find(
        (c: unknown) => {
          const item = c as { centroSaludId?: string; centroSaludNombre?: string; email?: string };
          return String(item.centroSaludId) === String(centroId) || item.centroSaludNombre?.toLowerCase() === centroNombre.toLowerCase();
        }
      ) as { email: string; password?: string } | undefined;

      if (found) return found;

      // Sugerencia predeterminada según la sede
      const nombreNorm = centroNombre.toLowerCase();
      if (nombreNorm.includes('crespo')) return { email: 'recepcion@hospitalcrespo.gob.ar' };
      if (nombreNorm.includes('cabrera')) return { email: 'recepcion@clinicacabrera.com.ar' };
      if (nombreNorm.includes('isabel')) return { email: 'recepcion@sanatoriomariaisabel.com' };
      if (nombreNorm.includes('diagnostico')) return { email: 'recepcion@diagnostico.cruzdeleje.gob.ar' };

      const slug = centroNombre.toLowerCase().replace(/[^a-z0-9]/g, '');
      return { email: `recepcion.${slug}@esu.gob.ar` };
    } catch {
      return { email: `recepcion@esu.gob.ar` };
    }
  };

  // Coordenadas del pin de mapa
  const getPinCoordenadas = (centroId: string, centroNombre: string) => {
    try {
      const pins = mapaCentrosService.getCentros();
      const pin = pins.find(
        (p) => p.id === centroId || p.nombre.toLowerCase().includes(centroNombre.toLowerCase()) || centroNombre.toLowerCase().includes(p.nombreCorto.toLowerCase())
      );
      if (pin) return { lat: pin.lat, lng: pin.lng };
    } catch {
      // fallback
    }
    return { lat: -30.7285, lng: -64.7990 };
  };

  const handleAbrirCrearCentro = () => {
    setEditandoCentro(null);
    setMostrarPassword(false);
    setCentroForm({
      nombre: '',
      tipo: 'CLINICA',
      direccion: '',
      lat: -30.7285,
      lng: -64.7990,
      zonaSeleccionada: ZONAS_PIN_CDE[0].nombre,
      usuarioEmail: '',
      usuarioPassword: '',
    });
    setModalCentroOpen(true);
  };

  const handleAbrirEditarCentro = (centro: CentroSalud) => {
    setEditandoCentro(centro);
    setMostrarPassword(false);
    const pin = getPinCoordenadas(centro.id, centro.nombre);
    const cuenta = getCuentaRecepcion(centro.id, centro.nombre);

    const zonaMatch = ZONAS_PIN_CDE.find(
      (z) => Math.abs(z.lat - pin.lat) < 0.002 && Math.abs(z.lng - pin.lng) < 0.002
    );

    setCentroForm({
      nombre: centro.nombre,
      tipo: centro.tipo,
      direccion: centro.direccion,
      lat: pin.lat,
      lng: pin.lng,
      zonaSeleccionada: zonaMatch ? zonaMatch.nombre : 'Coordenadas manuales',
      usuarioEmail: cuenta.email || '',
      usuarioPassword: cuenta.password || '',
    });
    setModalCentroOpen(true);
  };

  const handleCambiarZona = (zonaNombre: string) => {
    const zona = ZONAS_PIN_CDE.find((z) => z.nombre === zonaNombre);
    if (zona) {
      setCentroForm((prev) => ({
        ...prev,
        zonaSeleccionada: zona.nombre,
        lat: zona.lat,
        lng: zona.lng,
      }));
    } else {
      setCentroForm((prev) => ({
        ...prev,
        zonaSeleccionada: 'Coordenadas manuales',
      }));
    }
  };

  const handleCambiarNombre = (nombre: string) => {
    const slug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    setCentroForm((prev) => ({
      ...prev,
      nombre,
      // Autocompletar usuario si no ha sido modificado manualmente
      usuarioEmail: prev.usuarioEmail && !prev.usuarioEmail.startsWith('recepcion.')
        ? prev.usuarioEmail
        : slug ? `recepcion.${slug}@esu.gob.ar` : '',
    }));
  };

  const handleGuardarCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let centroGuardadoId = editandoCentro?.id;

      if (editandoCentro) {
        await centrosService.updateCentro(editandoCentro.id, {
          nombre: centroForm.nombre,
          tipo: centroForm.tipo,
          direccion: centroForm.direccion,
          ciudad: 'Cruz del Eje',
        });
        success(`Sede "${centroForm.nombre}" actualizada con éxito.`);
      } else {
        const creado = await centrosService.createCentro({
          nombre: centroForm.nombre,
          tipo: centroForm.tipo,
          direccion: centroForm.direccion,
          ciudad: 'Cruz del Eje',
          telefono: '',
          horarioAtencion: 'Lunes a Viernes 08:00 a 20:00',
          disponibleGuardia: false,
          activo: true,
          permiteConsultas: true,
          permiteEstudios: false,
          estudiosDisponibles: [],
        });
        centroGuardadoId = creado.id;
        success(`Sede "${centroForm.nombre}" creada con éxito.`);
      }

      const centroIdStr = String(centroGuardadoId || Date.now());

      // 1. Guardar Pin del mapa en Cruz del Eje
      mapaCentrosService.guardarCoordenadas(
        `cde-sede-${centroIdStr}`,
        centroForm.lat,
        centroForm.lng
      );

      // 2. Guardar credenciales de recepcionista para que pueda ingresar
      if (centroForm.usuarioEmail.trim()) {
        const emailNorm = centroForm.usuarioEmail.toLowerCase().trim();
        const pwd = centroForm.usuarioPassword.trim() || 'recepcion123';

        const cuentas = JSON.parse(localStorage.getItem('esu_cuentas_recepcion') || '{}');
        cuentas[emailNorm] = {
          email: emailNorm,
          password: pwd,
          centroSaludId: centroIdStr,
          centroSaludNombre: centroForm.nombre,
          rol: 'RECEPCIONISTA',
          nombre: 'Recepción',
          apellido: centroForm.nombre,
          activo: true,
        };
        localStorage.setItem('esu_cuentas_recepcion', JSON.stringify(cuentas));

        // Registrar en usuarios personalizados del sistema
        const customUsers: User[] = JSON.parse(localStorage.getItem('esu_custom_users') || '[]');
        const idx = customUsers.findIndex((u) => u.email.toLowerCase() === emailNorm);
        const nuevoUser: User = {
          id: `rec-${centroIdStr}`,
          email: emailNorm,
          dni: '',
          nombre: 'Recepción',
          apellido: centroForm.nombre,
          rol: 'RECEPCIONISTA' as UserRole,
          centroSaludId: centroIdStr,
          centroSaludNombre: centroForm.nombre,
          activo: true,
          emailVerified: true,
          twoFactorEnabled: false,
        };

        if (idx >= 0) {
          customUsers[idx] = nuevoUser;
        } else {
          customUsers.push(nuevoUser);
        }
        localStorage.setItem('esu_custom_users', JSON.stringify(customUsers));

        // Notificar al sistema global de usuarios
        window.dispatchEvent(new CustomEvent('esu_usuarios_updated', { detail: nuevoUser }));
      }

      setModalCentroOpen(false);
      cargarDatos();
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo guardar la información de la sede.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmarEliminarCentro = async () => {
    if (!sedeAEliminar) return;
    setIsSaving(true);
    try {
      await centrosService.deleteCentro(sedeAEliminar.id);
      success(`Sede "${sedeAEliminar.nombre}" eliminada del sistema.`);
      setSedeAEliminar(null);
      cargarDatos();
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo eliminar la sede seleccionada.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-primary" />
            <span>Gestión de Sedes y Centros de Salud</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Alta y administración de efectores de salud en Cruz del Eje, ubicación de pines en el mapa y credenciales de recepción.
          </p>
        </div>

        <button
          onClick={handleAbrirCrearCentro}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nueva Sede Sanitaria</span>
        </button>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={cargarDatos}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Sedes Sanitarias Registradas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 font-heading">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Sedes Sanitarias Registradas ({centros.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex h-44 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : centros.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No se encontraron sedes sanitarias registradas en el sistema.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {centros.map((centro) => {
              const coords = getPinCoordenadas(centro.id, centro.nombre);
              const cuenta = getCuentaRecepcion(centro.id, centro.nombre);

              return (
                <div
                  key={centro.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-lg bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {centro.tipo}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAbrirEditarCentro(centro)}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                          title="Editar Sede"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSedeAEliminar(centro)}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                          title="Eliminar Sede"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-foreground leading-snug">{centro.nombre}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span>{centro.direccion || 'Cruz del Eje, Córdoba'}</span>
                      </p>
                    </div>

                    {/* PIN DE MAPA & CREDENCIALES DE RECEPCIÓN */}
                    <div className="pt-3 border-t border-border/70 space-y-2 text-xs text-foreground/80 font-medium">
                      <div className="flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-sky-600 shrink-0" />
                          <span className="font-semibold text-foreground">Pin en el Mapa:</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          Lat {coords.lat.toFixed(4)}, Lng {coords.lng.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-foreground">Usuario Recepción:</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-primary truncate max-w-[220px]">
                          {cuenta.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Sede (Crear / Editar) */}
      {modalCentroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>{editandoCentro ? 'Editar Sede de Salud' : 'Registrar Nueva Sede'}</span>
              </h3>
              <button
                onClick={() => setModalCentroOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCentro} className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* 1. Nombre de la Sede */}
              <div>
                <label className="block font-bold mb-1 text-foreground">Nombre de la Sede *</label>
                <input
                  type="text"
                  required
                  value={centroForm.nombre}
                  onChange={(e) => handleCambiarNombre(e.target.value)}
                  placeholder="Ej. Clínica Santa María"
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* 2. Tipo de Establecimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-foreground">Tipo de Establecimiento *</label>
                  <select
                    value={centroForm.tipo}
                    onChange={(e) =>
                      setCentroForm({ ...centroForm, tipo: e.target.value as CentroSalud['tipo'] })
                    }
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-primary cursor-pointer focus:outline-none"
                  >
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINICA">Clínica</option>
                    <option value="CONSULTORIO_PRIVADO">Consultorio Privado</option>
                    <option value="DISPENSARIO">Dispensario</option>
                  </select>
                </div>

                {/* 3. Dirección Física */}
                <div>
                  <label className="block font-bold mb-1 text-foreground">Dirección Física *</label>
                  <input
                    type="text"
                    required
                    value={centroForm.direccion}
                    onChange={(e) => setCentroForm({ ...centroForm, direccion: e.target.value })}
                    placeholder="Calle y número, Cruz del Eje"
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. PIN PARA EL MAPA */}
              <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 space-y-3">
                <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold text-xs sm:text-sm">
                  <Navigation className="h-4 w-4" />
                  <span>Pin para Ubicación en el Mapa de Cruz del Eje</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground text-xs">Zona / Sector del Pin:</label>
                  <select
                    value={centroForm.zonaSeleccionada}
                    onChange={(e) => handleCambiarZona(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-2 text-xs font-medium focus:ring-2 focus:ring-primary cursor-pointer focus:outline-none"
                  >
                    {ZONAS_PIN_CDE.map((z) => (
                      <option key={z.nombre} value={z.nombre}>
                        {z.nombre}
                      </option>
                    ))}
                    <option value="Coordenadas manuales">Coordenadas personalizadas</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Latitud</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={centroForm.lat}
                      onChange={(e) => setCentroForm({ ...centroForm, lat: parseFloat(e.target.value) || -30.7285 })}
                      className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Longitud</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={centroForm.lng}
                      onChange={(e) => setCentroForm({ ...centroForm, lng: parseFloat(e.target.value) || -64.7990 })}
                      className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 5. DATOS DE ACCESO PARA RECEPCIÓN */}
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                  <KeyRound className="h-4 w-4" />
                  <span>Acceso de Recepción (para entrar a este centro)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Credenciales con las cuales el recepcionista podrá iniciar sesión en el sistema y gestionar los turnos de este centro médico.
                </p>

                <div>
                  <label className="block font-semibold mb-1 text-foreground text-xs">Usuario / Email de Recepción *</label>
                  <input
                    type="email"
                    required
                    value={centroForm.usuarioEmail}
                    onChange={(e) => setCentroForm({ ...centroForm, usuarioEmail: e.target.value })}
                    placeholder="recepcion.sede@esu.gob.ar"
                    className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground text-xs">Contraseña Inicial *</label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      required={!editandoCentro}
                      value={centroForm.usuarioPassword}
                      onChange={(e) => setCentroForm({ ...centroForm, usuarioPassword: e.target.value })}
                      placeholder={editandoCentro ? '•••••••• (dejar vacío si no se cambia)' : 'Ej. Recepcion2026!'}
                      className="w-full rounded-xl border border-input bg-background p-2 pr-9 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setModalCentroOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted cursor-pointer transition text-xs sm:text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50 transition text-xs sm:text-sm"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación Eliminar Sede */}
      {sedeAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Eliminar Sede Sanitaria
                </h3>
                <p className="text-xs text-muted-foreground">
                  {sedeAEliminar.nombre}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente esta sede médica del sistema? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setSedeAEliminar(null)}
                className="flex-1 rounded-xl border border-input py-2 text-xs font-semibold hover:bg-accent transition disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmarEliminarCentro}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Eliminando...' : 'Eliminar Sede'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
