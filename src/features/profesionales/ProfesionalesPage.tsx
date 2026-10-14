import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { StaffMedicosSection } from '@/features/home/StaffMedicosSection';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import type { CentroSalud, Especialidad, Profesional } from '@/types';
import { Building2, MapPin, Phone, Clock, HeartPulse, X, Calendar, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfesionalesPage: React.FC = () => {
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [centroDetalle, setCentroDetalle] = useState<CentroSalud | null>(null);

  // HU-14: Modal para Alta de Profesional Médico
  const [modalNuevoProfesional, setModalNuevoProfesional] = useState(false);
  const [nuevoDoctor, setNuevoDoctor] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    especialidadId: '',
    centroSaludId: '',
    diasAtencion: ['Lunes', 'Miércoles', 'Viernes'],
    duracionTurnoMin: 20,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [c, e, p] = await Promise.all([
        centrosService.getAll(),
        profesionalesService.getEspecialidades(),
        profesionalesService.getAll(),
      ]);
      setCentros(c);
      setEspecialidades(e);
      setProfesionales(p);
      if (e.length > 0) setNuevoDoctor((prev) => ({ ...prev, especialidadId: e[0].id }));
      if (c.length > 0) setNuevoDoctor((prev) => ({ ...prev, centroSaludId: c[0].id }));
    };
    fetchData();
  }, []);

  const handleCrearProfesional = async (e: React.FormEvent) => {
    e.preventDefault();
    const espSeleccionada = especialidades.find((esp) => esp.id === nuevoDoctor.especialidadId);
    const espNombre = espSeleccionada ? espSeleccionada.nombre : 'Medicina General';

    const doctorCreado = await profesionalesService.createProfesional({
      nombre: nuevoDoctor.nombre.trim(),
      apellido: nuevoDoctor.apellido.trim(),
      matricula: nuevoDoctor.matricula.trim(),
      especialidadId: nuevoDoctor.especialidadId,
      especialidadNombre: espNombre,
      centrosSaludIds: [nuevoDoctor.centroSaludId || 'c1'],
      diasAtencion: nuevoDoctor.diasAtencion,
      duracionTurnoMin: Number(nuevoDoctor.duracionTurnoMin) || 20,
    });

    setProfesionales([doctorCreado, ...profesionales]);
    setModalNuevoProfesional(false);
    setNuevoDoctor({
      nombre: '',
      apellido: '',
      matricula: '',
      especialidadId: especialidades[0]?.id || '',
      centroSaludId: centros[0]?.id || '',
      diasAtencion: ['Lunes', 'Miércoles', 'Viernes'],
      duracionTurnoMin: 20,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-teal-500 selection:text-white">
      <PublicNavbar />

      {/* Barra superior de acción rápida para administración asistencial */}
      <div className="border-b border-border bg-muted/40 py-2.5 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            Cuerpo Médico Oficial • Cruz del Eje, Córdoba
          </span>

          {/* HU-14: Disparador del Alta de Profesional */}
          <button
            type="button"
            onClick={() => setModalNuevoProfesional(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Registrar Profesional Médico</span>
          </button>
        </div>
      </div>

      <main className="flex-1">
        <StaffMedicosSection
          profesionales={profesionales}
          centros={centros}
          especialidades={especialidades}
          onSelectCentro={(centro) => setCentroDetalle(centro)}
        />
      </main>

      {/* Modal HU-14: Formulario de Alta de Profesional */}
      {modalNuevoProfesional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-600" />
                <h3 className="font-bold text-base text-foreground font-heading">
                  Alta de Profesional Médico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevoProfesional(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearProfesional} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nuevoDoctor.nombre}
                    onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, nombre: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    placeholder="Ej: Marcos"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Apellido</label>
                  <input
                    type="text"
                    required
                    value={nuevoDoctor.apellido}
                    onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, apellido: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    placeholder="Ej: Toledo"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Matrícula Provincial (MP)</label>
                <input
                  type="text"
                  required
                  value={nuevoDoctor.matricula}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, matricula: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
                  placeholder="Ej: MP-39420"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Especialidad Médica</label>
                <select
                  value={nuevoDoctor.especialidadId}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, especialidadId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                >
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Centro de Atención Principal</label>
                <select
                  value={nuevoDoctor.centroSaludId}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, centroSaludId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                >
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Duración del Turno (minutos)</label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  step="5"
                  value={nuevoDoctor.duracionTurnoMin}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, duracionTurnoMin: Number(e.target.value) })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNuevoProfesional(false)}
                  className="flex-1 rounded-xl border border-input py-2.5 font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 font-semibold text-white hover:bg-teal-700 transition shadow-sm cursor-pointer"
                >
                  Dar de Alta Médico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles Centro */}
      {centroDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            <div className="bg-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-teal-200" />
                <div>
                  <h3 className="font-bold text-base font-heading">{centroDetalle.nombre}</h3>
                  <span className="text-[10px] bg-teal-800 px-2 py-0.5 rounded-full font-bold">
                    {centroDetalle.tipo} • {centroDetalle.ciudad}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCentroDetalle(null)}
                className="text-white hover:bg-white/20 rounded-full p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 rounded-2xl bg-muted/40 p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground block">Dirección:</span>
                    <span className="text-muted-foreground">{centroDetalle.direccion}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground inline mr-1">Teléfono:</span>
                    <span className="font-mono text-teal-700 font-semibold">{centroDetalle.telefono}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground inline mr-1">Horario:</span>
                    <span className="text-muted-foreground">{centroDetalle.horarioAtencion}</span>
                  </div>
                </div>
              </div>

              {centroDetalle.disponibleGuardia && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive font-bold flex items-center gap-2">
                  <HeartPulse className="h-4 w-4" />
                  <span>Servicio de Guardia Permanente 24 horas</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCentroDetalle(null)}
                  className="flex-1 rounded-full border border-input py-2 font-bold hover:bg-accent transition"
                >
                  Volver
                </button>
                <Link
                  to="/turnero"
                  onClick={() => setCentroDetalle(null)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-teal-600 py-2 font-bold text-white hover:bg-teal-700 transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Sacar Turno</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
