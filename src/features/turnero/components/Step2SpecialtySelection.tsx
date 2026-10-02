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
  SlidersHorizontal,
  Activity,
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
  const [sortBy, setSortBy] = useState<'name' | 'doctors'>('name')
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Filter and sort for high density
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
    <section className="space-y-4">
      {/* Context Banner: Selected Institution */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Building2 className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Institución Seleccionada
            </span>
            <h3 className="text-sm font-bold text-slate-900 font-heading">{selectedCenter.name}</h3>
            <span className="text-xs text-slate-500">{selectedCenter.address}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToCenter}
          className="h-8 cursor-pointer gap-1.5 px-3 text-xs font-semibold rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Centro</span>
        </Button>
      </div>

      {/* Controls Bar for High Density: Search, Alphabetical Filters, View Mode */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg font-heading">
            2. Seleccione la Especialidad Médica
          </h2>
          <p className="text-xs text-slate-500">
            Mostrando {filteredSpecialties.length} de {specialties.length} especialidades habilitadas
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center flex-wrap">
          {/* Instant Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar especialidad médica..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 pl-8 pr-8 text-xs rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-slate-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('')
                  setCurrentPage(1)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Quick Alphabetical Filter Group */}
          <div className="flex items-center gap-1 flex-wrap">
            {['ALL', 'A-D', 'E-H', 'I-M', 'N-R', 'S-Z'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleAlphaChange(filter)}
                className={`cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                  alphaFilter === filter
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL' ? 'Todas' : filter}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista en Tarjetas"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Vista en Directorio"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty?.id === specialty.id

            return (
              <Card
                key={specialty.id}
                className={`group rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer bg-white text-left ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onSelectSpecialty(specialty)}
              >
                <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Stethoscope className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm font-heading leading-tight truncate">
                          {specialty.name}
                        </h3>
                        <span className="inline-block mt-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {specialty.totalDoctors} {specialty.totalDoctors === 1 ? 'médico' : 'médicos'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {specialty.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-3">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectSpecialty(specialty)
                      }}
                      size="sm"
                      className={`h-8 cursor-pointer gap-1 px-3 text-xs font-semibold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{isSelected ? 'Seleccionada' : 'Elegir'}</span>
                      <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* High-Density Directory List Mode */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {paginatedSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty?.id === specialty.id

            return (
              <div
                key={specialty.id}
                onClick={() => onSelectSpecialty(specialty)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  isSelected ? 'bg-slate-50 border-l-4 border-l-slate-900' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Stethoscope className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 font-heading truncate">
                        {specialty.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {specialty.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                  <span className="text-xs font-semibold text-slate-700">
                    {specialty.totalDoctors} {specialty.totalDoctors === 1 ? 'profesional' : 'profesionales'}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    className={`h-8 px-3 text-xs font-semibold rounded-lg ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isSelected ? 'Seleccionada' : 'Elegir'}</span>
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Footer Controls for Large Catalogs */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 px-1">
          <p className="text-xs text-slate-500">
            Página <span className="font-semibold text-slate-900">{currentPage}</span> de <span className="font-semibold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 text-xs font-medium border-slate-200 cursor-pointer disabled:opacity-40"
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 text-xs font-medium border-slate-200 cursor-pointer disabled:opacity-40"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {filteredSpecialties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white">
          <Stethoscope className="mx-auto size-8 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">
            No se encontraron especialidades médicas activas que coincidan con la búsqueda.
          </p>
        </div>
      )}
    </section>
  )
}
