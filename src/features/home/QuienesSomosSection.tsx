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
    <section id="quienes-somos" className="relative py-14 sm:py-16 bg-slate-50 border-t border-slate-200 scroll-mt-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
            ¿Quiénes Somos en <span className="text-sky-700">Luvia</span>?
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            <strong>Luvia (Tu Salud, Unificada)</strong> es una plataforma de articulación sanitaria creada para conectar a toda la comunidad de <strong>Cruz del Eje</strong> con su red de salud pública y privada en tiempo real.
          </p>
        </div>

        {/* Narrative & Direct Access Box */}
        <div className="max-w-4xl mx-auto mb-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs text-center space-y-5">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-snug">
            Un solo lugar para cuidar la salud de tu familia, sin filas ni demoras.
          </h3>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Históricamente, los vecinos de Cruz del Eje debían acudir presencialmente de madrugada a cada hospital, dispensario o clínica para consultar disponibilidad. Con <strong>Luvia</strong>, unificamos la agenda para que puedas conocer qué turnos hay disponibles y asegurar tu consulta desde tu celular.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/turnero"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-sky-700 px-8 py-4 text-base sm:text-lg font-bold text-white shadow-md hover:bg-sky-800 hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
            >
              <Calendar className="h-5 w-5" />
              <span>Sacar Turno Ahora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* 4 Pillars Grid with Solid Professional Clinical Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pilar 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
            <Building2 className="h-6 w-6 text-sky-700 mb-3" />
            <h4 className="text-base font-bold text-slate-900 font-heading mb-1.5">
              Red Integrada
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integramos en una misma red al hospital provincial, sanatorios privados y dispensarios barriales para que no pierdas tiempo.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
            <ShieldCheck className="h-6 w-6 text-teal-700 mb-3" />
            <h4 className="text-base font-bold text-slate-900 font-heading mb-1.5">
              Historia Clínica Única
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tus estudios, diagnósticos y recetas se archivan digitalmente para que cualquier médico autorizado pueda asistirte de inmediato.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
            <HeartPulse className="h-6 w-6 text-rose-700 mb-3" />
            <h4 className="text-base font-bold text-slate-900 font-heading mb-1.5">
              Atención Descentralizada
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consultas y turnos disponibles en centros de atención primaria barriales y hospitales de cabecera regional.
            </p>
          </div>

          {/* Pilar 4 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
            <Users className="h-6 w-6 text-slate-700 mb-3" />
            <h4 className="text-base font-bold text-slate-900 font-heading mb-1.5">
              Articulación Sanitaria
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Coordinación transparente entre prestadores públicos y privados para optimizar la atención de Cruz del Eje.
            </p>
          </div>
        </div>

        {/* Counter Stats Banner */}
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="block text-3xl font-extrabold text-sky-800 font-heading">
                6
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Centros Efectores
              </span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-sky-800 font-heading">
                +10
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Especialidades
              </span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-sky-800 font-heading">
                100%
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Digital y Online
              </span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-sky-800 font-heading">
                0
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Costo de Emisión
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
