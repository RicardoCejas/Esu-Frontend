import { MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Info Principal */}
          <div className="space-y-3 md:col-span-6">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="Luvia Logo" className="h-10 w-10 object-contain" />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                  Luvia <span className="text-sky-400">Cruz del Eje</span>
                </span>
                <p className="text-xs text-slate-400 font-medium">Tu Salud, Unificada</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Plataforma integral de salud que centraliza la gestión de turnos, historias clínicas y recetas electrónicas para toda la comunidad de Cruz del Eje y la región noroeste de Córdoba.
            </p>
          </div>

          {/* Accesos Rápidos */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="font-bold text-sm text-white font-heading">
              Servicios al Paciente
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/turnero" className="hover:text-white transition-colors">
                  Solicitar Turno Online
                </Link>
              </li>
              <li>
                <Link to="/dashboard/paciente" className="hover:text-white transition-colors">
                  Consultar Mis Turnos
                </Link>
              </li>
              <li>
                <Link to="/dashboard/paciente" className="hover:text-white transition-colors">
                  Historia Clínica Única (HCU)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Portal Profesional / Acceso
                </Link>
              </li>
            </ul>
          </div>

          {/* Centros de Atención */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="font-bold text-sm text-white font-heading">
              Centros de Salud Cruz del Eje
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Hospital Prov. Aurelio Crespo</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Dispensario San Pantaleón</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Clínica Privada Cruz del Eje</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Consultorios Médicos del Valle</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Luvia - Tu Salud, Unificada.</p>
          <div className="flex items-center gap-1 font-medium text-slate-400">
            <span>Desarrollado con</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para Cruz del Eje, Córdoba</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
