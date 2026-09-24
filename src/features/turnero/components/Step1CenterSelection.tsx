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
      {/* Compact Controls Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            1. Seleccione el Centro de Salud o Consultorio
          </h2>
          <p className="text-xs text-slate-500">
            {centers.length} instituciones médicas disponibles en Cruz del Eje
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTypeFilterChange(opt.value)}
                className={`cursor-pointer rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  typeFilter === opt.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Centers Grid: 3 columns on large screens to use horizontal space */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {centers.map((center) => {
          const isSelected = selectedCenter?.id === center.id

          return (
            <Card
              key={center.id}
              className={`transition-all hover:border-sky-500 hover:shadow-xs ${
                isSelected ? 'border-2 border-sky-700 ring-2 ring-sky-100' : 'border-slate-200'
              }`}
            >
              <CardContent className="flex h-full flex-col justify-between p-4">
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="size-4 shrink-0 text-sky-700" />
                      <h3 className="font-bold text-slate-900 text-sm">{center.name}</h3>
                    </div>
                    {/* Typographic metadata without vibecoded badge */}
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {getCenterTypeLabel(center.type)}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3 shrink-0 text-slate-400" />
                      <span className="truncate">{center.address}, {center.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3 shrink-0 text-slate-400" />
                      <span>{center.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-700">
                    {center.specialtiesCount} especialidades
                  </span>
                  <Button
                    type="button"
                    onClick={() => onSelectCenter(center)}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-semibold"
                  >
                    <span>{isSelected ? 'Seleccionado' : 'Elegir'}</span>
                    <ChevronRight className="size-3" />
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
