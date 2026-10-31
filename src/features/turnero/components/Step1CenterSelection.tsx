import React, { useState } from 'react'
import { Search, MapPin, Phone, Building2, ChevronRight, X, LayoutGrid, List, Check, ArrowRight } from 'lucide-react'
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
  onProceed,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [modalCenter, setModalCenter] = useState<HealthCenter | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = (center: HealthCenter) => {
    if (selectedCenter?.id === center.id) {
      onSelectCenter(center)
      if (onProceed) {
        onProceed()
      }
      return
    }
    setModalCenter(center)
    setIsModalOpen(true)
  }

  const handleConfirmCenter = () => {
    if (!modalCenter) return
    const centerToProceed = modalCenter
    setIsModalOpen(false)
    setModalCenter(null)
    onSelectCenter(centerToProceed)
    if (onProceed) {
      onProceed()
    }
  }

  return (
    <section className="space-y-6 sm:space-y-8 pb-16 sm:pb-20">
      {/* Controls Bar: Search, Category Chips & View Toggle */}
      <div className="flex flex-col gap-3.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-sky-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-6 shadow-md lg:flex-row lg:items-center lg:justify-between relative overflow-hidden">
        {/* Franja superior con degradado */}
        <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 font-heading">
            1. Seleccione el Centro de Salud o Consultorio
          </h2>
          <p className="text-xs sm:text-base text-slate-500 mt-0.5 sm:mt-1">
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

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {FILTER_OPTIONS.map((opt) => {
              const active = typeFilter === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTypeFilterChange(opt.value)}
                  className={`h-9 px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#005a87] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#005a87] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en lista"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {centers.map((center, index) => {
            const isSelected = selectedCenter?.id === center.id
            const isTealTheme = index % 2 === 1
            const typeInfo = getCenterTypeBadge(center.type)

            const theme = isTealTheme
              ? {
                  stripe: 'bg-gradient-to-r from-[#007064] via-[#008f80] to-[#00a896]',
                  iconBg: 'bg-gradient-to-br from-[#007064] to-[#00a896] shadow-md shadow-[#00a896]/20',
                  badge: typeInfo.badgeClass,
                  hoverCard: 'hover:border-[#00a896]/70 hover:shadow-xl hover:-translate-y-1',
                  selectedCard: 'border-[#00a896] ring-4 ring-[#00a896]/25 shadow-xl bg-teal-50/20 -translate-y-1',
                  buttonUnselected: 'border-2 border-[#00a896] text-[#007064] hover:bg-[#00a896] hover:text-white',
                  pinColor: 'text-[#007064]',
                  phoneColor: 'text-[#00a896]',
                  selectedBadge: 'bg-gradient-to-r from-[#007064] to-[#00a896] text-white',
                  buttonSelected: 'bg-gradient-to-r from-[#007064] to-[#00a896] text-white shadow-md shadow-[#00a896]/30 border-none',
                }
              : {
                  stripe: 'bg-gradient-to-r from-[#00486c] via-[#005a87] to-[#0284c7]',
                  iconBg: 'bg-gradient-to-br from-[#00486c] to-[#005a87] shadow-md shadow-[#005a87]/20',
                  badge: typeInfo.badgeClass,
                  hoverCard: 'hover:border-[#005a87]/70 hover:shadow-xl hover:-translate-y-1',
                  selectedCard: 'border-[#005a87] ring-4 ring-[#005a87]/25 shadow-xl bg-sky-50/20 -translate-y-1',
                  buttonUnselected: 'border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white',
                  pinColor: 'text-[#005a87]',
                  phoneColor: 'text-[#0284c7]',
                  selectedBadge: 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white',
                  buttonSelected: 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md shadow-[#005a87]/30 border-none',
                }

            return (
              <Card
                key={center.id}
                className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 cursor-pointer bg-white text-left ${
                  isSelected ? theme.selectedCard : theme.hoverCard
                }`}
                onClick={() => handleCardClick(center)}
              >
                {/* Franja superior intercalada */}
                <div className={`h-2 w-full transition-all duration-300 ${theme.stripe}`} />

                <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7 space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Icono con degradado intercalado */}
                      <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 ${theme.iconBg}`}>
                        <Building2 className="size-7 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-lg sm:text-xl font-heading leading-snug min-h-[3rem] line-clamp-2 group-hover:text-[#005a87] transition-colors">
                            {center.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`inline-block text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border ${theme.badge}`}>
                            {typeInfo.label}
                          </span>
                          {isSelected && (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs ${theme.selectedBadge}`}>
                              <Check className="size-3.5" /> Seleccionado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm sm:text-base text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <MapPin className={`size-4 shrink-0 ${theme.pinColor}`} />
                        <span className="line-clamp-1">{center.address}, {center.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className={`size-4 shrink-0 ${theme.phoneColor}`} />
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
                        handleCardClick(center)
                      }}
                      className={`h-10 sm:h-11 cursor-pointer gap-2 px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? `${theme.buttonSelected} hover:opacity-95`
                          : `${theme.buttonUnselected} bg-white`
                      }`}
                    >
                      <span>Elegir Centro</span>
                      <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                onClick={() => handleCardClick(center)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-5 sm:p-6 cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#005a87] ring-4 ring-[#00a896]/35 shadow-xl bg-gradient-to-r from-sky-50/50 via-teal-50/30 to-white -translate-y-1'
                    : 'border-slate-200/90 shadow-sm hover:border-[#00a896]/70 hover:shadow-lg hover:-translate-y-1.5'
                }`}
              >
                {/* Franja lateral intercalada */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all ${listStripe}`} />

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
                        handleCardClick(center)
                      }}
                      className={`h-10 px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-md'
                          : 'border-2 border-[#005a87] bg-white text-[#005a87] hover:bg-gradient-to-r hover:from-[#005a87] hover:to-[#00a896] hover:text-white hover:border-transparent'
                      }`}
                    >
                      <span>Elegir Centro</span>
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

      {/* Pop-up Modal de Confirmación de Centro de Salud */}
      {isModalOpen && modalCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xl space-y-0 animate-in zoom-in-95 duration-200">
            {/* Header del Pop-up con Degradado */}
            <div className="bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xs shadow-inner shrink-0">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 block">
                    Centro de Salud Seleccionado
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-white leading-snug">
                    {modalCenter.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setModalCenter(null)
                }}
                className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Cuerpo del Pop-up con Detalles */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl bg-sky-50/70 border border-sky-100 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="size-4 text-[#005a87] shrink-0" />
                  <span className="font-semibold">{modalCenter.address}, {modalCenter.neighborhood}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="size-4 text-[#00a896] shrink-0" />
                  <span className="font-semibold">{modalCenter.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 pt-1.5 border-t border-sky-100">
                  <span className="text-xs font-bold text-[#005a87]">
                    {modalCenter.specialtiesCount} Especialidades médicas habilitadas
                  </span>
                </div>
              </div>

              {/* Botones de acción del Pop-up */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false)
                    setModalCenter(null)
                  }}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm cursor-pointer"
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmCenter}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-[#005a87] to-[#00a896] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#005a87]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                >
                  <span>Siguiente: Elegir Especialidad</span>
                  <ArrowRight className="size-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
