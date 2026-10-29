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
}

interface SpecialtyDesign {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  badgeClass: string
  borderAccent: string
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
    }
  }

  // 2. Pediatría / Neonatología
  if (lower.includes('pediatr') || lower.includes('infant') || lower.includes('neona')) {
    return {
      Icon: Baby,
      iconClass: 'bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white',
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
      borderAccent: 'group-hover:border-amber-300',
    }
  }

  // 3. Clínica Médica / Medicina General / Medicina de Familia
  if (lower.includes('clínica') || lower.includes('clinica') || lower.includes('general') || lower.includes('familia')) {
    return {
      Icon: Stethoscope,
      iconClass: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white',
      badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      borderAccent: 'group-hover:border-emerald-300',
    }
  }

  // 4. Traumatología / Ortopedia
  if (lower.includes('trauma') || lower.includes('ortop')) {
    return {
      Icon: Bone,
      iconClass: 'bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white',
      badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
      borderAccent: 'group-hover:border-sky-300',
    }
  }

  // 5. Ginecología / Obstetricia
  if (lower.includes('gineco') || lower.includes('obstetr')) {
    return {
      Icon: Activity,
      iconClass: 'bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white',
      badgeClass: 'text-purple-800 bg-purple-50 border-purple-200',
      borderAccent: 'group-hover:border-purple-300',
    }
  }

  // 6. Oftalmología
  if (lower.includes('oftalmo') || lower.includes('ojos')) {
    return {
      Icon: Eye,
      iconClass: 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white',
      badgeClass: 'text-cyan-800 bg-cyan-50 border-cyan-200',
      borderAccent: 'group-hover:border-cyan-300',
    }
  }

  // 7. Dermatología
  if (lower.includes('derma')) {
    return {
      Icon: Sun,
      iconClass: 'bg-orange-50 text-orange-700 group-hover:bg-orange-700 group-hover:text-white',
      badgeClass: 'text-orange-800 bg-orange-50 border-orange-200',
      borderAccent: 'group-hover:border-orange-300',
    }
  }

  // 8. Neurología / Neurocirugía
  if (lower.includes('neuro')) {
    return {
      Icon: Brain,
      iconClass: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white',
      badgeClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
      borderAccent: 'group-hover:border-indigo-300',
    }
  }

  // 9. Nutrición / Diabetes
  if (lower.includes('nutri') || lower.includes('diabet')) {
    return {
      Icon: Apple,
      iconClass: 'bg-lime-50 text-lime-800 group-hover:bg-lime-800 group-hover:text-white',
      badgeClass: 'text-lime-800 bg-lime-50 border-lime-200',
      borderAccent: 'group-hover:border-lime-300',
    }
  }

  // 10. Salud Mental / Psiquiatría / Psicología
  if (lower.includes('psico') || lower.includes('psiqui') || lower.includes('mental')) {
    return {
      Icon: Heart,
      iconClass: 'bg-pink-50 text-pink-700 group-hover:bg-pink-700 group-hover:text-white',
      badgeClass: 'text-pink-800 bg-pink-50 border-pink-200',
      borderAccent: 'group-hover:border-pink-300',
    }
  }

  // Default
  return {
    Icon: Stethoscope,
    iconClass: 'bg-sky-50 text-sky-800 group-hover:bg-sky-800 group-hover:text-white',
    badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
    borderAccent: 'group-hover:border-sky-300',
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
    <section className="space-y-6">
      {/* Context Banner: Selected Institution */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Building2 className="size-6" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Institución Seleccionada
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">{selectedCenter.name}</h3>
            <span className="text-sm text-slate-500">{selectedCenter.address}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToCenter}
          className="h-10 cursor-pointer gap-2 px-4 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <ChevronLeft className="size-4" />
          <span>Cambiar Centro</span>
        </Button>
      </div>

      {/* Controls Bar: Search, Alphabetical Filters, View Mode */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            2. Seleccione la Especialidad Médica
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Mostrando {filteredSpecialties.length} de {specialties.length} especialidades habilitadas
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
          {/* Instant Search Bar */}
          <div className="relative min-w-[260px] sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar especialidad médica..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value)
                setCurrentPage(1)
              }}
              className="h-11 pl-10 pr-9 text-sm sm:text-base rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-slate-900"
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
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'A-D', 'E-H', 'I-M', 'N-R', 'S-Z'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleAlphaChange(filter)}
                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  alphaFilter === filter
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL' ? 'Todas' : filter}
              </button>
            ))}
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

      {/* Grid or List View with Specialty Semantic Colors and Generous Alignment */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty?.id === specialty.id
            const design = getTurneroSpecialtyDesign(specialty.name)
            const IconComponent = design.Icon

            return (
              <Card
                key={specialty.id}
                className={`group rounded-2xl border transition-all duration-200 hover:shadow-lg cursor-pointer bg-white text-left ${design.borderAccent} ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/15 shadow-md'
                    : 'border-slate-200'
                }`}
                onClick={() => onSelectSpecialty(specialty)}
              >
                <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7 space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Specialty Semantic Colored Icon Container */}
                      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors ${design.iconClass}`}>
                        <IconComponent className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-lg sm:text-xl font-heading leading-tight truncate">
                          {specialty.name}
                        </h3>
                        <span className={`inline-block mt-1.5 text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-lg border ${design.badgeClass}`}>
                          {specialty.totalDoctors} {specialty.totalDoctors === 1 ? 'médico' : 'médicos'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 line-clamp-3 leading-relaxed pt-1">
                      {specialty.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-4">
                    <Button
                      type="button"
                      aria-label={`Elegir especialidad ${specialty.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectSpecialty(specialty)
                      }}
                      size="sm"
                      className={`h-10 cursor-pointer gap-1.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{isSelected ? 'Seleccionada' : 'Elegir'}</span>
                      <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Directory List Mode with Specialty Colors */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {paginatedSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty?.id === specialty.id
            const design = getTurneroSpecialtyDesign(specialty.name)
            const IconComponent = design.Icon

            return (
              <div
                key={specialty.id}
                onClick={() => onSelectSpecialty(specialty)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  isSelected ? 'bg-slate-50 ring-2 ring-slate-900' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${design.iconClass}`}>
                    <IconComponent className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base sm:text-lg text-slate-900 font-heading truncate">
                        {specialty.name}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {specialty.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-15 sm:pl-0">
                  <span className={`text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-lg border ${design.badgeClass}`}>
                    {specialty.totalDoctors} {specialty.totalDoctors === 1 ? 'profesional' : 'profesionales'}
                  </span>
                  <Button
                    type="button"
                    aria-label={`Elegir especialidad ${specialty.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectSpecialty(specialty)
                    }}
                    size="sm"
                    className={`h-10 px-4 text-xs sm:text-sm font-bold rounded-xl ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isSelected ? 'Seleccionada' : 'Elegir'}</span>
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
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
    </section>
  )
}
