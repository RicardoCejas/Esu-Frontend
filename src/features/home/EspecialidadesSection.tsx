import React from 'react';
import {
  Stethoscope,
  Baby,
  HeartPulse,
  Bone,
  Sparkles,
  Eye,
  Sun,
  Activity,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import type { Especialidad, Profesional } from '@/types';

export interface SpecialtyVisualConfig {
  Icon: React.ComponentType<{ className?: string }>;
  iconContainer: string;
  badgeClass: string;
  badgeLabel: string;
  actionHover: string;
  arrowHover: string;
}

export const getSpecialtyDesign = (id: string, nombre: string): SpecialtyVisualConfig => {
  const lower = nombre.toLowerCase();

  // 1. Clínica Médica
  if (id === 'e1' || lower.includes('clínica') || lower.includes('general')) {
    return {
      Icon: Stethoscope,
      iconContainer: 'bg-emerald-100 text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeLabel: 'Atención Primaria',
      actionHover: 'group-hover:text-emerald-600',
      arrowHover: 'group-hover:text-emerald-600',
    };
  }

  // 2. Pediatría
  if (id === 'e2' || lower.includes('pediatr')) {
    return {
      Icon: Baby,
      iconContainer: 'bg-amber-100 text-amber-600',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeLabel: 'Salud Infantil',
      actionHover: 'group-hover:text-amber-600',
      arrowHover: 'group-hover:text-amber-600',
    };
  }

  // 3. Cardiología
  if (id === 'e3' || lower.includes('cardio')) {
    return {
      Icon: HeartPulse,
      iconContainer: 'bg-rose-100 text-rose-600',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeLabel: 'Cardiología & ECG',
      actionHover: 'group-hover:text-rose-600',
      arrowHover: 'group-hover:text-rose-600',
    };
  }

  // 4. Traumatología
  if (id === 'e4' || lower.includes('trauma') || lower.includes('ortop')) {
    return {
      Icon: Bone,
      iconContainer: 'bg-blue-100 text-blue-600',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeLabel: 'Huesos & Articulaciones',
      actionHover: 'group-hover:text-blue-600',
      arrowHover: 'group-hover:text-blue-600',
    };
  }

  // 5. Ginecología
  if (id === 'e5' || lower.includes('gineco') || lower.includes('obstetr')) {
    return {
      Icon: Sparkles,
      iconContainer: 'bg-pink-100 text-pink-600',
      badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
      badgeLabel: 'Salud Femenina',
      actionHover: 'group-hover:text-pink-600',
      arrowHover: 'group-hover:text-pink-600',
    };
  }

  // 6. Oftalmología
  if (id === 'e6' || lower.includes('oftalmo')) {
    return {
      Icon: Eye,
      iconContainer: 'bg-teal-100 text-teal-600',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      badgeLabel: 'Salud Visual',
      actionHover: 'group-hover:text-teal-600',
      arrowHover: 'group-hover:text-teal-600',
    };
  }

  // 7. Dermatología
  if (id === 'e7' || lower.includes('derma')) {
    return {
      Icon: Sun,
      iconContainer: 'bg-orange-100 text-orange-600',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      badgeLabel: 'Dermatología & Piel',
      actionHover: 'group-hover:text-orange-600',
      arrowHover: 'group-hover:text-orange-600',
    };
  }

  // Por defecto
  return {
    Icon: Activity,
    iconContainer: 'bg-sky-100 text-sky-600',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeLabel: 'Especialidad Médica',
    actionHover: 'group-hover:text-sky-600',
    arrowHover: 'group-hover:text-sky-600',
  };
};

interface EspecialidadesSectionProps {
  especialidades: Especialidad[];
  profesionales?: Profesional[];
  onSelectSpecialty: (especialidad: Especialidad) => void;
}

export const EspecialidadesSection: React.FC<EspecialidadesSectionProps> = ({
  especialidades,
  profesionales = [],
  onSelectSpecialty,
}) => {
  return (
    <section id="especialidades" className="py-16 bg-[#edf5fa]/50 border-t border-sky-200/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Encabezado de la Sección */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Cartilla Médica y Sedes
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight font-heading text-gray-900 mt-1">
              Especialidades Médicas
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Explora nuestra red de especialistas en Cruz del Eje. Consulta disponibilidad, médicos matriculados y centros de atención en tiempo real.
            </p>
          </div>

          <a
            href="/turnero"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors shrink-0"
          >
            <span>Ver agenda completa</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Grilla Responsive de Tarjetas: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {especialidades.map((esp) => {
            const design = getSpecialtyDesign(esp.id, esp.nombre);
            const IconComponent = design.Icon;
            const medicosAsociados = profesionales.filter((p) => p.especialidadId === esp.id).length;

            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => onSelectSpecialty(esp)}
                className="group relative flex flex-col justify-between text-left rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <div>
                  {/* Fila Superior: Icono Duotono Soft + Badge de Categoría */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    {/* Contenedor del Icono Cuadrado con Esquinas Redondeadas (rounded-xl) */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shrink-0 ${design.iconContainer}`}
                    >
                      <IconComponent className="h-6 w-6 stroke-[2.2]" />
                    </div>

                    {/* Badge de Categoría Pequeño con Fondo Suave */}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border ${design.badgeClass}`}
                    >
                      {design.badgeLabel}
                    </span>
                  </div>

                  {/* Título de la Especialidad */}
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-gray-950 transition-colors leading-snug">
                    {esp.nombre}
                  </h3>

                  {/* Breve Descripción del Servicio */}
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {esp.descripcion}
                  </p>
                </div>

                {/* Footer de Tarjeta: Enlace / Botón sutil con flecha */}
                <div className="mt-5 pt-4 border-t border-gray-100/90 flex items-center justify-between w-full">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 transition-colors ${design.actionHover}`}
                  >
                    <span>Ver médicos y sedes</span>
                    <ChevronRight
                      className={`h-4 w-4 text-gray-400 transition-all duration-200 group-hover:translate-x-1 ${design.arrowHover}`}
                    />
                  </span>

                  {medicosAsociados > 0 && (
                    <span className="text-[11px] font-medium text-gray-400">
                      {medicosAsociados} {medicosAsociados === 1 ? 'médico' : 'médicos'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
