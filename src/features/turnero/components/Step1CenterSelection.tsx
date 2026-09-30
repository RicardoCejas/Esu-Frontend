import { Search, MapPin, Phone, Building2, ChevronRight } from 'lucide-react'
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

function getCenterTypeLabel(type: CenterType): string {
  switch (type) {
    case 'HOSPITAL': return 'Hospital Provincial Público'
    case 'CLINICA': return 'Clínica Médica Privada'
    case 'CAPS': return 'Centro de Atención Primaria (Municipal)'
    case 'CONSULTORIO': return 'Consultorios Externos'
  }
}

function getCenterColorTheme(type: CenterType) {
  switch (type) {
    case 'HOSPITAL':
      return {
        badge: 'bg-rose-500/10 text-rose-700 border-rose-300',
        iconContainer: 'bg-rose-500/15 text-rose-600',
        accentBorder: 'border-t-rose-500',
        hoverBorder: 'hover:border-rose-400',
      }
    case 'CLINICA':
      return {
        badge: 'bg-sky-500/10 text-sky-700 border-sky-300',
        iconContainer: 'bg-sky-500/15 text-sky-600',
        accentBorder: 'border-t-sky-500',
        hoverBorder: 'hover:border-sky-400',
      }
    case 'CAPS':
      return {
        badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
        iconContainer: 'bg-emerald-500/15 text-emerald-600',
        accentBorder: 'border-t-emerald-500',
        hoverBorder: 'hover:border-emerald-400',
      }
    case 'CONSULTORIO':
    default:
      return {
        badge: 'bg-amber-500/10 text-amber-800 border-amber-300',
        iconContainer: 'bg-amber-500/15 text-amber-700',
        accentBorder: 'border-t-amber-500',
        hoverBorder: 'hover:border-amber-400',
      }
  }
}

export function Step1CenterSelection({
  centers,
  selectedCenter,
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onSelectCenter,
}: Step1CenterSelectionProps) {
  return (
    <section className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white/90 p-4 shadow-sm backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 sm:text-lg font-heading">
            1. Seleccione el Centro de Salud o Consultorio
          </h2>
          <p className="text-xs text-muted-foreground">
            {centers.length} instituciones médicas disponibles en Cruz del Eje
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-teal-600" />
            <Input
              type="search"
              placeholder="Buscar por nombre o calle..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-8 text-xs rounded-xl border-teal-200 bg-white shadow-xs focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = typeFilter === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTypeFilterChange(opt.value)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-all shadow-xs ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-teal-700/25 scale-105'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50/50'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Centers Grid: 3 columns on large screens with vibrant color themes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {centers.map((center) => {
          const isSelected = selectedCenter?.id === center.id
          const theme = getCenterColorTheme(center.type)

          return (
            <Card
              key={center.id}
              className={`rounded-2xl border-t-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer bg-white/95 backdrop-blur-sm ${theme.accentBorder} ${
                isSelected
                  ? 'border-2 border-teal-600 ring-2 ring-teal-200 shadow-md'
                  : `border-slate-200 ${theme.hoverBorder}`
              }`}
              onClick={() => onSelectCenter(center)}
            >
              <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex size-10 items-center justify-center rounded-2xl shadow-xs shrink-0 ${theme.iconContainer}`}>
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm font-heading leading-tight">
                          {center.name}
                        </h3>
                        <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded-md border ${theme.badge}`}>
                          {getCenterTypeLabel(center.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0 text-teal-600" />
                      <span className="truncate">{center.address}, {center.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5 shrink-0 text-teal-600" />
                      <span>{center.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
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
                    className={`h-8 cursor-pointer gap-1 px-3 text-xs font-bold rounded-full transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'border-teal-300 text-teal-700 hover:bg-teal-600 hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Seleccionado' : 'Elegir Centro'}</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {centers.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-xs font-medium text-slate-600">
            No se encontraron centros de salud con los filtros actuales en esta localidad.
          </p>
        </div>
      )}
    </section>
  )
}
