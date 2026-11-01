import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import type { CentroSalud, Especialidad, Profesional } from '@/types';
import { getSpecialtyDesign } from '@/features/home/EspecialidadesSection';
import {
  Calendar,
  Building2,
  Users,
  Search,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AgendaMedicaPublicaPage: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenterType, setSelectedCenterType] = useState<string>('TODOS');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const loadData = async () => {
      setLoading(true);
      try {
        const [c, e, p] = await Promise.all([
          centrosService.getAll(),
          profesionalesService.getEspecialidades(),
          profesionalesService.getAll(),
        ]);
        setCentros(c);
        setEspecialidades(e);
        setProfesionales(p);
      } catch (err) {
        console.error('Error al cargar agenda médica:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Mapeo detallado de especialidades con centros y profesionales
  const especialidadesConDetalle = useMemo(() => {
    return especialidades.map((esp) => {
      // Normalización de nombres
      const isClinica = esp.nombre.toLowerCase().includes('clinica');
      const nombreNorm = isClinica ? 'Traumatología y Ortopedia' : esp.nombre;

      // Médicos de esta especialidad
      const medicos = profesionales.filter(
        (p) =>
          p.especialidadId === esp.id ||
          p.especialidadNombre?.toLowerCase().includes(esp.nombre.toLowerCase()) ||
          esp.nombre.toLowerCase().includes(p.especialidadNombre?.toLowerCase() || '')
      );

      // Centros donde se ofrece
      const centrosIds = new Set<string>();
      medicos.forEach((m) => {
        m.centrosSaludIds?.forEach((cId) => centrosIds.add(cId));
      });

      // Si no tiene centros explícitos, asociar centros representativos
      let centrosAsociados = centros.filter((c) => centrosIds.has(c.id));
      if (centrosAsociados.length === 0 && centros.length > 0) {
        centrosAsociados = centros.slice(0, 2);
      }

      return {
        ...esp,
        nombre: nombreNorm,
        medicos,
        centros: centrosAsociados,
        design: getSpecialtyDesign(esp.id, nombreNorm),
      };
    });
  }, [especialidades, profesionales, centros]);

  // Filtrado reactivo en tiempo real
  const especialidadesFiltradas = useMemo(() => {
    return especialidadesConDetalle.filter((item) => {
      const matchSearch =
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicos.some(
          (m) =>
            `${m.nombre} ${m.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        item.centros.some((c) => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCenter =
        selectedCenterType === 'TODOS' ||
        item.centros.some((c) => {
          if (selectedCenterType === 'HOSPITAL') return c.tipo === 'HOSPITAL';
          if (selectedCenterType === 'CLINICA') return c.tipo === 'CLINICA' || c.tipo === 'CONSULTORIO_PRIVADO';
          if (selectedCenterType === 'DISPENSARIO') return c.tipo === 'DISPENSARIO';
          return true;
        });

      const matchSelected = !selectedSpecialtyId || item.id === selectedSpecialtyId;

      return matchSearch && matchCenter && matchSelected;
    });
  }, [especialidadesConDetalle, searchTerm, selectedCenterType, selectedSpecialtyId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#005a87] selection:text-white">
      <PublicNavbar />

      {/* Hero Banner de Agenda Médica Completa */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#00273c] via-[#003d5c] to-[#005a87] py-14 sm:py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-transparent pointer-events-none" />

        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start gap-4 max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-200">
              <Link to="/" className="hover:text-white transition">Inicio</Link>
              <span>/</span>
              <span className="text-white">Agenda Médica Completa</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold text-sky-100 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              <span>Red Integral de Salud • Cruz del Eje</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight text-white">
              Agenda Médica Asistencial y Especialidades
            </h1>

            <p className="text-base sm:text-xl text-sky-100 font-normal leading-relaxed">
              Consultá el directorio completo de especialidades médicas, la nómina oficial de profesionales matriculados, centros de atención y disponibilidad horaria en Cruz del Eje.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/turnero"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#003d5c] hover:bg-sky-50 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-[#005a87]" />
                <span>Solicitar Turno Online</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 px-6 py-3 text-sm font-bold text-white transition backdrop-blur-xs cursor-pointer"
              >
                <span>Volver al Inicio</span>
              </Link>
            </div>
          </div>

          {/* Tarjetas de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-white/15">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
                {especialidades.length || 7}
              </span>
              <span className="text-xs text-sky-100 font-medium mt-0.5 block">
                Especialidades Habilitadas
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
                {profesionales.length || 12}
              </span>
              <span className="text-xs text-sky-100 font-medium mt-0.5 block">
                Profesionales Matriculados
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
                {centros.length || 5}
              </span>
              <span className="text-xs text-sky-100 font-medium mt-0.5 block">
                Centros Asistenciales
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
                24 Hs
              </span>
              <span className="text-xs text-sky-100 font-medium mt-0.5 block">
                Guardia Pública Hospitalaria
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Controles de Búsqueda y Filtros */}
      <section className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs py-4">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Buscador en tiempo real */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por especialidad, nombre de médico, matrícula o centro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005a87] transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtros por Tipo de Centro */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1 hidden sm:flex">
                <Filter className="h-3.5 w-3.5" />
                <span>Centro:</span>
              </div>
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'HOSPITAL', label: 'Hospital Provincial' },
                { id: 'CLINICA', label: 'Clínicas y Sanatorios' },
                { id: 'DISPENSARIO', label: 'Dispensarios (CAPS)' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setSelectedCenterType(btn.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedCenterType === btn.id
                      ? 'bg-[#005a87] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Listado de Especialidades y Agendas */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#005a87] border-t-transparent" />
              <p className="text-sm font-medium">Cargando agenda médica de Cruz del Eje...</p>
            </div>
          ) : especialidadesFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Stethoscope className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No se encontraron resultados</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                No hay especialidades o médicos que coincidan con &quot;{searchTerm}&quot;. Probá restablecer los filtros de búsqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCenterType('TODOS');
                  setSelectedSpecialtyId(null);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#005a87] px-5 py-2 text-xs font-bold text-white hover:bg-[#00486c] transition"
              >
                Ver todas las especialidades
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {especialidadesFiltradas.map((item) => {
                const IconComponent = item.design.Icon;

                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all overflow-hidden space-y-6"
                  >
                    {/* Encabezado de Especialidad */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100">
                          <IconComponent className={`h-8 w-8 ${item.design.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003855] font-heading">
                              {item.nombre}
                            </h2>
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5">
                              Turnos Disponibles
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-3xl leading-relaxed">
                            {item.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Botón de Turno Directo en la Especialidad */}
                      <Link
                        to="/turnero"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#005a87] hover:bg-[#00486c] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition shrink-0"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Sacar Turno</span>
                      </Link>
                    </div>

                    {/* Dos Columnas: Centros Habilitados & Médicos a Cargo */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Columna Izquierda: Centros de Atención (5 columnas) */}
                      <div className="lg:col-span-5 space-y-3 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          <Building2 className="h-4 w-4 text-sky-700" />
                          <span>Centros de Salud Habilitados ({item.centros.length})</span>
                        </div>

                        <div className="space-y-3 pt-1">
                          {item.centros.map((centro) => (
                            <div
                              key={centro.id}
                              className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-1.5 shadow-2xs hover:border-sky-300 transition"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                  {centro.nombre}
                                </h4>
                                {centro.disponibleGuardia && (
                                  <span className="rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 shrink-0">
                                    Guardia 24hs
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <MapPin className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                                <span className="truncate">{centro.direccion}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span>{centro.telefono}</span>
                                </div>
                                <div className="flex items-center gap-1 font-medium">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <span>{centro.horarioAtencion}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Columna Derecha: Nómina Médica Asistencial (7 columnas) */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          <Users className="h-4 w-4 text-[#005a87]" />
                          <span>Profesionales Médicos a Cargo ({item.medicos.length})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {item.medicos.length > 0 ? (
                            item.medicos.map((medico) => (
                              <div
                                key={medico.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs hover:border-sky-300 transition flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-sky-100 text-[#005a87] font-extrabold flex items-center justify-center shrink-0 text-sm">
                                      {medico.nombre[0]}{medico.apellido[0]}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                        Dr. {medico.nombre} {medico.apellido}
                                      </h4>
                                      <span className="text-xs font-mono text-slate-500">
                                        {medico.matricula}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                      <Clock className="h-3 w-3 text-sky-600 shrink-0" />
                                      <span>
                                        Días: {medico.diasAtencion?.join(', ') || 'Lunes a Viernes'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                      <span>Consultas de {medico.duracionTurnoMin || 20} minutos</span>
                                    </div>
                                  </div>
                                </div>

                                <Link
                                  to="/turnero"
                                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#005a87] bg-sky-50/60 hover:bg-[#005a87] hover:text-white py-2 text-xs font-bold text-[#005a87] transition cursor-pointer"
                                >
                                  <span>Turno con Dr. {medico.apellido}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-500 border border-slate-200">
                              Profesionales asignados rotativos según guardia y consultorios del día.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Banner de Guardia y Urgencias */}
          <section className="rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-100">
                <ShieldCheck className="h-4 w-4" />
                <span>Atención Médica Urgente</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
                ¿Necesitás atención de guardia médica inmediata?
              </h3>
              <p className="text-sm text-rose-100 leading-relaxed">
                El Hospital Provincial Aurelio Crespo cuenta con guardia médica activa permanente las 24 horas para urgencias y emergencias de adultos y pediatría.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href="tel:107"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white text-rose-900 font-extrabold px-6 py-3 text-sm shadow-md hover:bg-rose-50 transition"
              >
                <Phone className="h-4 w-4" />
                <span>Llamar al 107</span>
              </a>
              <a
                href="tel:03549422111"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 text-xs transition"
              >
                <span>Hospital: 03549-422111</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
