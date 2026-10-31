import React, { useState, useMemo } from 'react'
import {
  Search,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
  LayoutGrid,
  List,
  Baby,
  HeartPulse,
  Bone,
  Activity,
  Eye,
  Sun,
  Brain,
  Apple,
  Heart,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

interface SpecialtyDesign {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  badgeClass: string
  borderAccent: string
  image: string
}

function getTurneroSpecialtyDesign(name: string): SpecialtyDesign {
  const lower = name.toLowerCase()

  // 1. Cardiología
  if (lower.includes('cardio')) {
    return {
      Icon: HeartPulse,
      iconClass: 'bg-rose-50 text-rose-700 group-hover:bg-rose-700 group-hover:text-white',
      badgeClass: 'text-rose-800 bg-rose-50 border-rose-200',
      borderAccent: 'group-hover:border-rose-300',
      image: '/especialidades/cardiologia.jpg',
    }
  }

  // 2. Cirugía General y Laparoscópica
  if (lower.includes('cirug') || lower.includes('quirúrg') || lower.includes('quirurg') || lower.includes('laparo')) {
    return {
      Icon: Activity,
      iconClass: 'bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white',
      badgeClass: 'text-teal-800 bg-teal-50 border-teal-200',
      borderAccent: 'group-hover:border-teal-300',
      image: '/especialidades/cirugia.jpg',
    }
  }

  // 3. Clínica Médica / Medicina General / Medicina de Familia
  if (lower.includes('clínica') || lower.includes('clinica') || lower.includes('general') || lower.includes('familia')) {
    return {
      Icon: Stethoscope,
      iconClass: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white',
      badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      borderAccent: 'group-hover:border-emerald-300',
      image: '/especialidades/clinica-medica.jpg',
    }
  }

  // 4. Dermatología
  if (lower.includes('derma')) {
    return {
      Icon: Sun,
      iconClass: 'bg-orange-50 text-orange-700 group-hover:bg-orange-700 group-hover:text-white',
      badgeClass: 'text-orange-800 bg-orange-50 border-orange-200',
      borderAccent: 'group-hover:border-orange-300',
      image: '/especialidades/dermatologia.jpg',
    }
  }

  // 5. Endocrinología y Metabolismo
  if (lower.includes('endocrin') || lower.includes('metabol')) {
    return {
      Icon: Activity,
      iconClass: 'bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white',
      badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
      borderAccent: 'group-hover:border-sky-300',
      image: '/especialidades/endocrinologia.jpg',
    }
  }

  // 6. Gastroenterología
  if (lower.includes('gastro')) {
    return {
      Icon: Activity,
      iconClass: 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white',
      badgeClass: 'text-cyan-800 bg-cyan-50 border-cyan-200',
      borderAccent: 'group-hover:border-cyan-300',
      image: '/especialidades/gastroenterologia.jpg',
    }
  }

  // 7. Pediatría / Neonatología
  if (lower.includes('pediatr') || lower.includes('infant') || lower.includes('neona')) {
    return {
      Icon: Baby,
      iconClass: 'bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white',
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
      borderAccent: 'group-hover:border-amber-300',
      image: '/especialidades/pediatria.jpg',
    }
  }

  // 8. Traumatología / Ortopedia
  if (lower.includes('trauma') || lower.includes('ortop')) {
    return {
      Icon: Bone,
      iconClass: 'bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white',
      badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
      borderAccent: 'group-hover:border-sky-300',
      image: '/especialidades/traumatologia.jpg',
    }
  }

  // 9. Ginecología / Obstetricia
  if (lower.includes('gineco') || lower.includes('obstetr')) {
    return {
      Icon: Activity,
      iconClass: 'bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white',
      badgeClass: 'text-purple-800 bg-purple-50 border-purple-200',
      borderAccent: 'group-hover:border-purple-300',
      image: '/especialidades/ginecologia.jpg',
    }
  }

  // 10. Oftalmología
  if (lower.includes('oftalmo') || lower.includes('ojos')) {
    return {
      Icon: Eye,
      iconClass: 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white',
      badgeClass: 'text-cyan-800 bg-cyan-50 border-cyan-200',
      borderAccent: 'group-hover:border-cyan-300',
      image: '/especialidades/oftalmologia.jpg',
    }
  }

  // 11. Neurología / Neurocirugía
  if (lower.includes('neuro')) {
    return {
      Icon: Brain,
      iconClass: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white',
      badgeClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
      borderAccent: 'group-hover:border-indigo-300',
      image: '/especialidades/neurologia.jpg',
    }
  }

  // 12. Nutrición / Dietética
  if (lower.includes('nutri') || lower.includes('diet')) {
    return {
      Icon: Apple,
      iconClass: 'bg-lime-50 text-lime-800 group-hover:bg-lime-800 group-hover:text-white',
      badgeClass: 'text-lime-800 bg-lime-50 border-lime-200',
      borderAccent: 'group-hover:border-lime-300',
      image: '/especialidades/nutricion.jpg',
    }
  }

  // 13. Odontología
  if (lower.includes('odonto') || lower.includes('dental')) {
    return {
      Icon: Activity,
      iconClass: 'bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white',
      badgeClass: 'text-blue-800 bg-blue-50 border-blue-200',
      borderAccent: 'group-hover:border-blue-300',
      image: '/especialidades/odontologia.jpg',
    }
  }

  // 14. Kinesiología / Fisioterapia
  if (lower.includes('kinesio') || lower.includes('fisiot')) {
    return {
      Icon: Activity,
      iconClass: 'bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white',
      badgeClass: 'text-teal-800 bg-teal-50 border-teal-200',
      borderAccent: 'group-hover:border-teal-300',
      image: '/especialidades/kinesiologia.jpg',
    }
  }

  // 15. Neumonología
  if (lower.includes('neumon') || lower.includes('respirat')) {
    return {
      Icon: Activity,
      iconClass: 'bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white',
      badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
      borderAccent: 'group-hover:border-sky-300',
      image: '/especialidades/neumonologia.jpg',
    }
  }

  // 16. Otorrinolaringología (ORL)
  if (lower.includes('otorrino') || lower.includes('orl') || lower.includes('oido')) {
    return {
      Icon: Activity,
      iconClass: 'bg-violet-50 text-violet-700 group-hover:bg-violet-700 group-hover:text-white',
      badgeClass: 'text-violet-800 bg-violet-50 border-violet-200',
      borderAccent: 'group-hover:border-violet-300',
      image: '/especialidades/otorrino.jpg',
    }
  }

  // 17. Nefrología
  if (lower.includes('nefro') || lower.includes('renal')) {
    return {
      Icon: Activity,
      iconClass: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white',
      badgeClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
      borderAccent: 'group-hover:border-indigo-300',
      image: '/especialidades/nefrologia.jpg',
    }
  }

  // 18. Oncología
  if (lower.includes('oncol')) {
    return {
      Icon: Activity,
      iconClass: 'bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white',
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
      borderAccent: 'group-hover:border-amber-300',
      image: '/especialidades/oncologia.jpg',
    }
  }

  // 19. Urología
  if (lower.includes('uro')) {
    return {
      Icon: Activity,
      iconClass: 'bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white',
      badgeClass: 'text-blue-800 bg-blue-50 border-blue-200',
      borderAccent: 'group-hover:border-blue-300',
      image: '/especialidades/urologia.jpg',
    }
  }

  // 20. Reumatología
  if (lower.includes('reumat')) {
    return {
      Icon: Bone,
      iconClass: 'bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white',
      badgeClass: 'text-purple-800 bg-purple-50 border-purple-200',
      borderAccent: 'group-hover:border-purple-300',
      image: '/especialidades/reumatologia.jpg',
    }
  }

  // 21. Alergia e Inmunología
  if (lower.includes('alerg') || lower.includes('inmuno')) {
    return {
      Icon: Activity,
      iconClass: 'bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white',
      badgeClass: 'text-teal-800 bg-teal-50 border-teal-200',
      borderAccent: 'group-hover:border-teal-300',
      image: '/especialidades/alergia.jpg',
    }
  }

  // 22. Psicología / Psiquiatría
  if (lower.includes('psico') || lower.includes('psiqui') || lower.includes('mental')) {
    return {
      Icon: Heart,
      iconClass: 'bg-pink-50 text-pink-700 group-hover:bg-pink-700 group-hover:text-white',
      badgeClass: 'text-pink-800 bg-pink-50 border-pink-200',
      borderAccent: 'group-hover:border-pink-300',
      image: lower.includes('psiqui') ? '/especialidades/psiquiatria.jpg' : '/especialidades/psicologia.jpg',
    }
  }

  // Default
  return {
    Icon: Stethoscope,
    iconClass: 'bg-sky-50 text-sky-800 group-hover:bg-sky-800 group-hover:text-white',
    badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
    borderAccent: 'group-hover:border-sky-300',
    image: '/especialidades/clinica-medica.jpg',
  }
}

const ITEMS_PER_PAGE = 12

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [alphaFilter, setAlphaFilter] = useState<string>('ALL')
  const [sortBy] = useState<'name' | 'doctors'>('name')
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Filter and sort
  const filteredSpecialties = useMemo(() => {
    let result = [...specialties]

    if (alphaFilter !== 'ALL') {
      const [start, end] = alphaFilter.split('-')
      result = result.filter((s) => {
        const firstChar = s.name.trim().charAt(0).toUpperCase()
        return firstChar >= start && firstChar <= end
      })
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'doctors') {
      result.sort((a, b) => b.totalDoctors - a.totalDoctors)
    }

    return result
  }, [specialties, alphaFilter, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredSpecialties.length / ITEMS_PER_PAGE) || 1
  const paginatedSpecialties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSpecialties.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredSpecialties, currentPage])

  // Reset page when filter changes
  const handleAlphaChange = (filter: string) => {
    setAlphaFilter(filter)
    setCurrentPage(1)
  }

  return (
    <section className="space-y-4 sm:space-y-6 pb-16 sm:pb-16">
      {/* Context Banner: Selected Institution con acento del logo */}
      <div className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-sky-200/90 bg-white/95 backdrop-blur-md p-3.5 sm:p-5 shadow-md sm:flex-row sm:items-center sm:justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-11 sm:size-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#005a87] to-[#00a896] text-white shadow-md shadow-[#005a87]/25">
            <Building2 className="size-5 sm:size-6 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#005a87]">
              Institución Seleccionada
            </span>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 font-heading truncate">{selectedCenter.name}</h3>
            <span className="text-xs sm:text-sm text-slate-500 truncate block">{selectedCenter.address}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToCenter}
          className="h-9 sm:h-10 cursor-pointer gap-1.5 px-3.5 text-xs sm:text-sm font-bold rounded-xl border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white transition-all self-start sm:self-auto shrink-0"
        >
          <ChevronLeft className="size-3.5 sm:size-4" />
          <span>Cambiar Centro</span>
        </Button>
      </div>

      {/* Controls Bar: Search, Alphabetical Filters, View Mode */}
      <div className="flex flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-sky-200/90 bg-white/95 backdrop-blur-md p-3.5 sm:p-5 shadow-md lg:flex-row lg:items-center lg:justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 font-heading">
            2. Seleccione la Especialidad Médica
          </h2>
          <p className="text-xs sm:text-base text-slate-500 mt-0.5 sm:mt-1">
            Mostrando {filteredSpecialties.length} de {specialties.length} especialidades habilitadas
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center flex-wrap">
          {/* Instant Search Bar */}
          <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar especialidad médica..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 sm:h-11 pl-10 pr-9 text-xs sm:text-base rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-[#005a87] focus:border-[#00a896]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Quick Alphabetical Filter Group */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {['ALL', 'A-D', 'E-H', 'I-M', 'N-R', 'S-Z'].map((filter) => {
              const isSelected = alphaFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleAlphaChange(filter)}
                  className={`cursor-pointer shrink-0 rounded-xl px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md shadow-[#005a87]/20 scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {filter === 'ALL' ? 'Todas' : filter}
                </button>
              )
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista en Tarjetas"
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Vista en Directorio"
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List View with Specialty Images */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty?.id === specialty.id
            const design = getTurneroSpecialtyDesign(specialty.name)
            const IconComponent = design.Icon

            return (
              <Card
                key={specialty.id}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 cursor-pointer bg-white text-left ${
                  isSelected
                    ? 'border-[#005a87] ring-4 ring-[#00a896]/35 shadow-[0_24px_50px_-10px_rgba(0,90,135,0.28)] bg-gradient-to-b from-white via-sky-50/20 to-teal-50/15 -translate-y-1.5 sm:-translate-y-2.5'
                    : 'border-slate-200/90 shadow-[0_12px_30px_-10px_rgba(15,23,42,0.08)] hover:border-[#00a896]/70 hover:shadow-[0_24px_50px_-12px_rgba(0,168,150,0.25)] hover:-translate-y-2'
                }`}
                onClick={() => onSelectSpecialty(specialty)}
              >
                {/* Imagen en referencia a la especialidad médica */}
                <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={design.image}
                    alt={specialty.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />

                  {/* Franja superior con degradado del logo */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]'
                        : 'bg-gradient-to-r from-[#005a87]/40 via-[#0284c7]/40 to-[#00a896]/40 group-hover:from-[#005a87] group-hover:via-[#0284c7] group-hover:to-[#00a896]'
                    }`}
                  />

                  {/* Insignia de Médicos Disponibles */}
                  <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-10">
                    <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 text-slate-800 shadow-md backdrop-blur-md border border-white/50">
                      <span className="size-2 rounded-full bg-[#00a896]" />
                      {specialty.totalDoctors} {specialty.totalDoctors === 1 ? 'médico' : 'médicos'}
                    </span>
                  </div>

                  {/* Insignia de Seleccionada */}
                  {isSelected && (
                    <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-10">
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-lg">
                        <Check className="size-3 sm:size-3.5" /> Seleccionada
                      </span>
                    </div>
                  )}

                  {/* Ícono semántico flotante que solapa la imagen */}
                  <div className="absolute -bottom-3.5 sm:-bottom-4 left-4 sm:left-5 z-10 flex size-10 sm:size-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white text-slate-900 shadow-xl border-2 border-slate-100 group-hover:scale-110 group-hover:rotate-2 transition-all duration-300">
                    <IconComponent className="size-5 sm:size-6 text-[#005a87]" />
                  </div>
                </div>

                <CardContent className="flex flex-col justify-between pt-5 sm:pt-6 pb-4 sm:pb-5 px-4 sm:px-6 space-y-3 sm:space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg font-heading leading-snug min-h-0 sm:min-h-[2.5rem] line-clamp-2 group-hover:text-[#005a87] transition-colors">
                      {specialty.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {specialty.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                      Atención en consultorio
                    </span>
                    <Button
                      type="button"
                      aria-label={`Elegir especialidad ${specialty.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isSelected && onProceed) {
                          onProceed()
                        } else {
                          onSelectSpecialty(specialty)
                        }
                      }}
                      className={`h-10 sm:h-11 cursor-pointer gap-2 px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md shadow-[#005a87]/30 border-none hover:opacity-95'
                          : 'border-2 border-[#005a87] bg-white text-[#005a87] hover:bg-gradient-to-r hover:from-[#005a87] hover:to-[#00a896] hover:text-white hover:border-transparent'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <span>Elegir Profesional</span>
                          <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>Elegir Especialidad</span>
                          <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Directory List Mode with Specialty Images and Colors */
        <div className="flex flex-col gap-3.5">
          {paginatedSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty?.id === specialty.id
            const design = getTurneroSpecialtyDesign(specialty.name)
            const IconComponent = design.Icon

            return (
              <div
                key={specialty.id}
                onClick={() => onSelectSpecialty(specialty)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-4 sm:p-5 cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#005a87] ring-4 ring-[#00a896]/35 shadow-xl bg-gradient-to-r from-sky-50/50 via-teal-50/30 to-white -translate-y-1'
                    : 'border-slate-200/90 shadow-sm hover:border-[#00a896]/70 hover:shadow-lg hover:-translate-y-1.5'
                }`}
              >
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#005a87] via-[#0284c7] to-[#00a896]'
                      : 'bg-gradient-to-b from-[#005a87]/40 to-[#00a896]/40 group-hover:from-[#005a87] group-hover:to-[#00a896]'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail con imagen de la especialidad */}
                    <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                      <img
                        src={design.image}
                        alt={specialty.name}
                        className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-900/30" />
                      <div className="absolute bottom-1 left-1 flex size-6 items-center justify-center rounded-lg bg-white/95 shadow-xs">
                        <IconComponent className="size-3.5 text-[#005a87]" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-base sm:text-lg text-slate-900 font-heading">
                          {specialty.name}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#00a896]/30 bg-teal-50 text-[#005a87]">
                          {specialty.totalDoctors} {specialty.totalDoctors === 1 ? 'médico' : 'médicos'}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-2xs">
                            <Check className="size-3" /> Seleccionada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate mt-1">
                        {specialty.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-20 sm:pl-0">
                    <Button
                      type="button"
                      aria-label={`Elegir especialidad ${specialty.name}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectSpecialty(specialty)
                      }}
                      className={`h-10 px-5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md'
                          : 'border-2 border-[#005a87] bg-white text-[#005a87] hover:bg-gradient-to-r hover:from-[#005a87] hover:to-[#00a896] hover:text-white hover:border-transparent'
                      }`}
                    >
                      <span>{isSelected ? 'Continuar' : 'Elegir'}</span>
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-5 px-1">
          <p className="text-sm text-slate-600">
            Página <span className="font-bold text-slate-900">{currentPage}</span> de <span className="font-bold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-9 px-3.5 text-xs sm:text-sm font-semibold border-slate-200 cursor-pointer disabled:opacity-40"
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 px-3.5 text-xs sm:text-sm font-semibold border-slate-200 cursor-pointer disabled:opacity-40"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {filteredSpecialties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <Stethoscope className="mx-auto size-10 text-slate-300 mb-3" />
          <p className="text-sm sm:text-base font-medium text-slate-600">
            No se encontraron especialidades médicas activas que coincidan con la búsqueda.
          </p>
        </div>
      )}

      {/* Barra de acción inferior con degradado y alto contraste */}
      {selectedSpecialty ? (
        <div className="sticky bottom-2 sm:bottom-4 z-20 mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl border-2 border-teal-300/40 bg-gradient-to-r from-[#00486c] via-[#005a87] to-[#008f80] p-3.5 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-white">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <Button
              type="button"
              onClick={onBackToCenter}
              className="h-11 px-4 sm:px-5 rounded-xl bg-white hover:bg-slate-100 text-[#00486c] font-extrabold gap-1.5 shrink-0 cursor-pointer text-xs sm:text-sm shadow-md border-2 border-white transition-all hover:scale-102"
              title="Volver hacia atrás y cambiar centro de salud"
            >
              <ChevronLeft className="size-4.5 text-[#00486c]" />
              <span>Volver atrás</span>
            </Button>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-teal-200">Especialidad Seleccionada</span>
              <h4 className="text-sm sm:text-lg font-bold text-white truncate">{selectedSpecialty.name}</h4>
              <p className="text-xs sm:text-sm text-sky-100 truncate">{selectedCenter.name}</p>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={onProceed}
            className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-7 rounded-xl sm:rounded-2xl bg-white hover:bg-teal-50 text-[#005a87] font-extrabold text-xs sm:text-base shadow-xl gap-2 shrink-0 cursor-pointer transition-transform hover:scale-102"
          >
            <span>Siguiente: Seleccionar Profesional</span>
            <ChevronRight className="size-4 sm:size-5 text-[#005a87]" />
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex justify-start">
          <Button
            type="button"
            onClick={onBackToCenter}
            className="h-11 px-5 rounded-xl bg-white border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white font-extrabold gap-2 shadow-sm cursor-pointer text-xs sm:text-sm transition-all hover:scale-102"
          >
            <ChevronLeft className="size-4.5" />
            <span>Volver a Centros de Salud</span>
          </Button>
        </div>
      )}
    </section>
  )
}
