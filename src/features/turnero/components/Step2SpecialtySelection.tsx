import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
  Baby,
  HeartPulse,
  Bone,
  Eye,
  Ear,
  Brain,
  Apple,
  Syringe,
  FlaskConical,
  Scissors,
  Check,
  ListFilter,
  ArrowDownAZ,
  ShieldCheck,
  Pill,
  HeartHandshake,
  Activity,
  Wind,
  Venus,
  MapPin,
  CalendarCheck,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { HealthCenter, MedicalSpecialty } from '../types'

interface Step2SpecialtySelectionProps {
  selectedCenter: HealthCenter
  specialties: MedicalSpecialty[]
  selectedSpecialty: MedicalSpecialty | null
  searchTerm: string
  onSearchChange: (value: string) => void
  onSelectSpecialty: (specialty: MedicalSpecialty) => void
  onBackToCenter: () => void
  onProceed?: () => void
}

// Íconos vectoriales a medida con estética idéntica a Lucide (24x24, stroke 2)
const ToothIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2C8.5 2 6 4.5 6 8.5c0 3 1.2 6.5 2 10.5.4 2 2.2 2.5 3 1 1-1.8 1-3.5 1-3.5s0 1.7 1 3.5c.8 1.5 2.6 1 3-1 .8-4 2-7.5 2-10.5 0-4-2.5-6.5-6.5Z" />
    <path d="M9 8c1 1.2 5 1.2 6 0" />
  </svg>
)

const DermaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v9" />
    <path d="M12 19a3.5 3.5 0 0 0 3.5-3.5c0-2-3.5-5.5-3.5-5.5S8.5 13.5 8.5 15.5A3.5 3.5 0 0 0 12 19Z" />
    <path d="M3 11h18" />
  </svg>
)

const KidneyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3.5c-4.2 0-7.5 3.2-7.5 8 0 5.5 3.3 9 7.5 9 3.5 0 4.5-2.8 4.5-5s-1.5-3.2-1.5-4.5 1.5-3.2 1.5-4.5c0-1.8-1.5-3-4.5-3Z" />
    <circle cx="9.5" cy="11.5" r="1.5" />
  </svg>
)

const KinesioIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="6" cy="7" r="2" />
    <circle cx="16.5" cy="6" r="2" />
    <path d="M2 17h20" />
    <path d="M5 17v4" />
    <path d="M19 17v4" />
    <path d="M4 14h14" />
    <path d="M15 9l-3 4" />
    <path d="M17 12l2 2" />
  </svg>
)

// Mapeo canónico a títulos limpios y minimalistas (priorizando especialidades específicas para evitar duplicados)
function getDisplaySpecialtyName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('cardio')) return 'Cardiología'
  if (lower.includes('oncol')) return 'Oncología'
  if (lower.includes('psico')) return 'Psicología'
  if (lower.includes('pediatr')) return 'Pediatría'
  if (lower.includes('gineco')) return 'Ginecología'
  if (lower.includes('traumato')) return 'Traumatología'
  if (lower.includes('derma')) return 'Dermatología'
  if (lower.includes('odonto')) return 'Odontología'
  if (lower.includes('oftalmo')) return 'Oftalmología'
  if (lower.includes('otorrino') || lower.includes('orl')) return 'Otorrinolaringología'
  if (lower.includes('uro')) return 'Urología'
  if (lower.includes('psiqui')) return 'Psiquiatría'
  if (lower.includes('nutri')) return 'Nutrición'
  if (lower.includes('kinesio')) return 'Kinesiología'
  if (lower.includes('vacuna')) return 'Vacunación'
  if (lower.includes('laboratorio')) return 'Laboratorio'
  if (lower.includes('cirug')) return 'Cirugía General'
  if (lower.includes('gastro')) return 'Gastroenterología'
  if (lower.includes('endocrin')) return 'Endocrinología'
  if (lower.includes('neuro')) return 'Neurología'
  if (lower.includes('reumat')) return 'Reumatología'
  if (lower.includes('alerg')) return 'Alergia e Inmunología'
  if (lower.includes('neumon')) return 'Neumonología'
  if (lower.includes('nefro')) return 'Nefrología'
  if (lower.includes('clínica') || lower.includes('clinica') || lower.includes('general')) return 'Clínica Médica'
  return name
}

// Asignación de ícono representativo para cada especialidad
function getSpecialtyIcon(name: string): React.ComponentType<{ className?: string }> {
  const lower = name.toLowerCase()
  if (lower.includes('cardio')) return HeartPulse
  if (lower.includes('pediatr')) return Baby
  if (lower.includes('gineco')) return Venus
  if (lower.includes('traumato')) return Bone
  if (lower.includes('derma')) return DermaIcon
  if (lower.includes('odonto')) return ToothIcon
  if (lower.includes('oftalmo')) return Eye
  if (lower.includes('otorrino') || lower.includes('orl')) return Ear
  if (lower.includes('uro') || lower.includes('nefro')) return KidneyIcon
  if (lower.includes('psiqui') || lower.includes('neuro')) return Brain
  if (lower.includes('nutri')) return Apple
  if (lower.includes('kinesio')) return KinesioIcon
  if (lower.includes('vacuna')) return Syringe
  if (lower.includes('laboratorio')) return FlaskConical
  if (lower.includes('cirug')) return Scissors
  if (lower.includes('alerg')) return ShieldCheck
  if (lower.includes('psico')) return HeartHandshake
  if (lower.includes('reumat')) return Bone
  if (lower.includes('oncol')) return ShieldCheck
  if (lower.includes('neumon')) return Wind
  if (lower.includes('gastro')) return Pill
  if (lower.includes('endocrin')) return Activity
  if (lower.includes('clínica') || lower.includes('clinica')) return Stethoscope
  return Stethoscope
}

// Especialidades de alta demanda para el filtro "Más frecuentes"
const FRECUENTES_KEYWORDS = [
  'clínica', 'clinica', 'pediatr', 'cardio', 'gineco',
  'traumato', 'derma', 'odonto', 'oftalmo', 'otorrino',
  'uro', 'psiqui', 'nutri', 'kinesio', 'vacuna', 'laboratorio'
]

export const Step2SpecialtySelection: React.FC<Step2SpecialtySelectionProps> = ({
  selectedCenter,
  specialties,
  selectedSpecialty,
  searchTerm,
  onSearchChange,
  onSelectSpecialty,
  onBackToCenter,
  onProceed,
}) => {
  const [filterMode, setFilterMode] = useState<'TODAS' | 'FRECUENTES'>('TODAS')
  const [sortAlphabetical, setSortAlphabetical] = useState<boolean>(false)
  const [modalSpecialty, setModalSpecialty] = useState<MedicalSpecialty | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Filtrado y ordenamiento dinámico
  const filteredSpecialties = useMemo(() => {
    let list = [...specialties]

    // Filtro por texto de búsqueda
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter((s) => {
        const clean = getDisplaySpecialtyName(s.name).toLowerCase()
        return clean.includes(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      })
    }

    // Filtro de "Más frecuentes"
    if (filterMode === 'FRECUENTES') {
      list = list.filter((s) => {
        const lower = s.name.toLowerCase()
        return FRECUENTES_KEYWORDS.some((kw) => lower.includes(kw))
      })
    }

    // Orden alfabético A-Z
    if (sortAlphabetical) {
      list.sort((a, b) => {
        const nameA = getDisplaySpecialtyName(a.name)
        const nameB = getDisplaySpecialtyName(b.name)
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' })
      })
    }

    return list
  }, [specialties, searchTerm, filterMode, sortAlphabetical])

  // Cierre de modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  // Al hacer clic en una especialidad: se selecciona y abre el Pop-Up interactivo
  const handleCardClick = (specialty: MedicalSpecialty) => {
    onSelectSpecialty(specialty)
    setModalSpecialty(specialty)
    setIsModalOpen(true)
  }

  // Confirmar desde el Pop-up y avanzar a la selección de turnos / médicos
  const handleConfirmModal = () => {
    setIsModalOpen(false)
    if (onProceed) {
      onProceed()
    }
  }

  const modalIcon = modalSpecialty ? getSpecialtyIcon(modalSpecialty.name) : Stethoscope
  const ModalIconComponent = modalIcon
  const modalDisplayName = modalSpecialty ? getDisplaySpecialtyName(modalSpecialty.name) : ''

  return (
    <section className="space-y-4 sm:space-y-6 pb-12 sm:pb-16">
      {/* 1. Context Banner: Institución Seleccionada (Mantiene exactamente lo marcado en rojo en Imagen 1) */}
      <div className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-sky-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />
        
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#00a896] text-white shadow-md shadow-[#00a896]/25">
            <Building2 className="size-6 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#005a87]">
              Institución Seleccionada
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading truncate">
              {selectedCenter.name}
            </h3>
            <span className="text-xs sm:text-sm text-slate-500 truncate block">
              {selectedCenter.address}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToCenter}
          className="h-9 sm:h-10 cursor-pointer gap-1.5 px-4 text-xs sm:text-sm font-bold rounded-xl border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white transition-all self-start sm:self-auto shrink-0 shadow-2xs"
        >
          <ChevronLeft className="size-4" />
          <span>Cambiar Centro</span>
        </Button>
      </div>

      {/* 2. Barra de Controles: Título, Contador, Buscador y Filtros estilo minimalista */}
      <div className="flex flex-col gap-4 rounded-2xl sm:rounded-3xl border border-sky-100 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

        {/* Título y contador con acento azul vertical */}
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-10 sm:h-11 bg-[#005a87] rounded-full shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 font-heading leading-tight">
              2. Seleccione la Especialidad Médica
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              Mostrando {filteredSpecialties.length} de {specialties.length} especialidades habilitadas
            </p>
          </div>
        </div>

        {/* Buscador y Filtros estilo pills */}
        <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center flex-wrap">
          {/* Input de Búsqueda instantánea */}
          <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar especialidad médica..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 sm:h-11 pl-10 pr-9 text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-[#005a87] focus:border-[#00a896]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Grupo de Filtros tipo botón como en imagen de referencia */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {/* Todas */}
            <button
              type="button"
              onClick={() => setFilterMode('TODAS')}
              className={`cursor-pointer shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                filterMode === 'TODAS'
                  ? 'bg-[#005a87] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Todas
            </button>

            {/* Más frecuentes */}
            <button
              type="button"
              onClick={() => setFilterMode(filterMode === 'FRECUENTES' ? 'TODAS' : 'FRECUENTES')}
              className={`cursor-pointer shrink-0 rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                filterMode === 'FRECUENTES'
                  ? 'bg-[#005a87] text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ListFilter className="size-3.5 sm:size-4" />
              <span>Más frecuentes</span>
            </button>

            {/* Orden alfabético */}
            <button
              type="button"
              onClick={() => setSortAlphabetical((prev) => !prev)}
              className={`cursor-pointer shrink-0 rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                sortAlphabetical
                  ? 'bg-[#005a87] text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Ordenar de la A a la Z"
            >
              <ArrowDownAZ className="size-3.5 sm:size-4" />
              <span>Orden alfabético</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Cuadrícula en GRUPOS DE 4 COLUMNAS (1 col móvil, 2 en tablet, 4 en desktop) */}
      {/* Scroll fluido y continuo: bajan naturalmente con el scroll de la página */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {filteredSpecialties.map((specialty) => {
          const isSelected = selectedSpecialty?.id === specialty.id
          const displayName = getDisplaySpecialtyName(specialty.name)
          const IconComponent = getSpecialtyIcon(specialty.name)

          return (
            <div
              key={specialty.id}
              onClick={() => handleCardClick(specialty)}
              className={`group relative flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white text-left ${
                isSelected
                  ? 'border-[#005a87] bg-sky-50/60 ring-2 ring-[#005a87]/25 shadow-md -translate-y-0.5'
                  : 'border-slate-200/90 shadow-2xs hover:border-[#005a87]/80 hover:shadow-md hover:bg-slate-50/40 hover:-translate-y-0.5'
              }`}
            >
              {/* Ícono de especialidad en azul institucional */}
              <div className="flex size-10 shrink-0 items-center justify-center text-[#005a87] group-hover:scale-110 transition-transform">
                <IconComponent className="size-6 sm:size-7 stroke-[1.8]" />
              </div>

              {/* Nombre de la especialidad */}
              <div className="min-w-0 flex-1">
                <span className="font-heading font-semibold text-slate-800 text-sm group-hover:text-[#005a87] transition-colors leading-snug line-clamp-2 block">
                  {displayName}
                </span>
              </div>

              {/* Checkmark sutil cuando está seleccionada */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-[#005a87] text-white shadow-xs animate-in zoom-in-75 duration-150">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Estado vacío cuando no hay resultados de búsqueda */}
      {filteredSpecialties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-2xs">
          <Stethoscope className="mx-auto size-10 text-slate-300 mb-3" />
          <p className="text-sm sm:text-base font-semibold text-slate-700">
            No se encontraron especialidades médicas que coincidan con la búsqueda.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Intentá buscando con otro término o seleccioná "Todas".
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchChange('')
              setFilterMode('TODAS')
            }}
            className="mt-4 rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
          >
            Restablecer Filtros
          </Button>
        </div>
      )}

      {/* 4. Pop-up Modal Elaborado para Confirmar y Avanzar a Sacar Turnos */}
      {isModalOpen && modalSpecialty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Franja superior del logo */}
            <div className="h-2 w-full bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

            {/* Botón cerrar X */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="size-5" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Encabezado del Pop-up con ícono prominente */}
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#005a87] to-[#0284c7] text-white shadow-lg shadow-[#005a87]/25">
                  <ModalIconComponent className="size-7 stroke-[1.8]" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#005a87] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/60">
                    <Sparkles className="size-3" /> Especialidad Seleccionada
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-heading mt-1">
                    {modalDisplayName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    {modalSpecialty.description}
                  </p>
                </div>
              </div>

              {/* Tarjeta de Contexto Institucional y Disponibilidad */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2.5 font-semibold text-slate-900">
                  <Building2 className="size-4 text-[#00a896] shrink-0" />
                  <span className="truncate">{selectedCenter.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <MapPin className="size-4 text-[#005a87] shrink-0" />
                  <span className="truncate">{selectedCenter.address}, Cruz del Eje</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 pt-2 border-t border-sky-100/70">
                  <UserCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>{modalSpecialty.totalDoctors} profesionales</strong> disponibles para esta especialidad
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Clock className="size-4 text-sky-600 shrink-0" />
                  <span>Atención presencial en consultorios externos (turnos cada 20-30 min)</span>
                </div>
              </div>

              {/* Botones de acción del Pop-up */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm cursor-pointer"
                >
                  Elegir otra especialidad
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmModal}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-[#005a87] to-[#00a896] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#005a87]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                >
                  <CalendarCheck className="size-4" />
                  <span>Siguiente: Sacar Turno</span>
                  <ChevronRight className="size-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón inferior discreto para volver a centros de salud */}
      <div className="mt-8 flex justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToCenter}
          className="h-10 px-4 rounded-xl border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white font-bold gap-1.5 cursor-pointer text-xs sm:text-sm"
        >
          <ChevronLeft className="size-4" />
          <span>Volver a Centros de Salud</span>
        </Button>
      </div>
    </section>
  )
}
