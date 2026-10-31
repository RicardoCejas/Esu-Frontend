import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profesionalesService } from '@/api/profesionalesService';
import { MOCK_ESPECIALIDADES } from '@/api/mockData';
import type { Especialidad, Profesional } from '@/types';
import {
  Layers,
  PlusCircle,
  Building2,
  Search,
  CheckCircle2,
  X,
  Save,
  Stethoscope,
  Trash2,
  Edit2,
  Users,
  ChevronRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const EspecialidadesCentroPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Estados de modales
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<Especialidad | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Formulario de nueva especialidad
  const [nombreNueva, setNombreNueva] = useState('');
  const [descNueva, setDescNueva] = useState('');

  // Formulario de edición
  const [editNombre, setEditNombre] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [medicoAVincular, setMedicoAVincular] = useState('');

  const centroId = user?.centroSaludId || 'c1';
  const centroNombre = user?.centroSaludNombre || 'Hospital Regional Aurelio Crespo';

  const cargarDatos = async () => {
    const [esps, profs] = await Promise.all([
      profesionalesService.getEspecialidades(),
      profesionalesService.getAll(),
    ]);
    setEspecialidades(esps.length > 0 ? esps : MOCK_ESPECIALIDADES);
    setProfesionales(profs);
  };

  useEffect(() => {
    cargarDatos();
  }, [centroId]);

  // Médicos del centro asignados a una especialidad
  const getMedicosPorEspecialidad = (espId: string, espNombre: string) => {
    return profesionales.filter(
      (p) =>
        (p.centrosSaludIds ? p.centrosSaludIds.includes(centroId) : true) &&
        (p.especialidadId === espId || p.especialidadNombre.toLowerCase() === espNombre.toLowerCase())
    );
  };

  // Crear nueva especialidad
  const handleCrearEspecialidad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNueva.trim()) return;

    try {
      const nueva = await profesionalesService.createEspecialidad({
        nombre: nombreNueva.trim(),
        descripcion: descNueva.trim() || 'Atención médica especializada en Cruz del Eje.',
      });
      setEspecialidades((prev) => [nueva, ...prev]);
      success(`Especialidad "${nueva.nombre}" habilitada con éxito en ${centroNombre}`);
      setNombreNueva('');
      setDescNueva('');
      setModalNuevaOpen(false);
    } catch {
      toastError('Error al crear la especialidad');
    }
  };

  // Abrir detalle de especialidad
  const handleAbrirDetalle = (esp: Especialidad) => {
    setEspecialidadSeleccionada(esp);
    setEditNombre(esp.nombre);
    setEditDesc(esp.descripcion || '');
    setModoEdicion(false);
    setMedicoAVincular('');
  };

  // Guardar edición de especialidad
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!especialidadSeleccionada || !editNombre.trim()) return;

    try {
      const updated = await profesionalesService.updateEspecialidad(especialidadSeleccionada.id, {
        nombre: editNombre.trim(),
        descripcion: editDesc.trim(),
      });
      setEspecialidades((prev) =>
        prev.map((esp) => (esp.id === especialidadSeleccionada.id ? { ...esp, ...updated } : esp))
      );
      setEspecialidadSeleccionada({ ...especialidadSeleccionada, ...updated });
      setModoEdicion(false);
      success(`Especialidad "${editNombre}" actualizada`);
    } catch {
      toastError('No se pudo actualizar la especialidad');
    }
  };

  // Quitar especialidad del centro
  const handleEliminarEspecialidad = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Confirmás quitar la especialidad "${nombre}" del centro ${centroNombre}?`)) {
      return;
    }

    try {
      await profesionalesService.deleteEspecialidad(id);
      setEspecialidades((prev) => prev.filter((esp) => esp.id !== id));
      setEspecialidadSeleccionada(null);
      success(`Especialidad "${nombre}" eliminada del catálogo del centro`);
    } catch {
      toastError('Error al eliminar la especialidad');
    }
  };

  // Vincular médico a la especialidad
  const handleVincularMedico = async () => {
    if (!medicoAVincular || !especialidadSeleccionada) return;

    const prof = profesionales.find((p) => p.id === medicoAVincular);
    if (!prof) return;

    const centrosActuales = prof.centrosSaludIds || [];
    const nuevosCentros = centrosActuales.includes(centroId) ? centrosActuales : [...centrosActuales, centroId];

    await profesionalesService.updateProfesional(prof.id, {
      especialidadId: especialidadSeleccionada.id,
      especialidadNombre: especialidadSeleccionada.nombre,
      centrosSaludIds: nuevosCentros,
    });

    await cargarDatos();
    setMedicoAVincular('');
    success(`Dr. ${prof.nombre} ${prof.apellido} vinculado a ${especialidadSeleccionada.nombre}`);
  };

  // Desvincular médico de la especialidad en este centro
  const handleDesvincularMedico = async (profId: string, profNombre: string) => {
    if (!window.confirm(`¿Desvincular a ${profNombre} de esta especialidad en este centro?`)) return;

    await profesionalesService.desvincularCentro(profId, centroId);
    await cargarDatos();
    success(`${profNombre} desvinculado de este servicio`);
  };

  const filtradas = especialidades.filter(
    (esp) =>
      esp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (esp.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
            <Layers className="h-6 w-6 text-primary" />
            <span>Especialidades Médicas del Centro</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Control integral de especialidades, médicos asignados y habilitación de turnos en <strong>{centroNombre}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNuevaOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Agregar Especialidad al Centro</span>
        </button>
      </div>

      {/* Banner de Control Institucional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-xs text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-2xs">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sky-950 text-sm">Institución Activa: {centroNombre}</span>
            <p className="text-sky-800 text-xs mt-0.5">
              Hacé clic en cualquier especialidad para ver y gestionar su plantel de médicos, modificar alcances o pausar la atención.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-white px-3 py-1.5 rounded-xl border border-sky-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">
            {especialidades.length} Servicios Activos
          </span>
        </div>
      </div>

      {/* Buscador */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar especialidad por nombre, descripción o servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grilla de Especialidades (Clickables para entrar y gestionar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtradas.map((esp) => {
          const medicosEsp = getMedicosPorEspecialidad(esp.id, esp.nombre);
          return (
            <div
              key={esp.id}
              onClick={() => handleAbrirDetalle(esp)}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/60 hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                    <CheckCircle2 className="h-3 w-3" /> Habilitada
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground font-heading group-hover:text-primary transition-colors">
                    {esp.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {esp.descripcion || 'Atención médica y consulta clínica especializada en Cruz del Eje.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users className="h-3.5 w-3.5 text-sky-600" />
                  <span>
                    {medicosEsp.length > 0
                      ? `${medicosEsp.length} médico${medicosEsp.length > 1 ? 's' : ''} asignado${medicosEsp.length > 1 ? 's' : ''}`
                      : 'Sin médicos asignados'}
                  </span>
                </div>
                <span className="text-primary font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Gestionar</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Detalle, Control de Médicos y Edición de Especialidad */}
      {especialidadSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 font-bold">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground font-heading">
                    {especialidadSeleccionada.nombre}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Sede: {centroNombre} • Control de Especialidad
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEspecialidadSeleccionada(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alternar Modo Edición o Modo Vista */}
            {modoEdicion ? (
              <form onSubmit={handleGuardarEdicion} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Nombre de la Especialidad *</label>
                  <input
                    type="text"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Descripción del Servicio</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setModoEdicion(false)}
                    className="flex-1 rounded-xl border border-input py-2.5 text-xs sm:text-sm font-semibold hover:bg-accent transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {/* Descripción */}
                <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs sm:text-sm text-foreground space-y-1">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">
                    Alcance Asistencial
                  </span>
                  <p className="leading-relaxed">
                    {especialidadSeleccionada.descripcion || 'Atención ambulatoria y consultas especializadas.'}
                  </p>
                </div>

                {/* Plantel Médico Asignado */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Médicos Adscriptos a esta Especialidad</span>
                    </h3>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {getMedicosPorEspecialidad(especialidadSeleccionada.id, especialidadSeleccionada.nombre).length} profesionales
                    </span>
                  </div>

                  {/* Listado de Médicos */}
                  <div className="space-y-2">
                    {getMedicosPorEspecialidad(especialidadSeleccionada.id, especialidadSeleccionada.nombre).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        No hay profesionales vinculados aún a esta especialidad en este centro.
                      </div>
                    ) : (
                      getMedicosPorEspecialidad(especialidadSeleccionada.id, especialidadSeleccionada.nombre).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs sm:text-sm shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-bold text-xs">
                              {m.nombre.charAt(0)}{m.apellido.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-foreground">
                                Dr. {m.nombre} {m.apellido}
                              </span>
                              <p className="text-[11px] text-muted-foreground">
                                MP: <strong className="font-mono">{m.matricula}</strong> • {m.diasAtencion?.join(', ') || 'Lun a Vie'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDesvincularMedico(m.id, `Dr. ${m.nombre} ${m.apellido}`)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                            title="Quitar de esta especialidad en este centro"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Quitar</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Vincular Nuevo Médico del Plantel */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <select
                      value={medicoAVincular}
                      onChange={(e) => setMedicoAVincular(e.target.value)}
                      className="w-full sm:flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleccionar médico del plantel para asignar...</option>
                      {profesionales.map((p) => (
                        <option key={p.id} value={p.id}>
                          Dr. {p.nombre} {p.apellido} (MP {p.matricula})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!medicoAVincular}
                      onClick={handleVincularMedico}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Vincular Médico</span>
                    </button>
                  </div>
                </div>

                {/* Acciones Maestras: Editar y Quitar Especialidad */}
                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setModoEdicion(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-accent transition cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4 text-sky-600" />
                    <span>Editar Nombre / Descripción</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleEliminarEspecialidad(
                        especialidadSeleccionada.id,
                        especialidadSeleccionada.nombre
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Quitar Especialidad del Centro</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Agregar Nueva Especialidad al Centro */}
      {modalNuevaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground font-heading">
                    Agregar Especialidad Médica
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Para habilitar turnos en {centroNombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevaOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearEspecialidad} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Nombre de la Especialidad *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Oftalmología, Reumatología, Urología"
                  value={nombreNueva}
                  onChange={(e) => setNombreNueva(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Descripción y Alcance</label>
                <textarea
                  rows={3}
                  placeholder="Consultas, estudios diagnósticos o procedimientos que se atienden..."
                  value={descNueva}
                  onChange={(e) => setDescNueva(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaOpen(false)}
                  className="flex-1 rounded-xl border border-input py-2.5 text-xs sm:text-sm font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>Habilitar Especialidad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
