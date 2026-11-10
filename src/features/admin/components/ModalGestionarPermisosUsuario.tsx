import React, { useState, useEffect } from 'react';
import type { User, Permiso, PermissionCode, CentroSalud, BackendUserRole } from '@/types';
import { PermisosMatrixSelector, DEFAULT_PERMISSIONS_BY_ROLE } from './PermisosMatrixSelector';
import { permisosService } from '@/api/permisosService';
import { usuariosService } from '@/api/usuariosService';
import { Shield, X, Save, AlertCircle, RefreshCw } from 'lucide-react';

export interface ModalGestionarPermisosUsuarioProps {
  usuario: User | null;
  isOpen: boolean;
  onClose: () => void;
  onGuardado: (usuarioActualizado: User) => void;
  catalogoPermisos: Permiso[];
  centros: CentroSalud[];
}

const ROLES_DISPONIBLES: { value: BackendUserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador General' },
  { value: 'RECEPCIONISTA', label: 'Personal de Recepción' },
  { value: 'PROFESIONAL', label: 'Profesional Médico' },
  { value: 'PACIENTE', label: 'Paciente / Asistencial' },
];

export const ModalGestionarPermisosUsuario: React.FC<ModalGestionarPermisosUsuarioProps> = ({
  usuario,
  isOpen,
  onClose,
  onGuardado,
  catalogoPermisos,
  centros,
}) => {
  const [rol, setRol] = useState<BackendUserRole>('RECEPCIONISTA');
  const [centroSaludId, setCentroSaludId] = useState<string>('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<PermissionCode[]>([]);
  const [isLoadingPermisos, setIsLoadingPermisos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializar estado cuando cambia el usuario
  useEffect(() => {
    if (!usuario) return;

    // Normalizar rol
    const r = (usuario.rol || 'RECEPCIONISTA').toUpperCase();
    const matchedRol: BackendUserRole =
      r === 'ADMIN' || r === 'ROLE_ADMIN'
        ? 'ADMIN'
        : r === 'MEDICO' || r === 'PROFESIONAL' || r === 'ROLE_MEDICO' || r === 'ROLE_PROFESIONAL'
        ? 'PROFESIONAL'
        : r === 'PACIENTE' || r === 'ROLE_PACIENTE' || r === 'ROLE_USUARIO'
        ? 'PACIENTE'
        : 'RECEPCIONISTA';

    setRol(matchedRol);
    setCentroSaludId(usuario.centroSaludId ? String(usuario.centroSaludId) : '');
    setErrorMsg(null);

    // Cargar permisos actuales del usuario desde API
    setIsLoadingPermisos(true);
    permisosService
      .getByUsuario(usuario.id)
      .then((codigos) => {
        if (codigos && codigos.length > 0) {
          setPermisosSeleccionados(codigos);
        } else {
          // Si no tiene permisos persistidos, inicializar con los recomendados de su rol
          const fallback =
            DEFAULT_PERMISSIONS_BY_ROLE[matchedRol] ??
            (matchedRol === 'PROFESIONAL' ? DEFAULT_PERMISSIONS_BY_ROLE['MEDICO'] : []) ??
            [];
          setPermisosSeleccionados(fallback);
        }
      })
      .catch(() => {
        // Fallback a los recomendados
        const fallback =
          DEFAULT_PERMISSIONS_BY_ROLE[matchedRol] ??
          (matchedRol === 'PROFESIONAL' ? DEFAULT_PERMISSIONS_BY_ROLE['MEDICO'] : []) ??
          [];
        setPermisosSeleccionados(fallback);
      })
      .finally(() => {
        setIsLoadingPermisos(false);
      });
  }, [usuario]);

  // Manejo de scroll lock y tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !usuario) return null;

  const handleRolChange = (nuevoRol: BackendUserRole) => {
    setRol(nuevoRol);
    const recomendados =
      DEFAULT_PERMISSIONS_BY_ROLE[nuevoRol] ??
      (nuevoRol === 'PROFESIONAL' ? DEFAULT_PERMISSIONS_BY_ROLE['MEDICO'] : []) ??
      [];
    setPermisosSeleccionados(recomendados);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      // 1. Determinar datos de centro
      const centroMatched = centros.find((c) => String(c.id) === String(centroSaludId));
      const centroIdNum = centroSaludId ? Number(centroSaludId) : null;
      const centroNombre = centroMatched?.nombre ?? null;

      // 2. Actualizar rol y sede si cambiaron
      if (rol !== usuario.rol || centroSaludId !== (usuario.centroSaludId ?? '')) {
        await usuariosService.actualizarAsignacion(usuario.id, {
          rol,
          centroSaludId: centroIdNum,
          centroSaludNombre: centroNombre,
        });
      }

      // 3. Actualizar permisos granulares via API
      await permisosService.updateUsuarioPermisos(usuario.id, permisosSeleccionados);

      // 4. Objeto actualizado para sincronizar en cliente
      const usuarioActualizado: User = {
        ...usuario,
        rol,
        centroSaludId: centroSaludId || undefined,
        centroSaludNombre: centroNombre ?? undefined,
        permisos: permisosSeleccionados,
      };

      onGuardado(usuarioActualizado);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios de rol y permisos.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-permisos-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 id="modal-permisos-title" className="text-base font-bold text-foreground">
                Asignación de Rol y Permisos Granulares
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Usuario: <span className="font-semibold text-foreground font-mono">{usuario.email}</span>
                {usuario.nombre && ` (${usuario.nombre} ${usuario.apellido ?? ''})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer disabled:opacity-50"
            title="Cerrar ventana"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <form onSubmit={handleGuardar} className="flex-1 overflow-y-auto p-5 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Configuración de Rol y Sede */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Perfil Base Institucional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Rol Base del Usuario</label>
                <select
                  value={rol}
                  onChange={(e) => handleRolChange(e.target.value as BackendUserRole)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {ROLES_DISPONIBLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Al cambiar de rol se actualizan los permisos por defecto sugeridos.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Centro de Salud Vinculado</label>
                <select
                  value={centroSaludId}
                  onChange={(e) => setCentroSaludId(e.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">Sin sede asignada / Global</option>
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.tipo})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Define el aislamiento de sede para personal de recepción y médicos.
                </p>
              </div>
            </div>
          </div>

          {/* Catálogo de Permisos PBAC */}
          <div className="space-y-2">
            {isLoadingPermisos ? (
              <div className="flex h-36 items-center justify-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span>Cargando permisos actuales del usuario...</span>
              </div>
            ) : catalogoPermisos.length > 0 ? (
              <PermisosMatrixSelector
                catalogo={catalogoPermisos}
                selectedPermisos={permisosSeleccionados}
                onChange={setPermisosSeleccionados}
                rolBase={rol === 'PROFESIONAL' ? 'MEDICO' : rol}
                disabled={isSaving}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No hay catálogo de permisos disponible en este momento.
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Guardar Rol y Permisos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
