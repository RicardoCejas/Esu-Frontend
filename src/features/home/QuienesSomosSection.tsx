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
  Award,
} from 'lucide-react';

export const QuienesSomosSection: React.FC = () => {
  return (
    <section id="quienes-somos" className="relative py-16 sm:py-20 bg-slate-50 border-t border-slate-200 scroll-mt-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-100 px-4 py-1.5 text-xs font-bold text-sky-900">
            <ShieldCheck className="h-4 w-4 text-sky-700" />
            <span>Institucional • Cruz del Eje, Córdoba</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
            ¿Quiénes Somos en <span className="text-sky-700">ESU</span>?
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            El <strong>Ecosistema de Salud Unificado (ESU)</strong> es una plataforma de articulación sanitaria creada para conectar a toda la comunidad de <strong>Cruz del Eje</strong> con su red de salud pública y privada en tiempo real.
          </p>
        </div>

        {/* Narrative & Direct Access Box */}
        <div className="max-w-4xl mx-auto mb-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-800 border border-slate-200">
            <Award className="h-4 w-4 text-sky-700" />
            <span>Compromiso Sanitario Regional</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-snug">
            Un solo lugar para cuidar la salud de tu familia, sin filas ni demoras.
          </h3>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Históricamente, los vecinos de Cruz del Eje debían acudir presencialmente de madrugada a cada hospital, dispensario o clínica para consultar disponibilidad. Con <strong>ESU</strong>, unificamos la agenda para que puedas conocer qué médico atiende hoy y asegurar tu turno desde tu celular en 5 pasos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-left">
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Padrón asistencial integrado
              </span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Historia Clínica Digital
              </span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Recetas con código QR
              </span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800">
                Guardia coordinada 24hs
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/turnero"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 px-6 py-3 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Calendar className="h-4 w-4" />
              <span>Sacar Turno Ahora</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/profesionales"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-xs"
            >
              <Users className="h-4 w-4 text-sky-700" />
              <span>Ver Nuestros Médicos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pilar 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-sky-400 hover:shadow-md transition-all">
            <div className="text-sky-700 mb-4">
              <Building2 className="h-7 w-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 font-heading mb-2">
              Red Integrada
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integramos en una misma red al hospital provincial, sanatorios privados y dispensarios barriales para que no pierdas tiempo.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-sky-400 hover:shadow-md transition-all">
            <div className="text-sky-700 mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 font-heading mb-2">
              Historia Clínica Única
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tus estudios, diagnósticos y recetas se archivan digitalmente para que cualquier médico autorizado pueda asistirte de inmediato.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-rose-400 hover:shadow-md transition-all">
            <div className="text-rose-700 mb-4">
              <HeartPulse className="h-7 w-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 font-heading mb-2">
              Guardia 24/7 y 107
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Información al instante de teléfonos de emergencia y guardia activa hospitalaria con triage médico permanente.
            </p>
          </div>

          {/* Pilar 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all">
            <div className="text-emerald-700 mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 font-heading mb-2">
              Médicos de Confianza
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Profesionales matriculados radicados en Cruz del Eje que conocen a nuestra comunidad y brindan un trato cercano y profesional.
            </p>
          </div>
        </div>

        {/* Counter Stats Banner */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
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
