import React, { useState } from 'react'
import { Search, MapPin, Phone, Building2, ChevronRight, ChevronLeft, X, LayoutGrid, List, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TurneroObrasSocialesCarousel } from './TurneroObrasSocialesCarousel'
import type { HealthCenter, CenterType } from '../types'

interface Step1CenterSelectionProps {
  centers: HealthCenter[]
  selectedCenter: HealthCenter | null
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: CenterType | 'ALL'
  onTypeFilterChange: (type: CenterType | 'ALL') => void
  onSelectCenter: (center: HealthCenter) => void
  onUnselectCenter?: () => void
  onProceed?: () => void
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
        badgeClass: 'text-[#005a87] bg-sky-50 border-sky-300 font-bold',
        iconClass: 'bg-gradient-to-br from-[#005a87] to-[#0284c7] text-white shadow-md shadow-[#005a87]/25',
      }
    case 'CLINICA':
      return {
        label: 'Clínica Privada',
        badgeClass: 'text-[#0e7490] bg-cyan-50 border-cyan-300 font-bold',
        iconClass: 'bg-gradient-to-br from-[#005a87] to-[#00a896] text-white shadow-md shadow-[#005a87]/25',
      }
    case 'CAPS':
      return {
        label: 'Centro de Salud (CAPS)',
        badgeClass: 'text-[#0d9488] bg-teal-50 border-teal-300 font-bold',
        iconClass: 'bg-gradient-to-br from-[#008f80] to-[#14b8a6] text-white shadow-md shadow-[#008f80]/25',
      }
    case 'CONSULTORIO':
      return {
        label: 'Consultorios Externos',
        badgeClass: 'text-[#0369a1] bg-blue-50 border-blue-300 font-bold',
        iconClass: 'bg-gradient-to-br from-[#004f77] to-[#0284c7] text-white shadow-md shadow-[#004f77]/25',
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
  onUnselectCenter,
  onProceed,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <section className="space-y-4 sm:space-y-6 pb-12 sm:pb-16">
      {/* Controls Bar: Search, Category Chips & View Toggle con acentos del logo */}
      <div className="flex flex-col gap-3 sm:gap-3.5 rounded-2xl border border-sky-200/90 bg-white/95 backdrop-blur-md p-3.5 sm:p-4.5 shadow-sm lg:flex-row lg:items-center lg:justify-between relative overflow-hidden">
        {/* Franja superior con degradado del logo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 font-heading">
            1. Seleccione el Centro de Salud o Consultorio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {centers.length} {centers.length === 1 ? 'institución disponible' : 'instituciones disponibles'} en Cruz del Eje
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center flex-wrap">
          {/* Instant Search Bar */}
          <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 sm:h-11 pl-10 pr-9 text-xs sm:text-base rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-[#005a87] focus:border-[#00a896]"
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

          {/* Category Filter Pills con gradiente y contraste */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = typeFilter === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTypeFilterChange(opt.value)}
                  className={`cursor-pointer shrink-0 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md shadow-[#005a87]/20 scale-105'
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

      {/* Grid or List View Rendering con tarjetas intercaladas Azul/Turquesa */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((center, index) => {
            const isSelected = selectedCenter?.id === center.id
            const isTealTheme = index % 2 === 1
            const typeInfo = getCenterTypeBadge(center.type)

            // Colores intercalados según la paleta del logo:
            // Par (0, 2): Azul Institucional Marino / Océano
            // Impar (1, 3): Turquesa Médico / Verde Esmeralda
            const theme = isTealTheme
              ? {
                  stripe: isSelected
                    ? 'bg-gradient-to-r from-[#007064] via-[#00a896] to-[#2dd4bf]'
                    : 'bg-gradient-to-r from-[#007064]/40 via-[#00a896]/40 to-[#2dd4bf]/40 group-hover:from-[#007064] group-hover:via-[#00a896] group-hover:to-[#2dd4bf]',
                  iconBg: 'bg-gradient-to-br from-[#007064] via-[#008f80] to-[#00a896] text-white shadow-md shadow-[#00a896]/30',
                  badge: 'bg-teal-50 text-[#007064] border-teal-300',
                  buttonUnselected: 'border-2 border-[#007064] text-[#007064] hover:bg-gradient-to-r hover:from-[#007064] hover:to-[#00a896] hover:text-white hover:border-transparent',
                  selectedCard: 'border-[#007064] ring-4 ring-[#00a896]/35 shadow-[0_20px_40px_-8px_rgba(0,168,150,0.35)] bg-gradient-to-b from-white via-teal-50/40 to-sky-50/20 -translate-y-2.5',
                  hoverCard: 'border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(0,168,150,0.12)] hover:border-[#00a896]/80 hover:shadow-[0_22px_45px_-8px_rgba(0,168,150,0.28)] hover:-translate-y-2.5 hover:scale-[1.015]',
                  pinColor: 'text-[#007064]',
                  phoneColor: 'text-[#00a896]',
                  selectedBadge: 'bg-gradient-to-r from-[#007064] to-[#00a896] text-white',
                  buttonSelected: 'bg-gradient-to-r from-[#007064] to-[#00a896] text-white shadow-md shadow-[#00a896]/30 border-none',
                }
              : {
                  stripe: isSelected
                    ? 'bg-gradient-to-r from-[#00486c] via-[#005a87] to-[#0284c7]'
                    : 'bg-gradient-to-r from-[#00486c]/40 via-[#005a87]/40 to-[#0284c7]/40 group-hover:from-[#00486c] group-hover:via-[#005a87] group-hover:to-[#0284c7]',
                  iconBg: 'bg-gradient-to-br from-[#00486c] via-[#005a87] to-[#0284c7] text-white shadow-md shadow-[#005a87]/30',
                  badge: 'bg-sky-50 text-[#005a87] border-sky-300',
                  buttonUnselected: 'border-2 border-[#005a87] text-[#005a87] hover:bg-gradient-to-r hover:from-[#00486c] hover:to-[#005a87] hover:text-white hover:border-transparent',
                  selectedCard: 'border-[#005a87] ring-4 ring-[#005a87]/35 shadow-[0_20px_40px_-8px_rgba(0,90,135,0.35)] bg-gradient-to-b from-white via-sky-50/40 to-teal-50/20 -translate-y-2.5',
                  hoverCard: 'border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(0,90,135,0.12)] hover:border-[#005a87]/80 hover:shadow-[0_22px_45px_-8px_rgba(0,90,135,0.28)] hover:-translate-y-2.5 hover:scale-[1.015]',
                  pinColor: 'text-[#005a87]',
                  phoneColor: 'text-[#0284c7]',
                  selectedBadge: 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white',
                  buttonSelected: 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md shadow-[#005a87]/30 border-none',
                }

            // Animación de flotación suave y desfasada para dar sensación viva
            const floatAnimClass = index === 0 ? 'animate-float-1' : index === 1 ? 'animate-float-2' : 'animate-float-3'

            return (
              <div
                key={center.id}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer bg-white text-left ${floatAnimClass} ${
                  isSelected ? theme.selectedCard : theme.hoverCard
                }`}
                onClick={() => onSelectCenter(center)}
              >
                {/* Franja superior viva intercalada */}
                <div className={`h-1.5 w-full transition-all duration-300 ${theme.stripe}`} />

                {/* Shimmer / Reflejo de luz en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3 relative z-10">
                  {/* Fila 1: Icono + Nombre + Badges */}
                  <div className="flex items-start gap-3">
                    <div className={`flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md transition-all duration-300 ${theme.iconBg}`}>
                      <Building2 className="size-5 sm:size-6 text-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3
                          className="font-bold text-slate-900 text-sm sm:text-base font-heading leading-snug line-clamp-1 group-hover:text-[#005a87] transition-colors"
                          title={center.name}
                        >
                          {center.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${theme.badge}`}>
                          {typeInfo.label}
                        </span>
                        {isSelected && (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs ${theme.selectedBadge}`}>
                            <Check className="size-3" /> Seleccionado
                          </span>
                        )}
                        {center.type === 'HOSPITAL' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Guardia 24h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fila 2: Dirección y Teléfono en formato horizontal compacto */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <MapPin className={`size-3.5 shrink-0 ${theme.pinColor}`} />
                      <span className="truncate">{center.address}, {center.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-slate-400">
                      <Phone className={`size-3 shrink-0 ${theme.phoneColor}`} />
                      <span className="text-[11px]">{center.phone.replace('03549 ', '')}</span>
                    </div>
                  </div>

                  {/* Fila 3: Especialidades y Botón Elegir Centro con Chevron deslizante */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs sm:text-sm font-bold text-slate-700">
                      {center.specialtiesCount} especialidades
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      aria-label={`Elegir centro de salud ${center.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isSelected && onProceed) {
                          onProceed()
                        } else {
                          onSelectCenter(center)
                        }
                      }}
                      className={`h-8 sm:h-9 cursor-pointer gap-1.5 px-3 sm:px-4 text-xs font-bold rounded-xl transition-all ${
                        isSelected
                          ? `${theme.buttonSelected} hover:opacity-95`
                          : `${theme.buttonUnselected} bg-white`
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <span>Elegir Especialidad</span>
                          <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>Elegir Centro</span>
                          <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List Mode: Directory Style con intercalado */
        <div className="flex flex-col gap-3.5">
          {centers.map((center, index) => {
            const isSelected = selectedCenter?.id === center.id
            const isTealTheme = index % 2 === 1
            const typeInfo = getCenterTypeBadge(center.type)

            const listStripe = isTealTheme
              ? (isSelected ? 'bg-gradient-to-b from-[#007064] to-[#00a896]' : 'bg-gradient-to-b from-[#007064]/40 to-[#00a896]/40 group-hover:from-[#007064] group-hover:to-[#00a896]')
              : (isSelected ? 'bg-gradient-to-b from-[#00486c] to-[#005a87]' : 'bg-gradient-to-b from-[#00486c]/40 to-[#005a87]/40 group-hover:from-[#00486c] group-hover:to-[#005a87]')

            const iconClass = isTealTheme
              ? 'bg-gradient-to-br from-[#007064] to-[#00a896] text-white shadow-[#00a896]/20'
              : 'bg-gradient-to-br from-[#00486c] to-[#005a87] text-white shadow-[#005a87]/20'

            return (
              <div
                key={center.id}
                onClick={() => onSelectCenter(center)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-4 sm:p-5 cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#005a87] ring-4 ring-[#00a896]/35 shadow-[0_20px_40px_-8px_rgba(0,90,135,0.35)] bg-gradient-to-r from-sky-50/50 via-teal-50/30 to-white -translate-y-2'
                    : 'border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(0,90,135,0.1)] hover:border-[#00a896]/80 hover:shadow-[0_22px_40px_-8px_rgba(0,168,150,0.25)] hover:-translate-y-2 hover:scale-[1.01]'
                }`}
              >
                {/* Franja lateral intercalada */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all ${listStripe}`} />

                {/* Shimmer / Reflejo de luz en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-md ${iconClass}`}>
                      <Building2 className="size-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-base sm:text-lg text-slate-900 font-heading">
                          {center.name}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${typeInfo.badgeClass}`}>
                          {typeInfo.label}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-2xs">
                            <Check className="size-3" /> Seleccionado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate mt-1">
                        {center.address} • {center.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-14 sm:pl-0">
                    <span className="text-sm sm:text-base font-bold text-slate-700">
                      {center.specialtiesCount} especialidades
                    </span>
                    <Button
                      type="button"
                      aria-label={`Elegir centro de salud ${center.name}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (isSelected && onProceed) {
                          onProceed()
                        } else {
                          onSelectCenter(center)
                        }
                      }}
                      className={`h-10 px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md'
                          : 'border-2 border-[#005a87] bg-white text-[#005a87] hover:bg-gradient-to-r hover:from-[#005a87] hover:to-[#00a896] hover:text-white hover:border-transparent'
                      }`}
                    >
                      <span>{isSelected ? 'Elegir Especialidad' : 'Elegir Centro'}</span>
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {centers.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-[#00a896]/30 p-12 text-center bg-white/90 shadow-sm">
          <Building2 className="mx-auto size-12 text-[#005a87]/40 mb-3" />
          <p className="text-base font-semibold text-slate-700">
            No se encontraron centros de salud con los filtros actuales en esta localidad.
          </p>
        </div>
      )}

      {/* Carrusel Interactivo de Obras Sociales y Prepagas (Colocado ABAJO de los centros) */}
      <div className="pt-2">
        <TurneroObrasSocialesCarousel />
      </div>

      {/* Barra de acción inferior con degradado y alto contraste */}
      {selectedCenter && (
        <div className="sticky bottom-2 sm:bottom-4 z-20 mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl border-2 border-teal-300/40 bg-gradient-to-r from-[#00486c] via-[#005a87] to-[#008f80] p-3.5 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full sm:w-auto">
            {onUnselectCenter && (
              <Button
                type="button"
                variant="outline"
                onClick={onUnselectCenter}
                className="h-10 px-3 sm:px-3.5 rounded-xl border-white/30 text-white hover:bg-white/20 font-bold gap-1 shrink-0 cursor-pointer text-xs sm:text-sm"
                title="Volver hacia atrás y cambiar centro"
              >
                <ChevronLeft className="size-4" />
                <span>Volver atrás</span>
              </Button>
            )}
            <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white text-[#005a87] font-bold shadow-md">
              <Check className="size-5 sm:size-7 text-[#005a87]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-teal-200">Centro Seleccionado</span>
              <h4 className="text-sm sm:text-lg font-bold text-white truncate">{selectedCenter.name}</h4>
              <p className="text-xs sm:text-sm text-sky-100 truncate">{selectedCenter.address}, {selectedCenter.neighborhood}</p>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={onProceed}
            className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-7 rounded-xl sm:rounded-2xl bg-white hover:bg-teal-50 text-[#005a87] font-extrabold text-xs sm:text-base shadow-xl gap-2 shrink-0 cursor-pointer transition-transform hover:scale-102"
          >
            <span>Siguiente: Elegir Especialidad</span>
            <ChevronRight className="size-4 sm:size-5 text-[#005a87]" />
          </Button>
        </div>
      )}
    </section>
  )
}
