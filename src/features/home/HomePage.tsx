import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { CentrosHeroBannerSlider } from './CentrosHeroBannerSlider';
import { QuienesSomosSection } from './QuienesSomosSection';
import { EspecialidadesSection, getSpecialtyDesign } from './EspecialidadesSection';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import type { CentroSalud, Especialidad, Profesional } from '@/types';
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  UserCheck,
  Stethoscope,
  X,
  User,
  Building2,
  PlusCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);

  // Estado para el modal de médicos por especialidad
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<Especialidad | null>(null);

  // Estado para modal de detalles de un centro de salud
  const [centroDetalle, setCentroDetalle] = useState<CentroSalud | null>(null);

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

  // Obtener los médicos que pertenecen a la especialidad seleccionada
  const medicosDeEspecialidad = especialidadSeleccionada
    ? profesionales.filter((p) => p.especialidadId === especialidadSeleccionada.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-700 selection:text-white">
      <PublicNavbar />

      {/* BANNER INTERACTIVO DE FOTOS E INSTITUCIONES (POR ENCIMA DEL HERO) */}
      <div id="centros" className="scroll-mt-16">
        <CentrosHeroBannerSlider />
      </div>

      {/* Hero Section: Acceso Rápido y Búsqueda Centralizada */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50/80 py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-slate-900 font-heading leading-tight">
              Cuidamos la salud de <span className="text-sky-700">Cruz del Eje</span> en un solo lugar.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              El <strong>Ecosistema de Salud Unificado (Luvia)</strong> conecta hospitales, dispensarios municipales, clínicas y consultorios independientes para facilitarte el acceso a turnos, historias clínicas y recetas electrónicas.
            </p>

            {/* Acciones Rápidas */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/turnero"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-sky-700 px-8 py-4 text-base sm:text-lg font-bold text-white shadow-md hover:bg-sky-800 hover:shadow-lg transition-all cursor-pointer"
              >
                <Calendar className="h-5 w-5" />
                <span>Sacar Turno Online</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/dashboard/paciente"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                <UserCheck className="h-5 w-5 text-sky-700" />
                <span>Consultar Mis Turnos</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS / INSTITUCIONAL ESU */}
      <QuienesSomosSection />

      {/* Especialidades Médicas Rediseñadas (Cartilla Médica Moderna) */}
      <EspecialidadesSection
        especialidades={especialidades}
        profesionales={profesionales}
        onSelectSpecialty={(esp) => setEspecialidadSeleccionada(esp)}
      />

      {/* MODAL PRINCIPAL: NÓMINA DE MÉDICOS CON GUÍA DETALLADA DE SEDES / HOSPITALES Y OPCIÓN DE AGREGAR ROL ADMIN */}
      {especialidadSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            {/* Header del Modal */}
            {(() => {
              const modalConfig = getSpecialtyDesign(especialidadSeleccionada.id, especialidadSeleccionada.nombre);
              const ModalIcon = modalConfig.Icon;
              return (
                <div className="bg-sky-800 p-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ModalIcon className="h-7 w-7 text-white shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold font-heading">{especialidadSeleccionada.nombre}</h3>
                      <p className="text-xs text-sky-100">{especialidadSeleccionada.descripcion}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEspecialidadSeleccionada(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
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

              {/* Botón de Agregar según Rol RBAC (Navega a página independiente) */}
              <Link
                to="/profesionales/nuevo"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Agregar Médico a esta Especialidad</span>
              </Link>
            </div>

            {/* Contenido: Lista de Médicos con Guía de Centros de Salud */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {medicosDeEspecialidad.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground space-y-3">
                  <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p>No hay médicos registrados actualmente para esta especialidad.</p>
                  <Link
                    to="/profesionales/nuevo"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Agregar el primer médico</span>
                  </Link>
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
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 transition shadow-xs self-start sm:self-auto cursor-pointer"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Sacar Turno con {med.nombre}</span>
                          </Link>
                        </div>

                        {/* GUÍA DE LUGARES DONDE TRABAJA (Hospitales, Clínicas, Dispensarios) */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-sky-700" />
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
                                    <span className="text-xs text-slate-500 font-normal">
                                      {centro.tipo}
                                    </span>
                                  </div>
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
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
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
            <div className="bg-sky-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-sky-200" />
                <div>
                  <h3 className="font-bold text-base font-heading">{centroDetalle.nombre}</h3>
                  <p className="text-xs text-sky-100">
                    {centroDetalle.tipo} • {centroDetalle.ciudad}
                  </p>
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

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCentroDetalle(null)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white py-2 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Volver
                </button>
                <Link
                  to="/turnero"
                  onClick={() => {
                    setCentroDetalle(null);
                    setEspecialidadSeleccionada(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-sky-700 py-2 font-bold text-white hover:bg-sky-800 transition cursor-pointer"
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
