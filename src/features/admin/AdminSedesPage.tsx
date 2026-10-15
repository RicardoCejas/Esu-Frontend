import React, { useState, useEffect } from 'react';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
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
  X
} from 'lucide-react';

export const AdminSedesPage: React.FC = () => {
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Modal Consultorio
  const [modalConsultorioOpen, setModalConsultorioOpen] = useState(false);
  const [consultorioForm, setConsultorioForm] = useState({
    centroSaludId: '',
    numero: '',
    planta: 'Planta Baja',
    especialidadAsignada: 'Clínica Médica / Medicina General',
    activo: true,
  });

  const [centroSeleccionadoId, setCentroSeleccionadoId] = useState<string>('TODOS');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [cData, csData] = await Promise.all([
      centrosService.getAll(),
      centrosService.getConsultorios(),
    ]);
    setCentros(cData);
    setConsultorios(csData);
    setLoading(false);
  };

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
    if (editandoCentro) {
      await centrosService.updateCentro(editandoCentro.id, centroForm);
    } else {
      await centrosService.createCentro(centroForm);
    }
    setModalCentroOpen(false);
    cargarDatos();
  };

  const handleEliminarCentro = async (id: string) => {
    if (window.confirm('¿Desea eliminar esta sede del sistema?')) {
      await centrosService.deleteCentro(id);
      cargarDatos();
    }
  };

  const handleGuardarConsultorio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultorioForm.centroSaludId) return;

    await centrosService.createConsultorio(consultorioForm);
    setModalConsultorioOpen(false);
    cargarDatos();
  };

  const handleEliminarConsultorio = async (id: string) => {
    if (window.confirm('¿Desea dar de baja este consultorio físico?')) {
      await centrosService.deleteConsultorio(id);
      cargarDatos();
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestión de Sedes, Centros y Consultorios Físicos
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Panel administrativo CRUD de infraestructura médica y asignación física de consultorios (HU-56).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setConsultorioForm({
                centroSaludId: centros[0]?.id || '',
                numero: '',
                planta: 'Planta Baja',
                especialidadAsignada: 'Clínica Médica / Medicina General',
                activo: true,
              });
              setModalConsultorioOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition shadow-xs"
          >
            <DoorOpen className="h-4 w-4 text-primary" />
            <span>Nuevo Consultorio</span>
          </button>

          <button
            onClick={handleAbrirCrearCentro}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 px-3.5 py-2 text-xs font-semibold text-primary-foreground transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Sede / Centro</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: Listado de Sedes y Centros de Salud */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span>Sedes y Centros de Salud</span>
        </h2>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centros.map((centro) => {
              const cantConsultorios = consultorios.filter((c) => c.centroSaludId === centro.id).length;
              return (
                <div
                  key={centro.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {centro.tipo}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAbrirEditarCentro(centro)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                          title="Editar Sede"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEliminarCentro(centro.id)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
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
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
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
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Consultorio N°</th>
                <th className="p-3.5">Sede Médica</th>
                <th className="p-3.5">Planta / Piso</th>
                <th className="p-3.5">Especialidad Asignada</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {consultoriosFiltrados.map((cs) => {
                const sede = centros.find((c) => c.id === cs.centroSaludId);
                return (
                  <tr key={cs.id} className="hover:bg-muted/30 transition">
                    <td className="p-3.5 font-bold font-mono text-sm text-foreground">
                      Consultorio {cs.numero}
                    </td>
                    <td className="p-3.5 font-medium text-foreground">
                      {sede?.nombre || 'Sede no encontrada'}
                    </td>
                    <td className="p-3.5 text-muted-foreground">{cs.planta}</td>
                    <td className="p-3.5 font-semibold text-primary">
                      {cs.especialidadAsignada || 'Uso Polivalente'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="rounded-full bg-emerald-500/15 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-500/30">
                        Habilitado
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleEliminarConsultorio(cs.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
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
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
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
                    className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                  >
                    <option value="HOSPITAL">HOSPITAL</option>
                    <option value="CLINICA">CLINICA</option>
                    <option value="DISPENSARIO">DISPENSARIO</option>
                    <option value="CONSULTORIO_PRIVADO">CONSULTORIO PRIVADO</option>
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
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="disponibleGuardia" className="cursor-pointer">
                  Dispone de servicio de guardia médica activa 24h
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setModalCentroOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Guardar Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Consultorio */}
      {modalConsultorioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">Asignar Nuevo Consultorio Físico</h3>
              <button
                onClick={() => setModalConsultorioOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarConsultorio} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Sede / Centro *</label>
                <select
                  required
                  value={consultorioForm.centroSaludId}
                  onChange={(e) => setConsultorioForm({ ...consultorioForm, centroSaludId: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                >
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Número o Código *</label>
                  <input
                    type="text"
                    required
                    value={consultorioForm.numero}
                    onChange={(e) => setConsultorioForm({ ...consultorioForm, numero: e.target.value })}
                    placeholder="Ej. 104 o Box A"
                    className="w-full rounded-xl border border-input bg-background p-2 font-mono focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Planta / Piso</label>
                  <select
                    value={consultorioForm.planta}
                    onChange={(e) => setConsultorioForm({ ...consultorioForm, planta: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                  >
                    <option value="Planta Baja">Planta Baja</option>
                    <option value="1° Piso">1° Piso</option>
                    <option value="2° Piso">2° Piso</option>
                    <option value="Planta Única">Planta Única</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Especialidad Principal Asignada</label>
                <input
                  type="text"
                  value={consultorioForm.especialidadAsignada}
                  onChange={(e) =>
                    setConsultorioForm({ ...consultorioForm, especialidadAsignada: e.target.value })
                  }
                  placeholder="Ej. Cardiología, Pediatría..."
                  className="w-full rounded-xl border border-input bg-background p-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setModalConsultorioOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Registrar Consultorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
