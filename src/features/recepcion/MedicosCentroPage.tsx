import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { profesionalesService } from '@/api/profesionalesService';
import { MOCK_PROFESIONALES } from '@/api/mockData';
import type { Profesional, Especialidad } from '@/types';
import {
  Stethoscope,
  PlusCircle,
  Building2,
  Calendar,
  Clock,
  Search,
  BadgeCheck,
  UserCheck,
  Edit2,
  Trash2,
  X,
  Save,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const MedicosCentroPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Modal de edición / ficha
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Profesional | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Campos de edición
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editMatricula, setEditMatricula] = useState('');
  const [editEspId, setEditEspId] = useState('');
  const [editDias, setEditDias] = useState<string[]>([]);
  const [editDuracion, setEditDuracion] = useState(20);

  const centroId = user?.centroSaludId || 'c1';
  const centroNombre = user?.centroSaludNombre || 'Hospital Regional Aurelio Crespo';

  const DIAS_DISPONIBLES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const cargarDatos = async () => {
    setLoading(true);
    const [profs, esps] = await Promise.all([
      profesionalesService.getAll(),
      profesionalesService.getEspecialidades(),
    ]);

    const filtrados = profs.filter((p) =>
      p.centrosSaludIds ? p.centrosSaludIds.includes(centroId) : true
    );

    setProfesionales(filtrados.length > 0 ? filtrados : MOCK_PROFESIONALES);
    setEspecialidades(esps);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [centroId]);

  const handleAbrirFicha = (med: Profesional) => {
    setMedicoSeleccionado(med);
    setEditNombre(med.nombre);
    setEditApellido(med.apellido);
    setEditMatricula(med.matricula);
    setEditEspId(med.especialidadId);
    setEditDias(med.diasAtencion || ['Lunes', 'Miércoles', 'Viernes']);
    setEditDuracion(med.duracionTurnoMin || 20);
    setModoEdicion(false);
  };

  const handleToggleDia = (dia: string) => {
    setEditDias((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicoSeleccionado || !editNombre.trim() || !editApellido.trim() || !editMatricula.trim()) {
      return;
    }

    try {
      const espSeleccionada = especialidades.find((e) => e.id === editEspId);
      const espNombre = espSeleccionada ? espSeleccionada.nombre : medicoSeleccionado.especialidadNombre;

      const updated = await profesionalesService.updateProfesional(medicoSeleccionado.id, {
        nombre: editNombre.trim(),
        apellido: editApellido.trim(),
        matricula: editMatricula.trim(),
        especialidadId: editEspId,
        especialidadNombre: espNombre,
        diasAtencion: editDias,
        duracionTurnoMin: Number(editDuracion),
      });

      setProfesionales((prev) =>
        prev.map((p) => (p.id === medicoSeleccionado.id ? { ...p, ...updated } : p))
      );
      setMedicoSeleccionado({ ...medicoSeleccionado, ...updated });
      setModoEdicion(false);
      success(`Datos del Dr. ${editNombre} ${editApellido} actualizados`);
    } catch {
      toastError('Error al actualizar datos del profesional');
    }
  };

  const handleDesvincularMedico = async (med: Profesional) => {
    if (!window.confirm(`¿Confirmás desvincular al Dr. ${med.nombre} ${med.apellido} del centro ${centroNombre}?`)) {
      return;
    }

    try {
      await profesionalesService.desvincularCentro(med.id, centroId);
      setProfesionales((prev) => prev.filter((p) => p.id !== med.id));
      setMedicoSeleccionado(null);
      success(`Dr. ${med.nombre} ${med.apellido} desvinculado del centro`);
    } catch {
      toastError('Error al desvincular al médico');
    }
  };

  const medicosFiltrados = profesionales.filter((p) => {
    const texto = `${p.nombre} ${p.apellido} ${p.especialidadNombre} ${p.matricula}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span>Plantel Médico y Cuentas del Centro</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gestión de profesionales adscriptos, horarios de atención, matrículas y matrículas de <strong>{centroNombre}</strong>.
          </p>
        </div>

        <Link
          to="/dashboard/recepcion/medicos/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Agregar Médico / Crear Cuenta</span>
        </Link>
      </div>

      {/* Banner de Sede Activa */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-xs text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-2xs">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sky-950 text-sm">Institución Activa: {centroNombre}</span>
            <p className="text-sky-800 text-xs mt-0.5">
              Tocá la ficha de cualquier médico para consultar su agenda, modificar sus horarios o editar su cuenta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-white px-3 py-1.5 rounded-xl border border-sky-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">
            {profesionales.length} Médicos Habilitados
          </span>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar profesional por nombre, especialidad o matrícula MP..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grilla de Médicos (Clickable para entrar y editar) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="h-48 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-48 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-48 rounded-2xl bg-muted/40 animate-pulse" />
        </div>
      ) : medicosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3">
          <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-bold text-sm text-foreground">No se encontraron profesionales</h3>
          <p className="text-xs text-muted-foreground">
            Podés dar de alta un nuevo médico para incorporarlo a este centro de salud.
          </p>
          <Link
            to="/dashboard/recepcion/medicos/nuevo"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Agregar Médico Ahora</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicosFiltrados.map((med) => (
            <div
              key={med.id}
              onClick={() => handleAbrirFicha(med)}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/60 hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                      {med.nombre.charAt(0)}{med.apellido.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground font-heading group-hover:text-primary transition-colors">
                        Dr. {med.nombre} {med.apellido}
                      </h3>
                      <p className="text-xs font-bold text-sky-700">
                        {med.especialidadNombre || 'Medicina General'}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                    <UserCheck className="h-3 w-3" /> Activo
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <p className="flex items-center gap-2">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Matrícula: <strong className="text-foreground font-mono">{med.matricula}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Atención: {med.diasAtencion?.join(', ') || 'Lunes a Viernes'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Consulta: {med.duracionTurnoMin || 20} min</span>
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-border/60 text-xs flex items-center justify-between text-primary font-bold">
                <span>Gestionar Perfil y Horarios</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Ficha de Médico y Edición */}
      {medicoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 font-bold text-base">
                  {medicoSeleccionado.nombre.charAt(0)}{medicoSeleccionado.apellido.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground font-heading">
                    Dr. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {medicoSeleccionado.especialidadNombre} • MP {medicoSeleccionado.matricula}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMedicoSeleccionado(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alternar Vista y Edición */}
            {modoEdicion ? (
              <form onSubmit={handleGuardarCambios} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Apellido *</label>
                    <input
                      type="text"
                      required
                      value={editApellido}
                      onChange={(e) => setEditApellido(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Matrícula (MP) *</label>
                    <input
                      type="text"
                      required
                      value={editMatricula}
                      onChange={(e) => setEditMatricula(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Especialidad</label>
                    <select
                      value={editEspId}
                      onChange={(e) => setEditEspId(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {especialidades.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Días de Atención en el Centro</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIAS_DISPONIBLES.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => handleToggleDia(d)}
                        className={`rounded-xl border py-1.5 px-2 text-xs font-bold transition cursor-pointer text-center ${
                          editDias.includes(d)
                            ? 'border-sky-500 bg-sky-50 text-sky-800'
                            : 'border-border bg-card text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Duración Estimada por Consulta</label>
                  <select
                    value={editDuracion}
                    onChange={(e) => setEditDuracion(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={20}>20 minutos (estándar)</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                  </select>
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
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950">Centro Adscripto:</span>
                    <span className="font-semibold text-sky-800">{centroNombre}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950">Días de Atención:</span>
                    <span className="text-slate-700">{medicoSeleccionado.diasAtencion?.join(', ') || 'Lunes a Viernes'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950">Intervalo de Turno:</span>
                    <span className="text-slate-700">{medicoSeleccionado.duracionTurnoMin || 20} minutos</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModoEdicion(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-accent transition cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4 text-sky-600" />
                    <span>Editar Datos y Horarios</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDesvincularMedico(medicoSeleccionado)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Desvincular del Centro</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
