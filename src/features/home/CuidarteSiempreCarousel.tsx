import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Calendar, HeartPulse } from 'lucide-react';

interface HealthArticle {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  fullContent: string;
  image: string;
  linkEspecialidad: string;
}

const ARTICLES: HealthArticle[] = [
  {
    id: 'art-1',
    badge: 'Ginecología Clínica',
    badgeColor: 'bg-rose-500/90 text-white',
    title: 'Atendemos todas las etapas',
    subtitle: 'Adolescencia, adultez, embarazo y menopausia.',
    description: 'Estamos para acompañarte siempre con controles ginecológicos periódicos, ecografías y prevención temprana.',
    fullContent: 'La consulta ginecológica periódica es fundamental para la detección oportuna de patologías y el cuidado de la salud reproductiva. En los centros de salud de Cruz del Eje contamos con consultorios especializados en salud integral femenina, ecografía obstétrica y ginecológica, y asesoramiento en planificación familiar.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    linkEspecialidad: '/turnero',
  },
  {
    id: 'art-2',
    badge: '¡Disfrutá del sol consciente!',
    badgeColor: 'bg-amber-600/90 text-white',
    title: 'Cuidados de la piel en época de calor',
    subtitle: 'La importancia de protegerte en días calurosos.',
    description: 'Conocé los consejos clave de nuestros dermatólogos para evitar quemaduras solares, deshidratación y golpes de calor.',
    fullContent: 'En la región del noroeste cordobés las temperaturas y el índice UV son elevados durante gran parte del año. Recomendamos usar protector solar con FPS 50+, evitar la exposición solar directa entre las 10:00 y las 16:00 hs, usar ropa clara de manga larga y beber al menos 2 litros de agua diarios. Ante la aparición de manchas o lunares sospechosos, solicitá turno con dermatología.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    linkEspecialidad: '/turnero',
  },
  {
    id: 'art-3',
    badge: 'Salud Visual Integral',
    badgeColor: 'bg-red-600/90 text-white',
    title: 'Mitos sobre cirugías y control ocular',
    subtitle: 'Diagnóstico precoz y prevención oftalmológica.',
    description: 'Realizamos chequeos de agudeza visual, fondo de ojos y controles de presión ocular para toda la familia.',
    fullContent: 'El control de la vista una vez al año previene el avance de afecciones como el glaucoma, las cataratas o los errores refractivos no corregidos (miopía, astigmatismo). En nuestros centros y clínicas asociadas de Cruz del Eje contás con equipamiento para estudios diagnósticos de alta precisión.',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    linkEspecialidad: '/turnero',
  },
  {
    id: 'art-4',
    badge: 'Pediatría y Desarrollo',
    badgeColor: 'bg-sky-600/90 text-white',
    title: 'Control de Niño Sano y Vacunas',
    subtitle: 'Acompañando su crecimiento paso a paso.',
    description: 'Seguimiento nutricional, esquema nacional de vacunación y controles pediátricos desde el primer mes de vida.',
    fullContent: 'El control del niño sano permite monitorear el crecimiento en percentiles de talla y peso, el desarrollo psicomotriz y la inmunización completa según el calendario oficial. Los dispensarios municipales y el Hospital Aurelio Crespo cuentan con vacunatorio permanente y atención médica pediátrica diaria.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    linkEspecialidad: '/turnero',
  },
];

export const CuidarteSiempreCarousel: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(null);

  const visibleCards = 3;
  const maxStartIndex = Math.max(0, ARTICLES.length - visibleCards);

  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : maxStartIndex));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev < maxStartIndex ? prev + 1 : 0));
  };

  return (
    <section className="relative overflow-hidden py-16 bg-[#eaf6f6] border-b border-teal-100">
      {/* Marca de agua de Cruz de Salud */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-30 select-none">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute w-12 h-44 bg-teal-300 rounded-2xl" />
          <div className="absolute w-44 h-12 bg-teal-300 rounded-2xl" />
        </div>
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Título Estilo Referencia */}
        <div className="text-center mb-12 space-y-1">
          <span className="block text-2xl sm:text-3xl font-bold tracking-widest text-teal-600 uppercase font-heading">
            CUIDARTE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-teal-800 uppercase font-heading">
            SIEMPRE
          </h2>
          <div className="h-1 w-16 bg-teal-500 mx-auto mt-2 rounded-full" />
        </div>

        {/* Carrusel con Flechas Laterales */}
        <div className="relative flex items-center">
          {/* Flecha Izquierda */}
          <button
            onClick={handlePrev}
            className="absolute -left-2 sm:-left-5 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-700 shadow-md hover:bg-teal-50 transition hover:scale-105 cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Tarjetas del Carrusel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-6 sm:px-8">
            {ARTICLES.slice(startIndex, startIndex + visibleCards).map((art) => (
              <div
                key={art.id}
                className="flex flex-col overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group"
              >
                {/* Imagen Superior con Badge Flotante */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badge Destacado */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <span
                      className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold tracking-wide shadow-md backdrop-blur-xs ${art.badgeColor}`}
                    >
                      {art.badge}
                    </span>
                  </div>
                </div>

                {/* Contenido Inferior Turquesa Oficial */}
                <div className="flex flex-1 flex-col justify-between bg-teal-700 p-6 text-white space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base sm:text-lg leading-snug font-heading text-white">
                      {art.title}
                    </h3>
                    <p className="text-xs text-teal-100 font-medium">
                      {art.subtitle}
                    </p>
                    <p className="text-xs text-teal-100/90 leading-relaxed line-clamp-3">
                      {art.description}
                    </p>
                  </div>

                  {/* Botón de Acción Estilo Píldora */}
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedArticle(art)}
                      className="inline-flex items-center justify-center rounded-full border border-teal-400 bg-teal-800/60 px-5 py-2 text-xs font-bold text-white hover:bg-white hover:text-teal-800 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Leer Más</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flecha Derecha */}
          <button
            onClick={handleNext}
            className="absolute -right-2 sm:-right-5 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-700 shadow-md hover:bg-teal-50 transition hover:scale-105 cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Indicadores de Paginación */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: maxStartIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStartIndex(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                startIndex === idx ? 'w-8 bg-teal-600' : 'w-2.5 bg-teal-300 hover:bg-teal-400'
              }`}
              aria-label={`Ir a página ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal de Lectura Completa */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            <div className="relative h-48 w-full">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedArticle.badgeColor}`}>
                  {selectedArticle.badge}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground font-heading">
                  {selectedArticle.title}
                </h3>
                <p className="text-xs text-teal-600 font-semibold mt-0.5">
                  {selectedArticle.subtitle}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedArticle.fullContent}
              </p>

              <div className="rounded-2xl border border-teal-500/20 bg-teal-50 p-4 text-xs space-y-1">
                <div className="font-bold text-teal-700 flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4" />
                  <span>Atención en Cruz del Eje</span>
                </div>
                <p className="text-muted-foreground">
                  Podés solicitar tu turno médico con los profesionales especializados de nuestra red pública y privada.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex-1 rounded-full border border-input bg-background py-2.5 text-xs font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Cerrar
                </button>
                <Link
                  to="/turnero"
                  onClick={() => setSelectedArticle(null)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Sacar Turno</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
