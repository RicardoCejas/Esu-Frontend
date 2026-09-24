import { Search, MapPin, Phone, Building2, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  { label: 'Clínicas Privadas', value: 'CLINICA' },
  { label: 'CAPS Comunitarios', value: 'CAPS' },
  { label: 'Consultorios', value: 'CONSULTORIO' },
]

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
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Paso 1: Seleccione el Centro de Salud o Consultorio
        </h2>
        <p className="text-sm text-slate-600">
          Elija una institución médica radicada en Cruz del Eje para consultar sus especialidades y profesionales disponibles.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar por nombre, barrio o dirección..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onTypeFilterChange(opt.value)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                typeFilter === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {centers.map((center) => {
          const isSelected = selectedCenter?.id === center.id

          return (
            <Card
              key={center.id}
              className={`transition-all hover:border-sky-500 hover:shadow-sm ${
                isSelected ? 'border-2 border-sky-700 ring-2 ring-sky-100' : 'border-slate-200'
              }`}
            >
              <CardContent className="flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-5 text-sky-700" />
                      <h3 className="font-bold text-slate-900">{center.name}</h3>
                    </div>
                    <Badge variant={center.type === 'HOSPITAL' ? 'default' : 'secondary'}>
                      {center.type}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-slate-400" />
                      <span>{center.address}, {center.neighborhood} ({center.city})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0 text-slate-400" />
                      <span>{center.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-700">
                    {center.specialtiesCount} especialidades activas
                  </span>
                  <Button
                    type="button"
                    onClick={() => onSelectCenter(center)}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="cursor-pointer gap-1.5 font-semibold"
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
          <p className="text-sm font-medium text-slate-600">
            No se encontraron centros de salud con el criterio de búsqueda ingresado.
          </p>
        </div>
      )}
    </section>
  )
}
