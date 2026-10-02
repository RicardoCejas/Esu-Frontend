import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { CentrosHeroBannerSlider } from './CentrosHeroBannerSlider';
import { QuienesSomosSection } from './QuienesSomosSection';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import type { CentroSalud, Especialidad, Profesional } from '@/types';
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  Search,
  ArrowRight,
  UserCheck,
  Stethoscope,
  HeartPulse,
  X,
  User,
  Building2,
  PlusCircle,
  Baby,
  Bone,
  Eye,
  Sun,
  Activity,
} from 'lucide-react';

// Helper para asignar a cada especialidad médica un icono único, distintivo y color representativo
const getSpecialtyConfig = (id: string, nombre: string) => {
  const lower = nombre.toLowerCase();
  if (id === 'e1' || lower.includes('clínica') || lower.includes('general')) {
    return {
      Icon: Stethoscope,
      iconColor: 'text-sky-700',
      borderHover: 'hover:border-sky-500',
      textHover: 'group-hover:text-sky-800',
      badgeClass: 'bg-sky-700 text-white',
      tag: 'Atención Primaria',
    };
  }
  if (id === 'e2' || lower.includes('pediatr')) {
    return {
      Icon: Baby,
      iconColor: 'text-amber-700',
      borderHover: 'hover:border-amber-500',
      textHover: 'group-hover:text-amber-800',
      badgeClass: 'bg-amber-600 text-white',
      tag: 'Salud Infantil',
    };
  }
  if (id === 'e3' || lower.includes('cardio')) {
    return {
      Icon: HeartPulse,
      iconColor: 'text-rose-700',
      borderHover: 'hover:border-rose-500',
      textHover: 'group-hover:text-rose-800',
      badgeClass: 'bg-rose-700 text-white',
      tag: 'Cardiología & ECG',
    };
  }
  if (id === 'e4' || lower.includes('trauma') || lower.includes('ortop')) {
    return {
      Icon: Bone,
      iconColor: 'text-slate-800',
      borderHover: 'hover:border-slate-500',
      textHover: 'group-hover:text-slate-900',
      badgeClass: 'bg-slate-800 text-white',
      tag: 'Huesos & Articulaciones',
    };
  }
  if (id === 'e5' || lower.includes('gineco') || lower.includes('obstetr')) {
    return {
      Icon: Activity,
      iconColor: 'text-pink-700',
      borderHover: 'hover:border-pink-500',
      textHover: 'group-hover:text-pink-800',
      badgeClass: 'bg-pink-700 text-white',
      tag: 'Salud Femenina',
    };
  }
  if (id === 'e6' || lower.includes('oftalmo')) {
    return {
      Icon: Eye,
      iconColor: 'text-emerald-700',
      borderHover: 'hover:border-emerald-500',
      textHover: 'group-hover:text-emerald-800',
      badgeClass: 'bg-emerald-700 text-white',
      tag: 'Salud Visual',
    };
  }
  if (id === 'e7' || lower.includes('derma')) {
    return {
      Icon: Sun,
      iconColor: 'text-orange-700',
      borderHover: 'hover:border-orange-500',
      textHover: 'group-hover:text-orange-800',
      badgeClass: 'bg-orange-700 text-white',
      tag: 'Dermatología & Piel',
    };
  }
  return {
    Icon: Activity,
    iconColor: 'text-sky-700',
    borderHover: 'hover:border-sky-500',
    textHover: 'group-hover:text-sky-800',
    badgeClass: 'bg-sky-700 text-white',
    tag: 'Especialidad Médica',
  };
};

export const HomePage: React.FC = () => {
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Estado para el modal de médicos por especialidad
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<Especialidad | null>(null);

  // Estado para modal de detalles de un centro de salud
  const [centroDetalle, setCentroDetalle] = useState<CentroSalud | null>(null);

  // Estado para modal de agregar nuevo médico
  const [modalAgregarMedico, setModalAgregarMedico] = useState(false);
  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    centrosSaludIds: [] as string[],
    diasAtencion: ['Lunes', 'Miércoles', 'Viernes'],
    duracionTurnoMin: 20,
  });

  const recargarDatos = async () => {
    const [c, e, p] = await Promise.all([
      centrosService.getAll(),
      profesionalesService.getEspecialidades(),
      profesionalesService.getAll(),
    ]);
    setCentros(c);
    setEspecialidades(e);
    setProfesionales(p);
  };

  useEffect(() => {
    recargarDatos();
  }, []);

  const especialidadesFiltradas = especialidades.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener los médicos que pertenecen a la especialidad seleccionada
  const medicosDeEspecialidad = especialidadSeleccionada
    ? profesionales.filter((p) => p.especialidadId === especialidadSeleccionada.id)
    : [];

  const handleCrearMedico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!especialidadSeleccionada) return;

    if (nuevoMedico.centrosSaludIds.length === 0) {
      alert('Por favor selecciona al menos un centro de salud donde atenderá el profesional.');
      return;
    }

    await profesionalesService.createProfesional({
      nombre: nuevoMedico.nombre,
      apellido: nuevoMedico.apellido,
      matricula: nuevoMedico.matricula,
      especialidadId: especialidadSeleccionada.id,
      especialidadNombre: especialidadSeleccionada.nombre,
      centrosSaludIds: nuevoMedico.centrosSaludIds,
      diasAtencion: nuevoMedico.diasAtencion,
      duracionTurnoMin: nuevoMedico.duracionTurnoMin,
    });

    await recargarDatos();
    setModalAgregarMedico(false);
    setNuevoMedico({
      nombre: '',
      apellido: '',
      matricula: '',
      centrosSaludIds: [],
      diasAtencion: ['Lunes', 'Miércoles', 'Viernes'],
      duracionTurnoMin: 20,
    });
  };

  const toggleCentroId = (id: string) => {
    setNuevoMedico((prev) => ({
      ...prev,
      centrosSaludIds: prev.centrosSaludIds.includes(id)
        ? prev.centrosSaludIds.filter((c) => c !== id)
        : [...prev.centrosSaludIds, id],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-600 selection:text-white">
      <PublicNavbar />

      {/* BANNER INTERACTIVO DE FOTOS E INSTITUCIONES (POR ENCIMA DEL HERO) */}
      <div id="centros" className="scroll-mt-16">
        <CentrosHeroBannerSlider />
      </div>

      {/* Hero Section: Acceso Rápido, Búsqueda y Guardia 24hs */}
      <section className="relative border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-100 px-4 py-1.5 text-xs font-bold text-sky-900">
                <Activity className="h-4 w-4 text-sky-700" />
                <span>Salud Pública y Privada Centralizada • Cruz del Eje</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-slate-900 font-heading leading-tight">
                Cuidamos la salud de <span className="text-sky-700">Cruz del Eje</span> en un solo lugar.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                El <strong>Ecosistema de Salud Unificado (ESU)</strong> conecta hospitales, dispensarios municipales, clínicas y consultorios independientes para facilitarte el acceso a turnos, historias clínicas y recetas electrónicas.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/turnero"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Sacar Turno Online (5 Pasos)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/dashboard/paciente"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-all"
                >
                  <UserCheck className="h-4 w-4 text-sky-700" />
                  <span>Consultar Mis Turnos</span>
                </Link>
              </div>

              {/* Badges de Cobertura */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <span className="block font-bold text-2xl text-sky-800 font-heading">100%</span>
                  <span className="text-slate-600 font-medium">Digital y Accesible</span>
                </div>
                <div>
                  <span className="block font-bold text-2xl text-sky-800 font-heading">24/7</span>
                  <span className="text-slate-600 font-medium">Guardia Hospitalaria</span>
                </div>
                <div>
                  <span className="block font-bold text-2xl text-sky-800 font-heading">QR</span>
                  <span className="text-slate-600 font-medium">Comprobantes y Recetas</span>
                </div>
              </div>
            </div>

            {/* Card de Atención Inmediata con Estilo Clínico Sobrio */}
            <div id="guardia" className="lg:col-span-5 space-y-4 scroll-mt-24">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="text-rose-700">
                    <HeartPulse className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="inline-block rounded bg-rose-700 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider mb-1">
                      Centro de Urgencias
                    </span>
                    <h3 className="font-bold text-lg font-heading text-slate-900">Atención Inmediata</h3>
                    <p className="text-xs text-slate-500">Guardia Médica 24hs Cruz del Eje</p>
                  </div>
                </div>

                {/* Banner de Guardia Roja */}
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center justify-between font-bold text-sm text-rose-900">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-600 inline-block"></span>
                      Guardia Activa:
                    </span>
                    <span className="font-mono text-base text-rose-900 tracking-wide font-extrabold">
                      107 / (03549) 422111
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                    <span>Hospital Provincial Aurelio Crespo (Av. Perón 450)</span>
                  </p>
                </div>

                {/* Input de Búsqueda Integrado */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-sky-700" />
                    Buscar centros o especialidades en Cruz del Eje
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej: Hospital, Pediatría, San Pantaleón..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-4 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS / INSTITUCIONAL ESU */}
      <QuienesSomosSection />

      {/* Especialidades Médicas con ICONOS DIFERENCIADOS por Especialidad */}
      <section id="especialidades" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700">Cartilla Médica y Sedes</span>
              <h2 className="text-3xl font-extrabold tracking-tight font-heading text-slate-900">Especialidades Médicas</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Haz clic sobre cualquier especialidad para ver los profesionales y en qué hospital, clínica o dispensario atienden.
              </p>
            </div>
            <Link
              to="/turnero"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline"
            >
              <span>Ver agenda completa</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {especialidadesFiltradas.map((esp) => {
              const config = getSpecialtyConfig(esp.id, esp.nombre);
              const SpecialtyIcon = config.Icon;
              const medicosCount = profesionales.filter((p) => p.especialidadId === esp.id).length;

              return (
                <button
                  key={esp.id}
                  onClick={() => setEspecialidadSeleccionada(esp)}
                  className={`flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all text-left cursor-pointer group shadow-xs hover:shadow-md hover:border-sky-400 ${config.borderHover}`}
                >
                  {/* Ícono sin contenedor pastel artificial */}
                  <div className={`shrink-0 pt-0.5 ${config.iconColor}`}>
                    <SpecialtyIcon className="h-7 w-7 transition-transform group-hover:scale-105" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`font-bold text-sm font-heading text-slate-900 transition ${config.textHover}`}>
                        {esp.nombre}
                      </h4>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    </div>

                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ${config.badgeClass}`}>
                      {config.tag}
                    </span>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {esp.descripcion}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                      <span className="font-bold text-sky-700 group-hover:underline">
                        Ver médicos ({medicosCount}) y sedes →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODAL PRINCIPAL: NÓMINA DE MÉDICOS CON GUÍA DETALLADA DE SEDES / HOSPITALES Y OPCIÓN DE AGREGAR ROL ADMIN */}
      {especialidadSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            {/* Header del Modal */}
            {(() => {
              const modalConfig = getSpecialtyConfig(especialidadSeleccionada.id, especialidadSeleccionada.nombre);
              const ModalIcon = modalConfig.Icon;
              return (
                <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-950 p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner">
                      <ModalIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-teal-200">
                        {modalConfig.tag}
                      </span>
                      <h3 className="text-xl font-bold font-heading">{especialidadSeleccionada.nombre}</h3>
                      <p className="text-xs text-teal-100">{especialidadSeleccionada.descripcion}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEspecialidadSeleccionada(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })()}

            {/* Sub-header con botón de Agregar Médico (Permisos RBAC: Admin / Recepción) */}
            <div className="bg-muted/40 px-6 py-3 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-teal-600" />
                <span>
                  <strong>{medicosDeEspecialidad.length}</strong> médicos matriculados en Cruz del Eje
                </span>
              </div>

              {/* Botón de Agregar según Rol RBAC */}
              <button
                onClick={() => setModalAgregarMedico(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Agregar Médico a esta Especialidad</span>
              </button>
            </div>

            {/* Contenido: Lista de Médicos con Guía de Centros de Salud */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {medicosDeEspecialidad.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground space-y-3">
                  <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p>No hay médicos registrados actualmente para esta especialidad.</p>
                  <button
                    onClick={() => setModalAgregarMedico(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Agregar el primer médico</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {medicosDeEspecialidad.map((med) => {
                    const centrosDelMedico = centros.filter((c) => med.centrosSaludIds.includes(c.id));

                    return (
                      <div
                        key={med.id}
                        className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all space-y-4"
                      >
                        {/* Cabecera del Médico */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 font-bold text-sm">
                              {med.nombre.charAt(0)}{med.apellido.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-bold text-base text-foreground font-heading">
                                Dr(a). {med.nombre} {med.apellido}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                  {med.matricula}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-teal-600" />
                                  <span>{med.diasAtencion.join(', ')}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <Link
                            to="/turnero"
                            onClick={() => setEspecialidadSeleccionada(null)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition shadow-xs self-start sm:self-auto"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Sacar Turno con {med.nombre}</span>
                          </Link>
                        </div>

                        {/* GUÍA DE LUGARES DONDE TRABAJA (Hospitales, Clínicas, Dispensarios) */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>Sedes y Centros donde Atiende ({centrosDelMedico.length}):</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {centrosDelMedico.map((centro) => (
                              <div
                                key={centro.id}
                                className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 space-y-2 hover:bg-teal-50 transition"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div>
                                    <h6 className="font-bold text-xs text-foreground font-heading">
                                      {centro.nombre}
                                    </h6>
                                    <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                                      {centro.tipo}
                                    </span>
                                  </div>
                                  {centro.disponibleGuardia && (
                                    <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                                      Guardia 24hs
                                    </span>
                                  )}
                                </div>

                                <div className="text-[11px] text-muted-foreground space-y-1">
                                  <p className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-teal-600 shrink-0" />
                                    <span className="truncate">{centro.direccion}</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-teal-600 shrink-0" />
                                    <span>{centro.telefono}</span>
                                  </p>
                                </div>

                                <div className="pt-1 flex items-center justify-between gap-2 border-t border-teal-200/50">
                                  <button
                                    onClick={() => setCentroDetalle(centro)}
                                    className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                                  >
                                    Ver detalles / Sede
                                  </button>
                                  <Link
                                    to="/turnero"
                                    onClick={() => setEspecialidadSeleccionada(null)}
                                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                                  >
                                    <span>Pedir turno aquí</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="bg-muted/40 p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setEspecialidadSeleccionada(null)}
                className="rounded-full border border-input bg-card px-5 py-2 text-xs font-bold hover:bg-accent transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALLES DE UN CENTRO DE SALUD / CÓMO LLEGAR */}
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
                  onClick={() => setCentroDetalle(null)}
                  className="flex-1 rounded-full border border-input py-2 font-bold hover:bg-accent transition"
                >
                  Volver
                </button>
                <Link
                  to="/turnero"
                  onClick={() => {
                    setCentroDetalle(null);
                    setEspecialidadSeleccionada(null);
                  }}
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

      {/* MODAL: AGREGAR NUEVO MÉDICO A LA ESPECIALIDAD (ROL RBAC) */}
      {modalAgregarMedico && especialidadSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlusCircle className="h-6 w-6 text-teal-200" />
                <div>
                  <h3 className="font-bold text-base font-heading">Agregar Nuevo Médico</h3>
                  <span className="text-xs text-teal-200">
                    Especialidad: {especialidadSeleccionada.nombre}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalAgregarMedico(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearMedico} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Martín"
                    value={nuevoMedico.nombre}
                    onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Apellido *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Varela"
                    value={nuevoMedico.apellido}
                    onChange={(e) => setNuevoMedico({ ...nuevoMedico, apellido: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Matrícula Médica Provincial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: MP-48192"
                  value={nuevoMedico.matricula}
                  onChange={(e) => setNuevoMedico({ ...nuevoMedico, matricula: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Selector de Centros de Salud de Cruz del Eje */}
              <div className="space-y-2">
                <label className="font-bold text-foreground block">
                  Centros de Salud donde atenderá (Seleccionar uno o más) *:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {centros.map((centro) => {
                    const isSelected = nuevoMedico.centrosSaludIds.includes(centro.id);
                    return (
                      <button
                        type="button"
                        key={centro.id}
                        onClick={() => toggleCentroId(centro.id)}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-xs'
                            : 'border-border bg-card text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">{centro.nombre}</p>
                          <span className="text-[10px] text-muted-foreground block">{centro.tipo}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalAgregarMedico(false)}
                  className="flex-1 rounded-full border border-input py-2.5 font-bold hover:bg-accent transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-teal-600 py-2.5 font-bold text-white hover:bg-teal-700 transition shadow-sm"
                >
                  Guardar Médico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
