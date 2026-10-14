import React, { useState } from 'react';
import { Building2, MapPin, Phone, Clock, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CentroShowcase {
  id: string;
  nombre: string;
  tipo: string;
  badge: string;
  fotoUrl: string;
  galeria: string[];
  direccion: string;
  telefono: string;
  horario: string;
  descripcion: string;
  equipamiento: string[];
  guardia24hs: boolean;
}

export const CENTROS_SHOWCASE: CentroShowcase[] = [
  {
    id: 'c1',
    nombre: 'Hospital Provincial Aurelio Crespo',
    tipo: 'Hospital Público Regional',
    badge: 'Cabecera Regional Noroeste',
    fotoUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1000&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
    ],
    direccion: 'Av. Juan Domingo Perón 450, Cruz del Eje',
    telefono: '03549-422111 (Guardia 107)',
    horario: 'Guardia Permanente 24 Horas / Consultorios 07:00 a 20:00',
    descripcion: 'Principal centro de salud de referencia pública para Cruz del Eje y departamentos vecinos. Cuenta con guardia de emergencias 24hs, internación, terapia intensiva y quirófanos.',
    equipamiento: ['Guardia 24hs', 'Terapia Intensiva (UTI)', 'Rayos X & Tomografía', 'Laboratorio Central', 'Maternidad'],
    guardia24hs: true,
  },
  {
    id: 'c3',
    nombre: 'Clínica Privada Cruz del Eje',
    tipo: 'Sanatorio & Clínica Privada',
    badge: 'Alta Complejidad Privada',
    fotoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
    ],
    direccion: 'Sarmiento 340, Cruz del Eje',
    telefono: '03549-421880',
    horario: 'Lunes a Sábados 08:00 a 20:00 (Guardia Pasiva)',
    descripcion: 'Institución médica privada equipada con modernas salas de consulta, servicio de diagnóstico por imágenes, quirófanos ambulatorios y convenios con todas las obras sociales y prepagas.',
    equipamiento: ['Ecografía 4D & Doppler', 'Cardiología Integral', 'Cirugía Menor', 'Quirófano Ambulatorio', 'Obras Sociales'],
    guardia24hs: true,
  },
  {
    id: 'c2',
    nombre: 'Dispensario Municipal San Pantaleón',
    tipo: 'Atención Primaria de la Salud (CAPS)',
    badge: 'Atención Barrial Municipal',
    fotoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    ],
    direccion: 'Barrio Centro, Calle San Martín 820, Cruz del Eje',
    telefono: '03549-423500',
    horario: 'Lunes a Viernes 07:00 a 19:00',
    descripcion: 'Centro de atención primaria barrial de la Municipalidad de Cruz del Eje. Enfoque en vacunación, control del niño sano, clínica médica y entrega gratuita de medicamentos esenciales.',
    equipamiento: ['Vacunatorio Oficial', 'Control Pediátrico', 'Enfermería Continua', 'Salud Comunitaria', '100% Gratuito'],
    guardia24hs: false,
  },
  {
    id: 'c4',
    nombre: 'Consultorios Médicos del Valle',
    tipo: 'Consultorios de Especialistas',
    badge: 'Consultorios Ambulatorios',
    fotoUrl: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1000&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    ],
    direccion: 'Mitre 125, Cruz del Eje',
    telefono: '03549-424010',
    horario: 'Lunes a Viernes 09:00 a 18:00',
    descripcion: 'Espacio médico integrado donde atienden especialistas en cardiología, oftalmología, traumatología y dermatología con atención personalizada y turnos programados.',
    equipamiento: ['Oftalmología Digital', 'Dermatoscopía', 'Electrocardiografía', 'Turnos Puntuales'],
    guardia24hs: false,
  },
];

export const CentrosInteractiveShowcase: React.FC = () => {
  const [selectedCentroId, setSelectedCentroId] = useState<string>('c1');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const selectedCentro = CENTROS_SHOWCASE.find((c) => c.id === selectedCentroId) || CENTROS_SHOWCASE[0];

  const handleSelectCentro = (id: string) => {
    setSelectedCentroId(id);
    setActivePhotoIdx(0);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background via-teal-500/5 to-background border-b border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Cabecera de la Sección */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-xs font-bold text-teal-700 shadow-xs">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span>Infraestructura Sanitaria de Cruz del Eje</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
            Galería Interactiva de Hospitales y Clínicas
          </h2>
          <p className="text-sm text-muted-foreground">
            Conoce las instalaciones, sedes y equipamiento médico disponible en nuestra ciudad.
          </p>
        </div>

        {/* Pestañas / Selector de Centros */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {CENTROS_SHOWCASE.map((centro) => {
            const isSelected = centro.id === selectedCentroId;
            return (
              <button
                key={centro.id}
                onClick={() => handleSelectCentro(centro.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 scale-[1.03]'
                    : 'bg-card border border-border text-muted-foreground hover:border-teal-500/50 hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>{centro.nombre.replace('Provincial Aurelio Crespo', 'Aurelio Crespo')}</span>
                {centro.guardia24hs && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                  }`}>
                    24hs
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel Interactivo: Foto Grande + Detalles y Miniaturas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl border border-teal-100/80 bg-card p-6 sm:p-8 shadow-xl">
          {/* Columna Izquierda: Visor de Fotos con Miniaturas */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-border shadow-md aspect-video group">
              <img
                src={selectedCentro.galeria[activePhotoIdx] || selectedCentro.fotoUrl}
                alt={selectedCentro.nombre}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="inline-block self-start rounded-full bg-teal-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white mb-1 shadow-sm">
                  {selectedCentro.badge}
                </span>
                <h3 className="text-xl font-bold font-heading">{selectedCentro.nombre}</h3>
                <p className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                  <span>{selectedCentro.direccion}</span>
                </p>
              </div>
            </div>

            {/* Miniaturas de la Galería */}
            <div className="flex items-center gap-3 pt-1">
              {selectedCentro.galeria.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative h-16 w-24 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                    activePhotoIdx === idx
                      ? 'border-teal-600 ring-2 ring-teal-500/40 scale-105'
                      : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <span className="text-[11px] text-muted-foreground ml-auto font-medium">
                Foto {activePhotoIdx + 1} de {selectedCentro.galeria.length}
              </span>
            </div>
          </div>

          {/* Columna Derecha: Información Detallada, Equipamiento y Botones */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-extrabold text-teal-600 uppercase tracking-wider">
                  {selectedCentro.tipo}
                </span>
                <h3 className="text-2xl font-bold font-heading text-foreground">
                  {selectedCentro.nombre}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selectedCentro.descripcion}
              </p>

              {/* Datos Rápidos */}
              <div className="space-y-2 rounded-2xl bg-muted/40 p-4 text-xs border border-border/80">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-foreground"><strong>Ubicación:</strong> {selectedCentro.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600 shrink-0" />
                  <span className="text-foreground"><strong>Teléfono:</strong> {selectedCentro.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                  <span className="text-foreground"><strong>Horario:</strong> {selectedCentro.horario}</span>
                </div>
              </div>

              {/* Equipamiento y Servicios Destacados */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Servicios y Equipamiento:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCentro.equipamiento.map((eq, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 text-[11px] font-bold text-teal-800"
                    >
                      <ShieldCheck className="h-3 w-3 text-teal-600" />
                      <span>{eq}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Botón de Acción Directo */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Link
                to="/turnero"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:scale-[1.02] transition"
              >
                <Calendar className="h-4 w-4" />
                <span>Sacar Turno en este Centro</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
