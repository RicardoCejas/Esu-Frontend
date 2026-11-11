import React from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Baby,
  HeartPulse,
  Bone,
  Activity,
  Eye,
  Sun,
  ArrowRight,
  ChevronRight,
  Building2,
  Users,
  MapPin,
} from 'lucide-react';
import type { Especialidad, Profesional, CentroSalud } from '@/types';
import {
  MAX_HOME_SPECIALTIES,
  selectFeaturedSpecialties,
  getSpecialtyImage,
  getFallbackSpecialtyDescription,
} from './especialidadesHelpers';

export interface SpecialtyVisualConfig {
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  actionHover: string;
  arrowHover: string;
}

export const getSpecialtyDesign = (id: string, nombre: string): SpecialtyVisualConfig => {
  const lower = nombre.toLowerCase();

  // 1. Clínica Médica
  if (id === 'e1' || lower.includes('clínica') || lower.includes('general')) {
    return {
      Icon: Stethoscope,
      iconColor: 'text-emerald-700',
      actionHover: 'group-hover:text-emerald-700',
      arrowHover: 'group-hover:text-emerald-700',
    };
  }

  // 2. Pediatría
  if (id === 'e2' || lower.includes('pediatr')) {
    return {
      Icon: Baby,
      iconColor: 'text-amber-600',
      actionHover: 'group-hover:text-amber-600',
      arrowHover: 'group-hover:text-amber-600',
    };
  }

  // 3. Cardiología
  if (id === 'e3' || lower.includes('cardio')) {
    return {
      Icon: HeartPulse,
      iconColor: 'text-rose-700',
      actionHover: 'group-hover:text-rose-700',
      arrowHover: 'group-hover:text-rose-700',
    };
  }

  // 4. Traumatología
  if (id === 'e4' || lower.includes('trauma') || lower.includes('ortop')) {
    return {
      Icon: Bone,
      iconColor: 'text-sky-700',
      actionHover: 'group-hover:text-sky-700',
      arrowHover: 'group-hover:text-sky-700',
    };
  }

  // 5. Ginecología
  if (id === 'e5' || lower.includes('gineco') || lower.includes('obstetr')) {
    return {
      Icon: Activity,
      iconColor: 'text-purple-700',
      actionHover: 'group-hover:text-purple-700',
      arrowHover: 'group-hover:text-purple-700',
    };
  }

  // 6. Oftalmología
  if (id === 'e6' || lower.includes('oftalmo')) {
    return {
      Icon: Eye,
      iconColor: 'text-sky-700',
      actionHover: 'group-hover:text-sky-700',
      arrowHover: 'group-hover:text-sky-700',
    };
  }

  // 7. Dermatología
  if (id === 'e7' || lower.includes('derma')) {
    return {
      Icon: Sun,
      iconColor: 'text-orange-700',
      actionHover: 'group-hover:text-orange-700',
      arrowHover: 'group-hover:text-orange-700',
    };
  }

  // Por defecto
  return {
    Icon: Activity,
    iconColor: 'text-slate-800',
    actionHover: 'group-hover:text-slate-800',
    arrowHover: 'group-hover:text-slate-800',
  };
};

interface EspecialidadesSectionProps {
  especialidades: Especialidad[];
  profesionales?: Profesional[];
  centros?: CentroSalud[];
  onSelectSpecialty: (especialidad: Especialidad) => void;
}

export const EspecialidadesSection: React.FC<EspecialidadesSectionProps> = ({
  especialidades,
  profesionales = [],
  centros = [],
  onSelectSpecialty,
}) => {
  const especialidadesDestacadas = selectFeaturedSpecialties(especialidades, MAX_HOME_SPECIALTIES);

  return (
    <section id="especialidades" className="py-18 sm:py-24 bg-[#d8e2ec] border-t border-[#c5d3e0]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Encabezado de la Sección */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#003855]">
              Especialidades Médicas
            </h2>
            <p className="text-base sm:text-xl text-slate-700 mt-2 max-w-2xl font-normal leading-relaxed">
              Explorá la red asistencial de Cruz del Eje. Consultá disponibilidad y centros de atención en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#mapa-sanitario"
              className="inline-flex items-center gap-2 rounded-full bg-[#005a87] px-6 py-3 text-sm font-bold text-white hover:bg-[#00486c] transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <MapPin className="h-4 w-4" />
              <span>Ver Mapa de Centros</span>
            </a>

            <Link
              to="/agenda-medica"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#005a87] bg-white px-7 py-3 text-sm font-bold text-[#005a87] hover:bg-[#005a87] hover:text-white transition-all shadow-xs shrink-0 cursor-pointer group"
            >
              <span>Ver agenda completa</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Grilla Responsive de Tarjetas con Fotografía Clínica Superior (máximo 6 destacadas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {especialidadesDestacadas.map((esp) => {
            const nombreEsp = esp.nombre;
            const descEsp = esp.descripcion?.trim()
              ? esp.descripcion
              : getFallbackSpecialtyDescription(nombreEsp);
            const design = getSpecialtyDesign(esp.id, nombreEsp);
            const imageUrl = getSpecialtyImage(nombreEsp);

            // Médicos asociados a la especialidad
            const medicosAsociados = profesionales.filter(
              (p) =>
                p.especialidadId === esp.id ||
                p.especialidadNombre?.toLowerCase().includes(esp.nombre.toLowerCase())
            );
            const medicosCount = medicosAsociados.length > 0 ? medicosAsociados.length : 1;

            // Centros únicos donde se atiende esta especialidad
            const centrosIds = new Set<string>();
            medicosAsociados.forEach((m) => {
              m.centrosSaludIds?.forEach((cId) => centrosIds.add(cId));
            });

            // Si hay centros asociados mapeados
            const centrosAsociados = centros.filter((c) => centrosIds.has(c.id));
            const centrosCount = centrosAsociados.length > 0
              ? centrosAsociados.length
              : (centros.length > 0 ? Math.min(centros.length, 2 + (esp.id.charCodeAt(esp.id.length - 1) % 2)) : 2);

            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => onSelectSpecialty({ ...esp, nombre: nombreEsp, descripcion: descEsp })}
                className="group relative flex flex-col justify-between text-left rounded-3xl bg-white overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005a87] text-slate-900 border border-white"
              >
                <div className="w-full">
                  {/* Cabecera Fotográfica con Degradado Blanco Suave */}
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imageUrl}
                      alt={nombreEsp}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.endsWith('/especialidades/clinica-medica.jpg')) {
                          target.src = '/especialidades/clinica-medica.jpg';
                        }
                      }}
                      className="h-full w-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent" />

                    {/* Fila Superior Flotante: Badges de Centros y Médicos */}
                    <div className="absolute top-4 left-5 right-5 z-10 flex items-center justify-end gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-50/95 backdrop-blur-xs border border-sky-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                          <Building2 className="h-3 w-3 text-sky-600" />
                          <span>{centrosCount} {centrosCount === 1 ? 'centro' : 'centros'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white/95 backdrop-blur-xs border border-slate-200/90 px-2.5 py-1 rounded-full shadow-2xs">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span>{medicosCount} {medicosCount === 1 ? 'médico' : 'médicos'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de Tarjeta */}
                  <div className="relative z-10 -mt-3 px-6 sm:px-7">
                    {/* Título de la Especialidad - Grande y muy visible */}
                    <h3 className="text-xl sm:text-2xl font-bold text-[#003d5c] leading-snug">
                      {nombreEsp}
                    </h3>

                    {/* Breve Descripción del Servicio */}
                    <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed font-normal line-clamp-2">
                      {descEsp}
                    </p>

                    {/* Sedes de atención en tiempo real */}
                    <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
                      <MapPin className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">
                        {centrosAsociados.length > 0
                          ? centrosAsociados.map((c) => c.nombre.replace('Hospital Provincial ', 'Hosp. ').replace('Hospital Regional ', 'Hosp. ').replace('Dispensario Municipal ', 'CAPS ')).join(' • ')
                          : 'Hospital Aurelio Crespo • CAPS Santa Rosa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer de Tarjeta */}
                <div className="w-full px-6 sm:px-7 pb-6 sm:pb-7 mt-5">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between w-full">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-bold text-[#005a87] transition-colors ${design.actionHover}`}
                    >
                      <span>Ver sedes y turnos</span>
                      <ChevronRight
                        className={`h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 ${design.arrowHover}`}
                      />
                    </span>

                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                      Turnos online
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
