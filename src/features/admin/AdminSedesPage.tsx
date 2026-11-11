import React, { useState, useEffect, useCallback } from 'react';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { CentroSalud } from '@/types';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  DoorOpen,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const AdminSedesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Centro (Crear / Editar)
  const [modalCentroOpen, setModalCentroOpen] = useState(false);
  const [editandoCentro, setEditandoCentro] = useState<CentroSalud | null>(null);
  const [centroForm, setCentroForm] = useState({
    nombre: '',
    tipo: 'CLINICA' as CentroSalud['tipo'],
    direccion: '',
    telefono: '',
    ciudad: 'Cruz del Eje',
    horarioAtencion: 'Lunes a Viernes 08:00 a 20:00',
    disponibleGuardia: false,
  });


  const [centroSeleccionadoId, setCentroSeleccionadoId] = useState<string>('TODOS');
  const [sedeAEliminar, setSedeAEliminar] = useState<CentroSalud | null>(null);
  const [consultorioAEliminar, setConsultorioAEliminar] = useState<ConsultorioItem | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cData, csData] = await Promise.all([
        centrosService.getAll(),
        centrosService.getConsultorios(),
      ]);
      setCentros(Array.isArray(cData) ? cData : []);
      setConsultorios(Array.isArray(csData) ? csData : []);
    } catch (err: unknown) {
      setLoadError(extractApiErrorMessage(err, 'No se pudieron cargar las sedes y consultorios del sistema.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleAbrirCrearCentro = () => {
    setEditandoCentro(null);
    setCentroForm({
      nombre: '',
      tipo: 'CLINICA',
      direccion: '',
      telefono: '',
      ciudad: 'Cruz del Eje',
      horarioAtencion: 'Lunes a Viernes 08:00 a 20:00',
      disponibleGuardia: false,
    });
    setModalCentroOpen(true);
  };

  const handleAbrirEditarCentro = (centro: CentroSalud) => {
    setEditandoCentro(centro);
    setCentroForm({
      nombre: centro.nombre,
      tipo: centro.tipo,
      direccion: centro.direccion,
      telefono: centro.telefono,
      ciudad: centro.ciudad,
      horarioAtencion: centro.horarioAtencion,
      disponibleGuardia: centro.disponibleGuardia,
    });
    setModalCentroOpen(true);
  };

  const handleGuardarCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editandoCentro) {
        await centrosService.updateCentro(editandoCentro.id, centroForm);
        success(`Sede "${centroForm.nombre}" actualizada con éxito.`);
      } else {
        await centrosService.createCentro(centroForm);
        success(`Sede "${centroForm.nombre}" creada con éxito.`);
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


  const handleConfirmarEliminarConsultorio = async () => {
    if (!consultorioAEliminar) return;
    setIsSaving(true);
    try {
      await centrosService.deleteConsultorio(consultorioAEliminar.id);
      success(`Consultorio "${consultorioAEliminar.numero}" dado de baja correctamente.`);
      setConsultorioAEliminar(null);
      cargarDatos();
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo dar de baja el consultorio.'));
    } finally {
      setIsSaving(false);
    }
  };

  const consultoriosFiltrados = consultorios.filter((cs) =>
    centroSeleccionadoId === 'TODOS' ? true : cs.centroSaludId === centroSeleccionadoId
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Gestión de Sedes, Centros y Consultorios Físicos
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Panel administrativo CRUD de infraestructura médica y asignación física de consultorios (HU-56).
          </p>
        </div>

        <button
          onClick={handleAbrirCrearCentro}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Sede Sanitaria</span>
        </button>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* SECCIÓN 1: Sedes y Centros de Salud */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Sedes Sanitarias Registradas ({centros.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex h-36 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : centros.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No se encontraron sedes sanitarias registradas en el sistema.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centros.map((centro) => {
              const cantConsultorios = consultorios.filter((c) => c.centroSaludId === centro.id).length;
              return (
                <div
                  key={centro.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {centro.tipo}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAbrirEditarCentro(centro)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                          title="Editar Sede"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSedeAEliminar(centro)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                          title="Eliminar Sede"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-foreground">{centro.nombre}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{centro.direccion}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {centro.telefono}
                        </span>
                        <span className="font-semibold text-foreground">{cantConsultorios} Consultorios</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <Clock className="h-3 w-3" /> {centro.horarioAtencion}
                      </div>
                    </div>
                  </div>

                  {centro.disponibleGuardia && (
                    <div className="mt-3 pt-2 border-t border-border/40 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Guardia 24 Horas Activa
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: Administración de Consultorios Físicos */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-primary" />
            <span>Consultorios Físicos ({consultoriosFiltrados.length})</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtrar por Sede:</span>
            <select
              value={centroSeleccionadoId}
              onChange={(e) => setCentroSeleccionadoId(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
            >
              <option value="TODOS">Todas las Sedes</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          {consultoriosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No hay consultorios registrados para la sede seleccionada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Sede / Establecimiento</th>
                    <th className="p-3">Consultorio / Box</th>
                    <th className="p-3">Ubicación / Planta</th>
                    <th className="p-3">Especialidad Destinada</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {consultoriosFiltrados.map((cs) => {
                    const centroPertenece = centros.find((c) => c.id === cs.centroSaludId);
                    return (
                      <tr key={cs.id} className="hover:bg-muted/30 transition">
                        <td className="p-3 font-semibold text-foreground">
                          {centroPertenece?.nombre || 'Sede No Identificada'}
                        </td>
                        <td className="p-3 font-mono font-bold text-primary">{cs.numero}</td>
                        <td className="p-3 text-muted-foreground">{cs.planta}</td>
                        <td className="p-3">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {cs.especialidadAsignada}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              cs.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {cs.activo ? 'Operativo' : 'Inactivo / Mantenimiento'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setConsultorioAEliminar(cs)}
                            className="p-1 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                            title="Eliminar consultorio"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Sede (Crear / Editar) */}
      {modalCentroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">
                {editandoCentro ? 'Editar Sede de Salud' : 'Registrar Nueva Sede'}
              </h3>
              <button
                onClick={() => setModalCentroOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarCentro} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nombre de la Sede *</label>
                <input
                  type="text"
                  required
                  value={centroForm.nombre}
                  onChange={(e) => setCentroForm({ ...centroForm, nombre: e.target.value })}
                  placeholder="Ej. Clínica Santa María"
                  className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tipo de Establecimiento</label>
                  <select
                    value={centroForm.tipo}
                    onChange={(e) =>
                      setCentroForm({ ...centroForm, tipo: e.target.value as CentroSalud['tipo'] })
                    }
                    className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINICA">Clínica</option>
                    <option value="CONSULTORIO_PRIVADO">Consultorio Privado</option>
                    <option value="DISPENSARIO">Dispensario</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={centroForm.telefono}
                    onChange={(e) => setCentroForm({ ...centroForm, telefono: e.target.value })}
                    placeholder="03549-..."
                    className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Dirección Física *</label>
                <input
                  type="text"
                  required
                  value={centroForm.direccion}
                  onChange={(e) => setCentroForm({ ...centroForm, direccion: e.target.value })}
                  placeholder="Calle y número, Cruz del Eje"
                  className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Horario de Atención</label>
                <input
                  type="text"
                  value={centroForm.horarioAtencion}
                  onChange={(e) => setCentroForm({ ...centroForm, horarioAtencion: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="disponibleGuardia"
                  checked={centroForm.disponibleGuardia}
                  onChange={(e) => setCentroForm({ ...centroForm, disponibleGuardia: e.target.checked })}
                  className="h-4 w-4 rounded cursor-pointer"
                />
                <label htmlFor="disponibleGuardia" className="cursor-pointer select-none">
                  Dispone de servicio de guardia médica activa 24h
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setModalCentroOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
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

      {/* Modal Confirmación Eliminar Consultorio */}
      {consultorioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Dar de Baja Consultorio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Box / Consultorio: {consultorioAEliminar.numero} ({consultorioAEliminar.planta})
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              ¿Estás seguro de que deseas eliminar este consultorio físico?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setConsultorioAEliminar(null)}
                className="flex-1 rounded-xl border border-input py-2 text-xs font-semibold hover:bg-accent transition disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmarEliminarConsultorio}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Eliminando...' : 'Eliminar Consultorio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
