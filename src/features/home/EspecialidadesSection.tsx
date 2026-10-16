import React from 'react';
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
} from 'lucide-react';
import type { Especialidad, Profesional } from '@/types';

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
      iconColor: 'text-teal-700',
      actionHover: 'group-hover:text-teal-700',
      arrowHover: 'group-hover:text-teal-700',
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
  onSelectSpecialty: (especialidad: Especialidad) => void;
}

export const EspecialidadesSection: React.FC<EspecialidadesSectionProps> = ({
  especialidades,
  profesionales = [],
  onSelectSpecialty,
}) => {
  return (
    <section id="especialidades" className="py-14 sm:py-16 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Encabezado de la Sección */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight font-heading text-slate-900">
              Especialidades Médicas
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Explorá la red asistencial de Cruz del Eje. Consultá disponibilidad y centros de atención en tiempo real.
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

        {/* Grilla Responsive de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {especialidades.map((esp) => {
            const design = getSpecialtyDesign(esp.id, esp.nombre);
            const IconComponent = design.Icon;
            const medicosAsociados = profesionales.filter((p) => p.especialidadId === esp.id).length;

            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => onSelectSpecialty(esp)}
                className="group relative flex flex-col justify-between text-left rounded-xl bg-white border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <div>
                  {/* Fila Superior: Icono semántico directo */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <IconComponent className={`h-6 w-6 stroke-[2.2] shrink-0 ${design.iconColor}`} />
                  </div>

                  {/* Título de la Especialidad */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {esp.nombre}
                  </h3>

                  {/* Breve Descripción del Servicio */}
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {esp.descripcion}
                  </p>
                </div>

                {/* Footer de Tarjeta */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between w-full">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold text-slate-700 transition-colors ${design.actionHover}`}
                  >
                    <span>Ver sedes y turnos</span>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 ${design.arrowHover}`}
                    />
                  </span>

                  {medicosAsociados > 0 && (
                    <span className="text-[11px] font-medium text-slate-500">
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
