import { Search, Stethoscope, Baby, HeartPulse, Bone, Activity, Eye, Smile, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
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

function renderSpecialtyIcon(name: string) {
  const iconProps = { className: 'size-4 text-sky-700' }
  switch (name) {
    case 'Baby': return <Baby {...iconProps} />
    case 'HeartPulse': return <HeartPulse {...iconProps} />
    case 'Bone': return <Bone {...iconProps} />
    case 'Activity': return <Activity {...iconProps} />
    case 'Eye': return <Eye {...iconProps} />
    case 'Smile': return <Smile {...iconProps} />
    default: return <Stethoscope {...iconProps} />
  }
}

export function Step2SpecialtySelection({
  selectedCenter,
  specialties,
  selectedSpecialty,
  searchTerm,
  onSearchChange,
  onSelectSpecialty,
  onBackToCenter,
}: Step2SpecialtySelectionProps) {
  return (
    <section className="space-y-4">
      {/* Compact Context & Controls Header */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Building2 className="size-4 text-sky-700" />
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="text-xs font-bold text-slate-900">{selectedCenter.name}</span>
            <span className="text-xs text-slate-500">· {selectedCenter.address}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToCenter}
          className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-semibold self-start sm:self-auto"
        >
          <ChevronLeft className="size-3" />
          <span>Cambiar Centro</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            2. Seleccione la Especialidad Médica
          </h2>
          <p className="text-xs text-slate-500">
            {specialties.length} especialidades con servicio activo en este centro
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar especialidad..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Specialties Grid: 3-4 columns on desktop */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {specialties.map((specialty) => {
          const isSelected = selectedSpecialty?.id === specialty.id

          return (
            <Card
              key={specialty.id}
              className={`transition-all hover:border-sky-500 hover:shadow-xs ${
                isSelected ? 'border-2 border-sky-700 ring-2 ring-sky-100' : 'border-slate-200'
              }`}
            >
              <CardContent className="flex h-full flex-col justify-between p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {renderSpecialtyIcon(specialty.iconName)}
                    <h3 className="text-sm font-bold text-slate-900">{specialty.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {specialty.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  {/* Clean text instead of badge */}
                  <span className="text-[11px] font-medium text-slate-500">
                    {specialty.totalDoctors} médicos
                  </span>
                  <Button
                    type="button"
                    onClick={() => onSelectSpecialty(specialty)}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-semibold"
                  >
                    <span>{isSelected ? 'Seleccionada' : 'Elegir'}</span>
                    <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {specialties.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-xs font-medium text-slate-600">
            No se encontraron especialidades activas para la búsqueda en esta institución.
          </p>
        </div>
      )}
    </section>
  )
}
