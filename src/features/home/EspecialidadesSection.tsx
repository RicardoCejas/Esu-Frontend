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
  onSelectSpecialty: (especialidad: Especialidad) => void;
}

export const EspecialidadesSection: React.FC<EspecialidadesSectionProps> = ({
  especialidades,
  profesionales = [],
  onSelectSpecialty,
}) => {
  return (
    <section id="especialidades" className="py-18 sm:py-24 bg-[#d8e2ec] border-t border-[#c5d3e0]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Encabezado de la Sección */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading text-[#003855]">
              Especialidades Médicas
            </h2>
            <p className="text-base sm:text-xl text-slate-700 mt-2 max-w-2xl font-normal leading-relaxed">
              Explorá la red asistencial de Cruz del Eje. Consultá disponibilidad y centros de atención en tiempo real.
            </p>
          </div>

          <a
            href="/turnero"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#005a87] bg-white px-7 py-3 text-sm font-bold text-[#005a87] hover:bg-slate-50 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Ver agenda completa</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Grilla Responsive de Tarjetas con letra grande y clara */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {especialidades.map((esp) => {
            const isClinica = esp.nombre.toLowerCase().includes('clinica');
            const nombreEsp = isClinica ? 'Traumatología' : esp.nombre;
            const descEsp = isClinica ? 'Diagnóstico y tratamiento de lesiones óseas, articulares y musculares.' : esp.descripcion;
            const design = getSpecialtyDesign(esp.id, nombreEsp);
            const IconComponent = design.Icon;
            const medicosAsociados = profesionales.filter((p) => p.especialidadId === esp.id).length;

            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => onSelectSpecialty({ ...esp, nombre: nombreEsp, descripcion: descEsp })}
                className="group relative flex flex-col justify-between text-left rounded-3xl bg-white p-7 sm:p-8 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005a87] text-slate-900 border border-white"
              >
                <div>
                  {/* Fila Superior: Icono semántico directo más grande */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <IconComponent className={`h-8 w-8 stroke-[2.2] shrink-0 ${design.iconColor}`} />
                  </div>

                  {/* Título de la Especialidad - Grande y muy visible */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#003d5c] font-heading leading-snug">
                    {nombreEsp}
                  </h3>

                  {/* Breve Descripción del Servicio - Letra clara y cómoda */}
                  <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed font-normal line-clamp-2">
                    {descEsp}
                  </p>
                </div>

                {/* Footer de Tarjeta */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between w-full">
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-bold text-[#005a87] transition-colors ${design.actionHover}`}
                  >
                    <span>Ver sedes y turnos</span>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 ${design.arrowHover}`}
                    />
                  </span>

                  {medicosAsociados > 0 && (
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
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
