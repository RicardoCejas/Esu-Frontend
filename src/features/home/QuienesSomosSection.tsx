import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HeartPulse,
  Users,
  Building2,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const QuienesSomosSection: React.FC = () => {
  return (
    <section id="quienes-somos" className="relative py-16 sm:py-24 bg-white border-t border-slate-200 scroll-mt-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading text-[#003855] leading-tight">
            ¿Quiénes Somos en <span className="text-[#005a87]">Luvia</span>?
          </h2>

          <p className="text-base sm:text-xl text-slate-700 leading-relaxed font-medium">
            <strong>Luvia (Tu Salud, Unificada)</strong> es una plataforma de articulación sanitaria creada para conectar a toda la comunidad de <strong>Cruz del Eje</strong> con su red de salud pública y privada en tiempo real.
          </p>
        </div>

        {/* Narrative & Direct Access Box con gris azulado marcado */}
        <div className="max-w-4xl mx-auto mb-14 rounded-3xl border border-[#c5d3e0] bg-[#d8e2ec] p-8 sm:p-12 shadow-sm text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#003d5c] font-heading leading-snug">
            Un solo lugar para cuidar la salud de tu familia, sin filas ni demoras.
          </h3>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto font-normal">
            Históricamente, los vecinos de Cruz del Eje debían acudir presencialmente de madrugada a cada hospital, dispensario o clínica para consultar disponibilidad. Con <strong>Luvia</strong>, unificamos la agenda para que puedas conocer qué turnos hay disponibles y asegurar tu consulta desde tu celular.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/turnero"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#005a87] px-9 py-4 text-base sm:text-lg font-bold text-white shadow-md hover:bg-[#00486c] hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
            >
              <Calendar className="h-5 w-5" />
              <span>Sacar Turno Ahora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* 4 Pillars Grid with Solid Professional Clinical Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pilar 1 */}
          <div className="rounded-2xl border border-[#c5d3e0] bg-white p-7 shadow-xs transition-all hover:border-[#005a87] hover:shadow-lg">
            <Building2 className="h-9 w-9 text-[#005a87] mb-4" />
            <h4 className="text-lg sm:text-xl font-bold text-[#003d5c] font-heading mb-2">
              Red Integrada
            </h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              Integramos en una misma red al hospital provincial, sanatorios privados y dispensarios barriales para que no pierdas tiempo.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="rounded-2xl border border-[#c5d3e0] bg-white p-7 shadow-xs transition-all hover:border-[#005a87] hover:shadow-lg">
            <ShieldCheck className="h-9 w-9 text-[#005a87] mb-4" />
            <h4 className="text-lg sm:text-xl font-bold text-[#003d5c] font-heading mb-2">
              Historia Clínica Única
            </h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              Tus estudios, diagnósticos y recetas se archivan digitalmente para que cualquier médico autorizado pueda asistirte de inmediato.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="rounded-2xl border border-[#c5d3e0] bg-white p-7 shadow-xs transition-all hover:border-[#005a87] hover:shadow-lg">
            <HeartPulse className="h-9 w-9 text-rose-600 mb-4" />
            <h4 className="text-lg sm:text-xl font-bold text-[#003d5c] font-heading mb-2">
              Atención Descentralizada
            </h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              Consultas y turnos disponibles en centros de atención primaria barriales y hospitales de cabecera regional.
            </p>
          </div>

          {/* Pilar 4 */}
          <div className="rounded-2xl border border-[#c5d3e0] bg-white p-7 shadow-xs transition-all hover:border-[#005a87] hover:shadow-lg">
            <Users className="h-9 w-9 text-[#005a87] mb-4" />
            <h4 className="text-lg sm:text-xl font-bold text-[#003d5c] font-heading mb-2">
              Articulación Sanitaria
            </h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              Coordinación transparente entre prestadores públicos y privados para optimizar la atención de Cruz del Eje.
            </p>
          </div>
        </div>

        {/* Counter Stats Banner con gris azulado marcado */}
        <div className="mt-12 rounded-3xl border border-[#c5d3e0] bg-[#d8e2ec] p-8 sm:p-10 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="block text-4xl sm:text-5xl font-extrabold text-[#005a87] font-heading">
                6
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-700 mt-1 block">
                Centros Efectores
              </span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-extrabold text-[#005a87] font-heading">
                +10
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-700 mt-1 block">
                Especialidades
              </span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-extrabold text-[#005a87] font-heading">
                100%
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-700 mt-1 block">
                Digital y Online
              </span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-extrabold text-[#005a87] font-heading">
                0
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-700 mt-1 block">
                Costo de Emisión
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
