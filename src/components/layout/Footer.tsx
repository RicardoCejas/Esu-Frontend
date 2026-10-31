import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Phone,
  ShieldCheck,
  Clock,
  Building2,
  Lock,
  Mail,
  HeartPulse,
  Pill,
  Syringe,
  Droplet,
  X,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface InfoModalData {
  titulo: string;
  subtitulo: string;
  icono: React.ReactNode;
  contenido: React.ReactNode;
}

export const Footer: React.FC = () => {
  const [modalData, setModalData] = useState<InfoModalData | null>(null);

  const abrirFarmaciasTurno = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalData({
      titulo: 'Farmacias de Turno en Cruz del Eje',
      subtitulo: 'Rotación oficial según el Colegio de Farmacéuticos de Córdoba',
      icono: <Pill className="h-5 w-5 text-emerald-400" />,
      contenido: (
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
          <p>
            Las farmacias de Cruz del Eje cumplen guardias rotativas de 24 horas continuas para garantizar el expendio de medicamentos de urgencia:
          </p>
          <div className="space-y-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Farmacia Central Cruz del Eje</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Turno Hoy</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-sky-400" />
                <span>Sarmiento 310, Centro, Cruz del Eje</span>
              </p>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-emerald-400" />
                <a href="tel:03549422150" className="hover:underline font-bold text-emerald-400">
                  (03549) 422150
                </a>
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <span className="font-bold text-white text-sm">Farmacia San Martín</span>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-sky-400" />
                <span>San Martín 180, Cruz del Eje</span>
              </p>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-emerald-400" />
                <a href="tel:03549423200" className="hover:underline font-bold text-emerald-400">
                  (03549) 423200
                </a>
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <span className="font-bold text-white text-sm">Farmacia del Valle</span>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-sky-400" />
                <span>Mitre 450, Cruz del Eje</span>
              </p>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-emerald-400" />
                <a href="tel:03549424100" className="hover:underline font-bold text-emerald-400">
                  (03549) 424100
                </a>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-700/80 pt-2.5">
            Recuerde concurrir con la receta médica y credencial de su obra social o prepaga.
          </p>
        </div>
      ),
    });
  };

  const abrirCalendarioVacunacion = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalData({
      titulo: 'Calendario Oficial de Vacunación',
      subtitulo: 'Gratuito y obligatorio en efectores públicos de Cruz del Eje',
      icono: <Syringe className="h-5 w-5 text-sky-400" />,
      contenido: (
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
          <p>
            Los centros de salud aplican las vacunas del <strong>Calendario Nacional Oficial</strong> sin costo y por orden de llegada:
          </p>
          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <h5 className="font-bold text-white text-sm">Vacunatorio Hospital Regional Dr. Aurelio Crespo</h5>
              <p className="text-xs text-slate-400 mt-0.5">Av. Juan B. Justo 1200 / Eva Perón</p>
              <p className="text-xs text-sky-300 font-semibold mt-1">
                Lunes a Viernes de 07:30 a 13:30 hs • Sector Pediatría y Adultos
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <h5 className="font-bold text-white text-sm">Dispensario Dr. René Favaloro (CAPS Santa Rosa)</h5>
              <p className="text-xs text-slate-400 mt-0.5">Barrio Santa Rosa, Cruz del Eje</p>
              <p className="text-xs text-sky-300 font-semibold mt-1">
                Lunes a Viernes de 08:00 a 13:00 hs • Vacunación general y antigripal
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-sky-950/40 border border-sky-800/60 p-2.5 text-xs text-sky-200">
            <strong>Requisito único:</strong> Presentarse con DNI y libreta de vacunación o carnet de control.
          </div>
        </div>
      ),
    });
  };

  const abrirDonacionSangre = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalData({
      titulo: 'Donación Voluntaria de Sangre',
      subtitulo: 'Servicio de Hemoterapia • Hospital Regional Aurelio Crespo',
      icono: <Droplet className="h-5 w-5 text-rose-400" />,
      contenido: (
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
          <p>
            La donación voluntaria salva vidas en cirugías, traumas y emergencias en todo Cruz del Eje:
          </p>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3.5 space-y-2 text-xs">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-rose-300">Horarios de Extracción:</h5>
            <p className="text-slate-200">
              Martes y Jueves de 07:30 a 10:30 hs en <strong>Hemoterapia del Hospital Aurelio Crespo</strong>.
            </p>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-rose-300 pt-1.5">Requisitos Básicos:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Edad entre 18 y 65 años y peso superior a 50 kg.</li>
              <li>Presentar DNI original.</li>
              <li>Desayuno liviano sin grasas ni lácteos (té, mate o café con tostadas).</li>
            </ul>
          </div>
        </div>
      ),
    });
  };

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-900 text-slate-300 selection:bg-sky-600 selection:text-white">
      {/* 1. Franja Superior: Números de Emergencia y Red Sanitaria Activa (Estirada de punta a punta) */}
      <div className="w-full border-b border-slate-800 bg-slate-950/80 py-3.5 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Números de Emergencia */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-7">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                <HeartPulse className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Emergencias Médicas
                </span>
                <a href="tel:107" className="font-extrabold text-white hover:text-rose-400 text-sm">
                  Línea 107 (Gratuita)
                </a>
              </div>
            </div>

            <div className="hidden sm:block h-7 w-px bg-slate-800" />

            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Guardia Hosp. Crespo
                </span>
                <a href="tel:03549422001" className="font-bold text-slate-200 hover:text-white text-xs sm:text-sm">
                  (03549) 422001 / 422111
                </a>
              </div>
            </div>

            <div className="hidden md:block h-7 w-px bg-slate-800" />

            <div className="hidden md:flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bomberos / Policía
                </span>
                <span className="font-bold text-slate-200 text-xs sm:text-sm">
                  100 / 101
                </span>
              </div>
            </div>
          </div>

          {/* Nodo Digital Conectado */}
          <div className="flex items-center gap-2 self-start lg:self-auto rounded-full bg-emerald-950/40 border border-emerald-800/50 px-3.5 py-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-300">
              Red Sanitaria Conectada y Operativa 24/7 • Cruz del Eje
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo Principal de Columnas (Estirado horizontalmente sin concentrarse en el centro) */}
      <div className="w-full py-10 sm:py-12 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Columna 1: Identidad, Misión y Redes con Colores Originales (lg:col-span-4) */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="Luvia Logo" className="h-9 w-9 object-contain" />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                  Luvia <span className="text-sky-400">Cruz del Eje</span>
                </span>
                <p className="text-xs text-sky-300 font-medium">Ecosistema de Salud Unificado</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Infraestructura sanitaria que articula efectores públicos, sanatorios privados, centros de imágenes y consultorios para el departamento Cruz del Eje y la región noroeste de Córdoba.
            </p>

            {/* Redes Sociales con Iconos y Colores Originales Oficiales */}
            <div className="pt-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Canales Oficiales y Redes
              </p>
              <div className="flex items-center gap-2.5">
                {/* WhatsApp - Verde Oficial #25D366 */}
                <a
                  href="https://wa.me/5493549552233"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm shadow-[#25D366]/40 cursor-pointer"
                  title="WhatsApp de Orientación al Paciente"
                  aria-label="WhatsApp"
                >
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.073-1.019-.052-.777-.251-1.795-1.049-2.59-1.844-.796-.796-1.593-1.813-1.844-2.59-.125-.385-.097-.707-.052-1.019.05-.333.419-1.026.824-1.17.143-.051.272-.032.378.073.109.109.529 1.28.529 1.28s.073.181.018.326c-.055.145-.198.327-.291.437-.093.109-.163.145-.054.363.109.218.472.799.981 1.309.51.509 1.091.872 1.309.981.218.109.254.039.363-.054.11-.093.292-.236.437-.291.145-.055.326.018.326.018s1.171.42 1.28.529c.105.106.124.235.073.378z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.176-1.31A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.175-.467-4.48-1.275l-.322-.198-3.078.78.807-2.95-.218-.344A8.204 8.204 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25 4.549 0 8.25 3.701 8.25 8.25 0 4.549-3.701 8.25-8.25 8.25z" />
                  </svg>
                </a>

                {/* Instagram - Gradiente Oficial Magenta/Naranja/Violeta */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                  }}
                  className="h-8 w-8 rounded-lg text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm shadow-[#d6249f]/40 cursor-pointer"
                  title="Instagram de Salud"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook - Azul Oficial #1877F2 */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm shadow-[#1877F2]/40 cursor-pointer"
                  title="Facebook Institucional"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z" />
                  </svg>
                </a>

                {/* YouTube - Rojo Oficial #FF0000 */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-[#FF0000] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm shadow-[#FF0000]/40 cursor-pointer"
                  title="Canal de YouTube Oficial"
                  aria-label="YouTube"
                >
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Sello Normativo */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Protección de Datos Sensibles • Ley Nacional 25.326</span>
            </div>
          </div>

          {/* Columna 2: Guías Comunitarias & Servicios Sanitarios (lg:col-span-3) */}
          <div className="space-y-3.5 lg:col-span-3">
            <h4 className="font-bold text-sm sm:text-base text-white font-heading flex items-center gap-2">
              <Pill className="h-4 w-4 text-emerald-400" />
              <span>Salud en la Comunidad</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={abrirFarmaciasTurno}
                  className="group flex items-center justify-between w-full text-left hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <span>Farmacias de Turno</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={abrirCalendarioVacunacion}
                  className="group flex items-center justify-between w-full text-left hover:text-sky-300 transition-colors cursor-pointer"
                >
                  <span>Calendario de Vacunación</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={abrirDonacionSangre}
                  className="group flex items-center justify-between w-full text-left hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <span>Donación de Sangre (Hemoterapia)</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </li>
              <li>
                <a
                  href="/#especialidades"
                  className="group flex items-center justify-between w-full text-left hover:text-sky-300 transition-colors"
                >
                  <span>Cartilla de Especialidades</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </a>
              </li>
              <li>
                <a
                  href="/#mapa-sanitario"
                  className="group flex items-center justify-between w-full text-left hover:text-sky-300 transition-colors"
                >
                  <span>Mapa de Efectores y Clínicas</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Centros y Efectores Departamentales (lg:col-span-3) */}
          <div className="space-y-3.5 lg:col-span-3">
            <h4 className="font-bold text-sm sm:text-base text-white font-heading flex items-center gap-2">
              <Building2 className="h-4 w-4 text-sky-400" />
              <span>Red Hospitalaria y Sanatorial</span>
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="/#mapa-sanitario" className="group block hover:text-white transition-colors">
                  <span className="font-bold text-white group-hover:text-sky-300 block">
                    Hospital Regional Aurelio Crespo
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                    <span>Félix Cáceres 265 • Guardia Activa 24hs</span>
                  </span>
                </a>
              </li>

              <li>
                <a href="/#mapa-sanitario" className="group block hover:text-white transition-colors">
                  <span className="font-bold text-white group-hover:text-sky-300 block">
                    Clínica Privada Cabrera
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-sky-500 shrink-0" />
                    <span>Av. Eva Perón 642 • Quirófanos e Internación</span>
                  </span>
                </a>
              </li>

              <li>
                <a href="/#mapa-sanitario" className="group block hover:text-white transition-colors">
                  <span className="font-bold text-white group-hover:text-sky-300 block">
                    Sanatorio María Isabel
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                    <span>Sarmiento 289 • Consultorios y Camas</span>
                  </span>
                </a>
              </li>

              <li>
                <a href="/#mapa-sanitario" className="group block hover:text-white transition-colors">
                  <span className="font-bold text-white group-hover:text-sky-300 block">
                    Centro de Diagnóstico Cruz del Eje
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Sarmiento 289 • Diagnóstico e Imágenes</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Mesa de Entrada & Portales (lg:col-span-2) */}
          <div className="space-y-3.5 lg:col-span-2">
            <h4 className="font-bold text-sm sm:text-base text-white font-heading flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-sky-400" />
              <span>Portales y Enlaces</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/login?redirect=/dashboard/medico" className="hover:text-white transition-colors block">
                  Portal Médico
                </Link>
              </li>
              <li>
                <Link to="/login?redirect=/dashboard/recepcion" className="hover:text-white transition-colors block">
                  Portal Recepción
                </Link>
              </li>
              <li>
                <Link to="/dashboard/paciente" className="hover:text-white transition-colors block">
                  Mis Registros de Salud
                </Link>
              </li>
            </ul>

            <div className="pt-2.5 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Mesa de Entrada</span>
                  <a href="mailto:contacto@luvia.salud.gob.ar" className="hover:text-white transition-colors text-[11px]">
                    contacto@luvia.salud.gob.ar
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Atención Administrativa</span>
                  <span className="text-[11px]">Lun a Vie: 07:00 a 20:30 hs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Barra Inferior Legal y Ética Sanitaria */}
        <div className="mt-10 border-t border-slate-800 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-medium">© {new Date().getFullYear()} Luvia • Ecosistema de Salud Unificado.</p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Lock className="h-3 w-3 text-slate-500" />
              <span>Ley 26.529 Derechos del Paciente e Historia Clínica</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-medium text-slate-300">
            <span>Desarrollado con</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline mx-0.5 animate-pulse" />
            <span>para Cruz del Eje, Córdoba</span>
          </div>
        </div>
      </div>

      {/* 4. Modal de Guías y Utilidad Sanitaria */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-3.5 animate-in zoom-in-95 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                  {modalData.icono}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white font-heading">
                    {modalData.titulo}
                  </h3>
                  <p className="text-[11px] text-slate-400">{modalData.subtitulo}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalData(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-1">{modalData.contenido}</div>

            <div className="pt-2.5 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setModalData(null)}
                className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
