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

function getCenterTypeBadge(type: CenterType): { label: string; badgeClass: string; iconClass: string } {
  switch (type) {
    case 'HOSPITAL':
      return {
        label: 'Hospital Público',
        badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
        iconClass: 'bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white',
      }
    case 'CLINICA':
      return {
        label: 'Clínica Privada',
        badgeClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
        iconClass: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white',
      }
    case 'CAPS':
      return {
        label: 'Centro de Salud (CAPS)',
        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        iconClass: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white',
      }
    case 'CONSULTORIO':
      return {
        label: 'Consultorios Externos',
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
        iconClass: 'bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white',
      }
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
    <section className="space-y-6">
      {/* Controls Bar: Search, Category Chips & View Toggle */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            1. Seleccione el Centro de Salud o Consultorio
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            {centers.length} {centers.length === 1 ? 'institución disponible' : 'instituciones disponibles'} en Cruz del Eje
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
          {/* Instant Search Bar */}
          <div className="relative min-w-[260px] sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 pl-10 pr-9 text-sm sm:text-base rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-slate-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = typeFilter === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTypeFilterChange(opt.value)}
                  className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
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

      {/* Grid or List View Rendering */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((center) => {
            const isSelected = selectedCenter?.id === center.id
            const typeInfo = getCenterTypeBadge(center.type)

            return (
              <Card
                key={center.id}
                className={`group rounded-2xl border transition-all duration-200 hover:shadow-lg cursor-pointer bg-white text-left ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/15 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onSelectCenter(center)}
              >
                <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7 space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Center Type Accent Icon */}
                      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors ${typeInfo.iconClass}`}>
                        <Building2 className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-lg sm:text-xl font-heading leading-tight truncate">
                          {center.name}
                        </h3>
                        <span className={`inline-block mt-1.5 text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-lg border ${typeInfo.badgeClass}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm sm:text-base text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="size-4 shrink-0 text-slate-400" />
                        <span className="truncate">{center.address}, {center.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="size-4 shrink-0 text-slate-400" />
                        <span>{center.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm sm:text-base font-bold text-slate-700">
                      {center.specialtiesCount} especialidades
                    </span>
                    <Button
                      type="button"
                      aria-label={`Elegir centro de salud ${center.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectCenter(center)
                      }}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-10 cursor-pointer gap-1.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{isSelected ? 'Seleccionado' : 'Elegir Centro'}</span>
                      <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List Mode: Directory Style with enlarged typography */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {centers.map((center) => {
            const isSelected = selectedCenter?.id === center.id
            const typeInfo = getCenterTypeBadge(center.type)

            return (
              <div
                key={center.id}
                onClick={() => onSelectCenter(center)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  isSelected ? 'bg-slate-50 ring-2 ring-slate-900' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${typeInfo.iconClass}`}>
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base sm:text-lg text-slate-900 font-heading truncate">
                        {center.name}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${typeInfo.badgeClass}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {center.address} • {center.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-15 sm:pl-0">
                  <span className="text-sm sm:text-base font-semibold text-slate-700">
                    {center.specialtiesCount} especialidades
                  </span>
                  <Button
                    type="button"
                    aria-label={`Elegir centro de salud ${center.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectCenter(center)
                    }}
                    size="sm"
                    className={`h-10 px-4 text-xs sm:text-sm font-bold rounded-xl ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isSelected ? 'Seleccionado' : 'Elegir'}</span>
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {centers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <Building2 className="mx-auto size-10 text-slate-300 mb-3" />
          <p className="text-sm sm:text-base font-medium text-slate-600">
            No se encontraron centros de salud con los filtros actuales en esta localidad.
          </p>
        </div>
      )}
    </section>
  )
}
