import React, { useState, useRef } from 'react'
import { Shield, ChevronLeft, ChevronRight, CheckCircle2, Building2, X } from 'lucide-react'

interface ObraSocialItem {
  id: string
  nombre: string
  sigla: string
  logo: string
  tipo: string
  cobertura: string
  centrosAceptados: string[]
  requisitos: string[]
}

const OBRAS_CON_LOGOS: ObraSocialItem[] = [
  {
    id: 'apross',
    nombre: 'Administración Provincial del Seguro de Salud de Córdoba',
    sigla: 'APROSS',
    logo: '/logos/apross.png',
    tipo: 'Provincial Córdoba',
    cobertura: 'Cobertura al 100% en consultas médicas y estudios ambulatorios.',
    centrosAceptados: ['Hospital Regional Aurelio Crespo', 'Clínica Privada Cabrera', 'Centro de Diagnóstico Cruz del Eje'],
    requisitos: ['DNI actualizado', 'Credencial digital en App Apross', 'Token o código de atención'],
  },
  {
    id: 'pami',
    nombre: 'Instituto Nacional de Servicios Sociales para Jubilados y Pensionados',
    sigla: 'PAMI',
    logo: '/logos/pami.png',
    tipo: 'Nacional Jubilados',
    cobertura: 'Médico de cabecera, especialistas y estudios diagnósticos sin costo.',
    centrosAceptados: ['Hospital Regional Aurelio Crespo', 'Clínica Privada Cabrera'],
    requisitos: ['Último recibo de cobro', 'DNI', 'Credencial PAMI física o digital'],
  },
  {
    id: 'ecss',
    nombre: 'Enfermedad Catastrófica y Servicios Sociales',
    sigla: 'ECSS',
    logo: '/logos/ecss.png',
    tipo: 'Cobertura Especial',
    cobertura: 'Convenio de atención integral para afiliados en la región Noroeste.',
    centrosAceptados: ['Hospital Regional Aurelio Crespo', 'Centro de Diagnóstico Cruz del Eje'],
    requisitos: ['DNI', 'Carnet digital o credencial ECSS vigente'],
  },
  {
    id: 'osde',
    nombre: 'Organización de Servicios Directos Empresarios',
    sigla: 'OSDE',
    logo: '/logos/osde.svg',
    tipo: 'Prepaga Nacional',
    cobertura: 'Planes 210, 310, 410 y 450 con cartilla médica directa y reintegros.',
    centrosAceptados: ['Clínica Privada Cabrera', 'Centro de Diagnóstico Cruz del Eje'],
    requisitos: ['Credencial digital OSDE Móvil', 'DNI'],
  },
  {
    id: 'swiss-medical',
    nombre: 'Swiss Medical Group',
    sigla: 'SWISS MEDICAL',
    logo: '/logos/swiss-medical.svg',
    tipo: 'Prepaga Nacional',
    cobertura: 'Acceso directo a especialistas, estudios diagnósticos e internación.',
    centrosAceptados: ['Clínica Privada Cabrera'],
    requisitos: ['App Swiss Medical con credencial virtual', 'DNI'],
  },
  {
    id: 'sancor',
    nombre: 'SanCor Salud Grupo de Medicina Privada',
    sigla: 'SANCOR SALUD',
    logo: '/logos/sancor.svg',
    tipo: 'Medicina Privada',
    cobertura: 'Planes integrales con amplia red de prestadores en Cruz del Eje.',
    centrosAceptados: ['Clínica Privada Cabrera', 'Centro de Diagnóstico Cruz del Eje'],
    requisitos: ['Credencial SanCor Digital', 'DNI'],
  },
  {
    id: 'galeno',
    nombre: 'Galeno Cobertura Médica',
    sigla: 'GALENO',
    logo: '/logos/galeno.svg',
    tipo: 'Medicina Privada',
    cobertura: 'Cartilla médica en centros de diagnóstico y clínicas asociadas.',
    centrosAceptados: ['Clínica Privada Cabrera', 'Centro de Diagnóstico Cruz del Eje'],
    requisitos: ['Credencial digital Galeno', 'DNI'],
  },
  {
    id: 'medife',
    nombre: 'Medifé Medicina Prepaga',
    sigla: 'MEDIFÉ',
    logo: '/logos/medife.svg',
    tipo: 'Medicina Prepaga',
    cobertura: 'Cobertura en consultas clínicas y especialidades ambulatorias.',
    centrosAceptados: ['Clínica Privada Cabrera'],
    requisitos: ['Credencial virtual en App Medifé', 'DNI'],
  },
  {
    id: 'daspu',
    nombre: 'Dirección de Asistencia Social del Personal Universitario (UNC)',
    sigla: 'DASPU',
    logo: '/logos/daspu.svg',
    tipo: 'Universitaria',
    cobertura: 'Convenio de atención médica en centros de salud de Cruz del Eje.',
    centrosAceptados: ['Hospital Regional Aurelio Crespo', 'Clínica Privada Cabrera'],
    requisitos: ['Orden de consulta emitida o número de afiliado', 'DNI'],
  },
  {
    id: 'osecac',
    nombre: 'Obra Social de Empleados de Comercio',
    sigla: 'OSECAC',
    logo: '/logos/osecac.svg',
    tipo: 'Obra Social Sindical',
    cobertura: 'Atención primaria y de especialistas para afiliados y grupo familiar.',
    centrosAceptados: ['Hospital Regional Aurelio Crespo', 'Centro de Diagnóstico Cruz del Eje'],
    requisitos: ['Recibo de sueldo', 'Carnet digital', 'DNI'],
  },
  {
    id: 'publica',
    nombre: 'Cobertura Universal y Gratuita de Salud Pública',
    sigla: 'SALUD PÚBLICA',
    logo: '/logos/salud-publica.svg',
    tipo: 'Atención Gratuita',
    cobertura: '100% gratuita y garantizada para cualquier persona con DNI o documento.',
    centrosAceptados: ['Hospital Regional Aurelio Crespo'],
    requisitos: ['DNI o documento de identidad (No requiere obra social)'],
  },
]

export const TurneroObrasSocialesCarousel: React.FC = () => {
  const [selectedOS, setSelectedOS] = useState<ObraSocialItem | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 320
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  // Duplicar el arreglo para el bucle continuo infinito
  const displayItems = [...OBRAS_CON_LOGOS, ...OBRAS_CON_LOGOS]

  return (
    <div className="rounded-2xl sm:rounded-3xl border-2 border-teal-300/40 bg-gradient-to-r from-[#005a87]/15 via-[#0284c7]/10 to-[#00a896]/15 p-3.5 sm:p-5 shadow-md space-y-3 relative overflow-hidden backdrop-blur-sm">
      {/* Línea superior con gradiente del logo */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

      {/* Header con Título, Insignia y Flechas de Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#005a87] to-[#00a896] px-3 py-0.5 text-[11px] sm:text-xs font-bold text-white mb-1 shadow-xs">
            <Shield className="size-3 sm:size-3.5 text-white" />
            <span>Coberturas y Convenios Activos</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
            Obras Sociales y Prepagas Aceptadas en Cruz del Eje
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 hidden sm:block">
            Atención pública gratuita y convenios con las principales obras sociales provinciales y nacionales.
          </p>
        </div>

        {/* Flechas de desplazamiento manual */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Desplazar obras sociales a la izquierda"
            className="flex size-9 items-center justify-center rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#005a87] transition cursor-pointer shadow-xs"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Desplazar obras sociales a la derecha"
            className="flex size-9 items-center justify-center rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#005a87] transition cursor-pointer shadow-xs"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Riel interactivo con efecto marquesina continuo y pausa al pasar el mouse */}
      <div
        className="relative overflow-hidden rounded-2xl py-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-none py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            className={`flex gap-4 shrink-0 ${isPaused ? '' : 'animate-turnero-marquee'}`}
            style={{
              animationDuration: '32s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
          >
            {displayItems.map((os, idx) => (
              <div
                key={`${os.id}-${idx}`}
                onClick={() => setSelectedOS(os)}
                className="w-48 sm:w-56 h-28 shrink-0 rounded-2xl border-2 border-slate-200/90 bg-white p-3.5 shadow-sm hover:shadow-xl hover:border-[#00a896] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer select-none group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896] opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Tipo de Cobertura */}
                <div className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="truncate max-w-[130px]">{os.tipo}</span>
                  <span className="flex size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                </div>

                {/* Logo Oficial de la Obra Social */}
                <div className="my-auto flex items-center justify-center h-12 w-full px-2">
                  <img
                    src={os.logo}
                    alt={os.sigla}
                    className="max-h-10 max-w-[140px] w-auto object-contain transition-transform duration-300 group-hover:scale-110 filter drop-shadow-2xs"
                    loading="lazy"
                  />
                </div>

                {/* Pie con indicador de Convenio Activo */}
                <div className="w-full pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#005a87]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] text-slate-600 font-semibold">Convenio Activo</span>
                  </span>
                  <span className="text-[10px] text-[#005a87] font-bold group-hover:underline">Requisitos →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Detallado de la Obra Social Seleccionada */}
      {selectedOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xl space-y-0">
            {/* Header del Modal con el Logo */}
            <div className="bg-[#005a87] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white p-2 shadow-md shrink-0">
                  <img
                    src={selectedOS.logo}
                    alt={selectedOS.sigla}
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-sky-200 tracking-wider">
                    {selectedOS.tipo}
                  </span>
                  <h3 className="text-xl font-bold font-heading">{selectedOS.sigla}</h3>
                  <p className="text-xs text-sky-100">{selectedOS.nombre}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOS(null)}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Contenido con Centros y Requisitos */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl bg-sky-50 border border-sky-200/80 p-4 space-y-1">
                <span className="font-bold text-sky-950 block text-xs uppercase tracking-wider">
                  Alcance y Cobertura:
                </span>
                <p className="text-sky-900 leading-relaxed font-medium">
                  {selectedOS.cobertura}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                  <Building2 className="size-4 text-[#005a87]" />
                  <span>Centros de Salud en Cruz del Eje con convenio:</span>
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedOS.centrosAceptados.map((centro, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 font-semibold text-slate-800"
                    >
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>{centro}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase text-xs tracking-wider">
                  Documentación a presentar el día de la consulta:
                </span>
                <ul className="space-y-1 list-disc list-inside text-slate-600 font-medium">
                  {selectedOS.requisitos.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOS(null)}
                  className="w-full h-11 rounded-xl bg-[#005a87] text-white font-bold hover:bg-[#00486c] transition cursor-pointer shadow-md"
                >
                  Entendido, continuar seleccionando centro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
