import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HeartPulse,
  Users,
  Building2,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react';

export const QuienesSomosSection: React.FC = () => {
  return (
    <section id="quienes-somos" className="relative py-16 sm:py-20 bg-gradient-to-b from-[#edf5fa] via-[#e2eef7] to-[#edf5fa] overflow-hidden border-t border-sky-200/60 scroll-mt-14">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 -z-10 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-100/90 px-4 py-1.5 text-xs font-bold text-sky-800 shadow-xs">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <span>Institucional • Cruz del Eje, Córdoba</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
            ¿Quiénes Somos en <span className="text-sky-700">Luvia</span>?
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            <strong>Luvia (Tu Salud, Unificada)</strong> es una plataforma de articulación sanitaria creada para conectar a toda la comunidad de <strong>Cruz del Eje</strong> con su red de salud pública y privada en tiempo real.
          </p>
        </div>

        {/* Narrative & Direct Access Box */}
        <div className="max-w-4xl mx-auto mb-14 rounded-3xl border border-sky-200/90 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50/60 p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg bg-sky-100/90 px-3.5 py-1 text-xs font-bold text-sky-800 border border-sky-200">
            <Award className="h-4 w-4 text-sky-600" />
            <span>Compromiso Sanitario Regional</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-snug">
            Un solo lugar para cuidar la salud de tu familia, sin filas ni demoras.
          </h3>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Históricamente, los vecinos de Cruz del Eje debían acudir presencialmente de madrugada a cada hospital, dispensario o clínica para consultar disponibilidad. Con <strong>Luvia</strong>, unificamos la agenda para que puedas conocer qué médico atiende hoy y asegurar tu turno desde tu celular en 5 pasos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-left">
            <div className="flex items-start gap-2 bg-sky-50/70 p-3 rounded-xl border border-sky-200/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Padrón asistencial integrado
              </span>
            </div>
            <div className="flex items-start gap-2 bg-sky-50/70 p-3 rounded-xl border border-sky-200/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Historia Clínica Digital
              </span>
            </div>
            <div className="flex items-start gap-2 bg-sky-50/70 p-3 rounded-xl border border-sky-200/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Recetas con código QR
              </span>
            </div>
            <div className="flex items-start gap-2 bg-sky-50/70 p-3 rounded-xl border border-sky-200/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Guardia coordinada 24hs
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/turnero"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-700 hover:to-teal-700 hover:scale-[1.02] transition-all"
            >
              <Calendar className="h-4 w-4" />
              <span>Sacar Turno Ahora</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/profesionales"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/90 px-5 py-3 text-xs font-bold text-sky-800 hover:bg-sky-50 transition shadow-xs"
            >
              <Users className="h-4 w-4 text-sky-600" />
              <span>Ver Nuestros Médicos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Pillars Grid with Soft Pastel Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pilar 1 */}
          <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:border-sky-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-gray-900 font-heading mb-1.5">
              Red Integrada
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Integramos en una misma red al hospital provincial, sanatorios privados y dispensarios barriales para que no pierdas tiempo.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:border-teal-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-gray-900 font-heading mb-1.5">
              Historia Clínica Única
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tus estudios, diagnósticos y recetas se archivan digitalmente para que cualquier médico autorizado pueda asistirte de inmediato.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:border-rose-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-4 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-gray-900 font-heading mb-1.5">
              Guardia 24/7 y 107
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Información al instante de teléfonos de emergencia y guardia activa hospitalaria con triage médico permanente.
            </p>
          </div>

          {/* Pilar 4 */}
          <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-gray-900 font-heading mb-1.5">
              Médicos de Confianza
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Profesionales matriculados radicados en Cruz del Eje que conocen a nuestra comunidad y brindan un trato cercano y profesional.
            </p>
          </div>
        </div>

        {/* Counter Stats Banner */}
        <div className="mt-12 rounded-3xl border border-sky-200/90 bg-gradient-to-r from-sky-100/90 via-[#f0f7fc] to-cyan-100/90 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-sky-800 font-heading">
                +14
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Médicos Matriculados
              </span>
            </div>
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-sky-800 font-heading">
                6
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Centros y Efectores
              </span>
            </div>
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-sky-800 font-heading">
                24hs
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Guardia y Urgencias
              </span>
            </div>
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-sky-800 font-heading">
                100%
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gratuito y Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
