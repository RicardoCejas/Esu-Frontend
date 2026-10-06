import React, { useState } from 'react'
import { Search, MapPin, Phone, Building2, ChevronRight, X, LayoutGrid, List } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { HealthCenter, CenterType } from '../types'

interface Step1CenterSelectionProps {
  centers: HealthCenter[]
  selectedCenter: HealthCenter | null
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: CenterType | 'ALL'
  onTypeFilterChange: (type: CenterType | 'ALL') => void
  onSelectCenter: (center: HealthCenter) => void
}

const FILTER_OPTIONS: { label: string; value: CenterType | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Hospitales', value: 'HOSPITAL' },
  { label: 'Clínicas', value: 'CLINICA' },
  { label: 'CAPS', value: 'CAPS' },
  { label: 'Consultorios', value: 'CONSULTORIO' },
]

function getCenterTypeBadge(type: CenterType): string {
  switch (type) {
    case 'HOSPITAL': return 'Hospital Público'
    case 'CLINICA': return 'Clínica Privada'
    case 'CAPS': return 'Centro de Salud (CAPS)'
    case 'CONSULTORIO': return 'Consultorios Externos'
  }
}

export const Step1CenterSelection: React.FC<Step1CenterSelectionProps> = ({
  centers,
  selectedCenter,
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onSelectCenter,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <section className="space-y-4">
      {/* Controls Bar: Search, Category Chips & View Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg font-heading">
            1. Seleccione el Centro de Salud o Consultorio
          </h2>
          <p className="text-xs text-slate-500">
            {centers.length} {centers.length === 1 ? 'institución disponible' : 'instituciones disponibles'} en Cruz del Eje
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Instant Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-8 pr-8 text-xs rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-slate-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = typeFilter === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTypeFilterChange(opt.value)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 ml-1">
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

      {/* Grid or List View Rendering */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((center) => {
            const isSelected = selectedCenter?.id === center.id

            return (
              <Card
                key={center.id}
                className={`group rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer bg-white text-left ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onSelectCenter(center)}
              >
                <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Monochrome Clean Icon Container */}
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                        <Building2 className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm font-heading leading-tight truncate">
                          {center.name}
                        </h3>
                        <span className="inline-block mt-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {getCenterTypeBadge(center.type)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{center.address}, {center.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0 text-slate-400" />
                        <span>{center.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-semibold text-slate-700">
                      {center.specialtiesCount} especialidades
                    </span>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectCenter(center)
                      }}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 cursor-pointer gap-1 px-3 text-xs font-semibold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{isSelected ? 'Seleccionado' : 'Elegir Centro'}</span>
                      <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List Mode: Dense Directory Table Style */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {centers.map((center) => {
            const isSelected = selectedCenter?.id === center.id

            return (
              <div
                key={center.id}
                onClick={() => onSelectCenter(center)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  isSelected ? 'bg-slate-50 border-l-4 border-l-slate-900' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 font-heading truncate">
                        {center.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {getCenterTypeBadge(center.type)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {center.address} • {center.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                  <span className="text-xs font-medium text-slate-600">
                    {center.specialtiesCount} especialidades
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
                    <span>{isSelected ? 'Seleccionado' : 'Elegir'}</span>
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {centers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white">
          <Building2 className="mx-auto size-8 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">
            No se encontraron centros de salud con los filtros actuales en esta localidad.
          </p>
        </div>
      )}
    </section>
  )
}
