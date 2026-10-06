import { MapPin, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden border-t border-teal-800/40 bg-gradient-to-b from-slate-900 via-teal-950 to-slate-950 text-slate-100">
      {/* Glow de Fondo */}
      <div className="absolute top-0 right-1/4 -z-0 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Info Principal (Columna Grande) */}
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="Luvia Logo" className="h-12 w-12 object-contain" />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                  Luvia <span className="text-teal-400">Cruz del Eje</span>
                </span>
                <p className="text-[11px] text-teal-200/80 font-medium">Tu Salud, Unificada</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Plataforma integral de salud que centraliza la gestión de turnos, historias clínicas y recetas electrónicas para toda la comunidad de Cruz del Eje y la región noroeste de Córdoba.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-[11px] font-bold text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Red de Salud Pública y Privada</span>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-sm text-teal-300 font-heading uppercase tracking-wider text-[11px]">
              Servicios al Paciente
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/turnero" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>Solicitar Turno Online</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard/paciente" className="hover:text-teal-400 transition-colors">
                  Consultar Mis Turnos
                </Link>
              </li>
              <li>
                <Link to="/dashboard/paciente" className="hover:text-teal-400 transition-colors">
                  Historia Clínica Única (HCU)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">
                  Portal Profesional / Acceso
                </Link>
              </li>
            </ul>
          </div>

          {/* Centros de Atención */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-sm text-teal-300 font-heading uppercase tracking-wider text-[11px]">
              Centros de Salud Cruz del Eje
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Hospital Prov. Aurelio Crespo</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Dispensario San Pantaleón</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Clínica Privada Cruz del Eje</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Consultorios Médicos del Valle</span>
              </li>
            </ul>
          </div>

          {/* Emergencias y Guardia (Tarjeta de Alto Impacto) */}
          <div className="md:col-span-3">
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-5 backdrop-blur-xs shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <h4 className="font-bold text-sm text-rose-300 font-heading uppercase tracking-wider text-[11px]">
                  Emergencias Médicas 24hs
                </h4>
              </div>

              <p className="text-xs text-slate-300">
                Ante urgencias de riesgo de vida comuníquese de inmediato:
              </p>

              <div className="rounded-xl bg-slate-900/80 p-3 space-y-1.5 border border-rose-500/30">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>Guardia Hospital:</span>
                  <span className="font-mono text-white text-sm">107 / (03549) 422111</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Policía / Bomberos:</span>
                  <span className="font-mono text-slate-200">911 / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="mt-12 border-t border-teal-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Luvia - Tu Salud, Unificada.</p>
          <div className="flex items-center gap-1 font-medium text-slate-300">
            <span>Desarrollado con</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para Cruz del Eje, Córdoba</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
