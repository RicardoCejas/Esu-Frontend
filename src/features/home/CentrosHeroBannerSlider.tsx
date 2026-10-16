import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Phone, Clock, Calendar, X, ShieldCheck } from 'lucide-react';

interface BannerSlide {
  id: string;
  logoType: 'sanatorio-maria-isabel' | 'hospital' | 'clinica-cabrera' | 'centro-diag' | 'dispensario' | 'turnero';
  titlePrimary: string;
  titleSecondary: string;
  subtitle: string;
  buttonText: string;
  buttonLink?: string;
  bgImage: string;
  detalles: {
    nombreCompleto: string;
    tipo: string;
    direccion: string;
    telefono: string;
    horario: string;
    descripcion: string;
    servicios: string[];
  };
}

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    logoType: 'hospital',
    titlePrimary: 'HOSPITAL PROVINCIAL',
    titleSecondary: 'AURELIO CRESPO',
    subtitle: 'Hospital público cabecera regional con internación, terapia intensiva y atención médica ambulatoria integral.',
    buttonText: 'Guardia y Turnos',
    buttonLink: '/turnero',
    bgImage: '/centros/hospital_aurelio_crespo.jpg',
    detalles: {
      nombreCompleto: 'Hospital Provincial Dr. Aurelio Crespo',
      tipo: 'Hospital Público Provincial de Agudos',
      direccion: 'Av. Juan Domingo Perón 450, Cruz del Eje',
      telefono: '03549-422111 / Emergencias: 107',
      horario: 'Guardia de Urgencias: 24 Horas Permanente',
      descripcion: 'Centro de salud de referencia pública para los departamentos Cruz del Eje, Ischilín, Minas y Pocho. 100% de atención gratuita con internación pediátrica, adultos, quirófanos y maternidad.',
      servicios: ['Guardia 24hs Permanente', 'Unidad de Terapia Intensiva (UTI)', 'Quirófanos Centrales', 'Maternidad y Neonatología', 'Laboratorio de Urgencias'],
    },
  },
  {
    id: 'slide-2',
    logoType: 'sanatorio-maria-isabel',
    titlePrimary: 'SANATORIO PRIVADO',
    titleSecondary: 'MARÍA ISABEL',
    subtitle: 'Institución sanatorial de primer nivel en Cruz del Eje con modernas instalaciones, quirófanos e internación.',
    buttonText: 'Ver Cartilla y Sedes',
    buttonLink: '/turnero',
    bgImage: '/centros/sanatorio_maria_isabel.webp',
    detalles: {
      nombreCompleto: 'Sanatorio María Isabel - Cruz del Eje',
      tipo: 'Sanatorio Médico Quirúrgico e Internación',
      direccion: 'Sarmiento 450, Centro, Cruz del Eje',
      telefono: '03549-422400',
      horario: 'Lunes a Sábados de 08:00 a 20:00 hs',
      descripcion: 'Infraestructura sanatorial moderna con quirófano completamente equipado, internación en salas individuales y compartidas, y consultorios con reconocidos especialistas.',
      servicios: ['Quirófanos de Cirugía General', 'Internación Sanatorial', 'Consultorios de Especialidades', 'Atención con Obras Sociales', 'Cuidados Médicos Integrales'],
    },
  },
  {
    id: 'slide-3',
    logoType: 'clinica-cabrera',
    titlePrimary: 'CLÍNICA MÉDICA',
    titleSecondary: 'CABRERA',
    subtitle: 'En Clínica Cabrera trabajamos con Obras Sociales. La mejor calidad de salud te la ofrecemos nosotros.',
    buttonText: 'Obras Sociales y Turnos',
    buttonLink: '/turnero',
    bgImage: '/centros/clinica_cabrera.jpg',
    detalles: {
      nombreCompleto: 'Clínica Cabrera - Cruz del Eje',
      tipo: 'Clínica Médica y Atención con Obras Sociales',
      direccion: 'Avenida Eva Perón 642, Cruz del Eje, Córdoba',
      telefono: '03549-424150',
      horario: 'Lunes a Viernes de 08:00 a 20:00 hs',
      descripcion: 'Compromiso y trayectoria médica en Cruz del Eje. Atención integral en consultorios ambulatorios con cobertura para las principales obras sociales y mutuales.',
      servicios: ['Atención Integral con Obras Sociales', 'Medicina General y Familiar', 'Especialidades Médicas', 'Laboratorio y Estudios Clínicos', 'Atención Ambulatoria'],
    },
  },
  {
    id: 'slide-4',
    logoType: 'centro-diag',
    titlePrimary: 'CENTRO DE DIAGNÓSTICO',
    titleSecondary: 'CRUZ DEL EJE',
    subtitle: 'El centro de diagnóstico con la mejor tecnología de toda la región norte de la Pcia. de Córdoba.',
    buttonText: 'Más Información',
    bgImage: '/centros/centro_diagnostico.png',
    detalles: {
      nombreCompleto: 'Centro de Diagnóstico por Imágenes Cruz del Eje',
      tipo: 'Diagnóstico de Alta Complejidad',
      direccion: 'Sarmiento 340, Cruz del Eje, Córdoba',
      telefono: '03549-421880 / WhatsApp: 3549-552233',
      horario: 'Lunes a Viernes de 07:30 a 20:00 hs',
      descripcion: 'Equipamiento de vanguardia en tomografía computada multicorte, radiología digital directa, ecografía 4D y Doppler vascular, resonancia magnética y densitometría ósea.',
      servicios: ['Tomografía Computada', 'Ecografía 4D & Doppler', 'Radiología Digital', 'Mamografía de Alta Resolución', 'Densitometría Ósea'],
    },
  },
  {
    id: 'slide-5',
    logoType: 'dispensario',
    titlePrimary: 'DISPENSARIOS MUNICIPALES',
    titleSecondary: 'SAN PANTALEÓN & SANTA ROSA',
    subtitle: 'Red barrial de atención primaria de la salud, vacunación gratuita y seguimiento familiar en Cruz del Eje.',
    buttonText: 'Atención Barrial',
    bgImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1800&q=80',
    detalles: {
      nombreCompleto: 'Dispensarios Municipales CAPS - Cruz del Eje',
      tipo: 'Centros de Atención Primaria de la Salud (CAPS)',
      direccion: 'Barrio Centro, Los Altos y Santa Rosa, Cruz del Eje',
      telefono: '03549-423500 / 424100',
      horario: 'Lunes a Viernes de 07:00 a 19:00 hs',
      descripcion: 'Red municipal orientada a la prevención comunitaria, control del niño sano, entrega de medicamentos esenciales bajo programa Remediar y vacunatorio oficial.',
      servicios: ['Vacunatorio Oficial Gratuito', 'Control de Niño Sano', 'Medicina General y Familiar', 'Enfermería y Curaciones', 'Entrega de Medicamentos'],
    },
  },
];

export const CentrosHeroBannerSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalSlide, setModalSlide] = useState<BannerSlide | null>(null);

  // Auto-play cada 6 segundos, si no está en pausa por hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = BANNER_SLIDES[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? BANNER_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  // Render del logo estilizado idéntico a la imagen provista
  const renderLogo = (type: BannerSlide['logoType']) => {
    switch (type) {
      case 'centro-diag':
        return (
          <div className="flex items-center gap-3">
            {/* Cruz de 4 aspas curvas idéntica al Centro de Diagnóstico Cruz del Eje */}
            <div className="relative h-12 w-12 shrink-0">
              <div className="absolute top-0 left-0 h-6 w-6 rounded-tr-2xl bg-[#005f9e]" />
              <div className="absolute top-0 right-0 h-6 w-6 rounded-tl-2xl bg-[#0284c7]" />
              <div className="absolute bottom-0 left-0 h-6 w-6 rounded-br-2xl bg-[#0ea5e9]" />
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-bl-2xl bg-[#0369a1]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-[#0284c7] font-heading leading-none">
                CENTRO DE DIAGNÓSTICO
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#004f82] font-heading leading-tight">
                CRUZ DEL EJE
              </span>
            </div>
          </div>
        );
      case 'hospital':
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <span className="text-2xl font-extrabold">+</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-teal-700 font-heading leading-none">
                HOSPITAL PROVINCIAL
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest text-teal-900 font-heading leading-tight">
                AURELIO CRESPO
              </span>
            </div>
          </div>
        );
      case 'sanatorio-maria-isabel':
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-md border border-slate-600">
              <span className="text-2xl font-bold">✚</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-slate-700 font-heading leading-none">
                SANATORIO
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest text-slate-950 font-heading leading-tight">
                MARÍA ISABEL
              </span>
            </div>
          </div>
        );
      case 'clinica-cabrera':
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
              <span className="text-2xl font-bold">⚕</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-teal-700 font-heading leading-none">
                CLÍNICA MÉDICA
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest text-teal-950 font-heading leading-tight">
                CABRERA
              </span>
            </div>
          </div>
        );
      case 'dispensario':
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <span className="text-2xl font-extrabold">♥</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-emerald-700 font-heading leading-none">
                DISPENSARIO MUNICIPAL
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest text-emerald-950 font-heading leading-tight">
                SAN PANTALEÓN
              </span>
            </div>
          </div>
        );
      case 'turnero':
      default:
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-teal-700 font-heading leading-none">
                PORTAL ASISTENCIAL LUVIA
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest text-teal-950 font-heading leading-tight">
                TURNOS EN LÍNEA
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="relative w-full border-b border-border bg-slate-100 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Contenedor del Slide Activo con Transición Suave */}
      <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] w-full flex items-center">
        {/* Foto de Fondo con Filtro Limpio */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${slide.bgImage})` }}
        />

        {/* Degradado Suave Blanco/Celeste en el lado izquierdo para máxima legibilidad idéntico a la referencia */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/20 sm:via-white/80 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />

        {/* Flechas de Navegación Lateral (ocultables en móvil) */}
        <button
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white hover:text-teal-700 hover:scale-110 transition cursor-pointer"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 sm:right-6 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white hover:text-teal-700 hover:scale-110 transition cursor-pointer"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Contenido Textual Izquierdo con Diseño Idéntico a la Referencia */}
        <div className="container relative z-10 mx-auto max-w-7xl px-8 sm:px-14 lg:px-20 py-12">
          <div className="max-w-xl space-y-5 animate-in fade-in duration-300">
            {/* Logo e Identidad de la Institución */}
            {renderLogo(slide.logoType)}

            {/* Bajada / Subtítulo */}
            <p className="text-sm sm:text-base md:text-lg font-medium text-[#1e3a5f] leading-relaxed">
              {slide.subtitle}
            </p>

            {/* Botones de Acción Uniformes para Todos los Centros */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/turnero"
                className="inline-flex items-center justify-center rounded-md bg-[#104e7a] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#0c3e62] hover:shadow-lg transition-all cursor-pointer"
              >
                Sacar Turno
              </Link>

              <button
                onClick={() => setModalSlide(slide)}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white/80 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-white transition cursor-pointer"
              >
                Conocer Instalaciones
              </button>
            </div>
          </div>
        </div>

        {/* Puntos de Paginación (5 Puntos Idénticos a la Referencia) */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center items-center gap-2">
          {BANNER_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all cursor-pointer ${
                currentSlide === index
                  ? 'h-3 w-3 bg-white border-2 border-[#104e7a] ring-2 ring-white shadow-md scale-125'
                  : 'h-2.5 w-2.5 bg-slate-300/80 border border-slate-400 hover:bg-slate-400'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* MODAL DETALLES DEL CENTRO AL CLICAR EN "MÁS INFORMACIÓN" */}
      {modalSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            {/* Cabecera con Foto */}
            <div className="relative h-44 w-full bg-slate-800">
              <img
                src={modalSlide.bgImage}
                alt={modalSlide.detalles.nombreCompleto}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-5 text-white">
                <div>
                  <p className="text-xs text-slate-300 font-medium mb-1">
                    {modalSlide.detalles.tipo}
                  </p>
                  <h3 className="text-xl font-bold font-heading text-white">
                    {modalSlide.detalles.nombreCompleto}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setModalSlide(null)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4 text-xs">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {modalSlide.detalles.descripcion}
              </p>

              {/* Ficha Técnica */}
              <div className="rounded-2xl bg-muted/40 p-4 space-y-2 border border-border/80">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Dirección:</strong> {modalSlide.detalles.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600 shrink-0" />
                  <span><strong>Teléfono:</strong> {modalSlide.detalles.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                  <span><strong>Horario:</strong> {modalSlide.detalles.horario}</span>
                </div>
              </div>

              {/* Equipamiento y Especialidades */}
              <div className="space-y-2">
                <span className="font-bold text-foreground block text-xs">
                  Servicios y Estudios Disponibles:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {modalSlide.detalles.servicios.map((srv, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-700" />
                      <span>{srv}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón de Acción */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalSlide(null)}
                  className="flex-1 rounded-full border border-input py-2.5 font-bold hover:bg-accent transition cursor-pointer"
                >
                  Cerrar
                </button>
                <Link
                  to="/turnero"
                  onClick={() => setModalSlide(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-teal-600 py-2.5 font-bold text-white hover:bg-teal-700 transition shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Sacar Turno Aquí</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
