import { Search, Stethoscope, Baby, HeartPulse, Bone, Activity, Eye, Smile, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  const iconProps = { className: 'size-5 text-sky-700' }
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
    <section className="space-y-6">
      {/* Context Banner */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="size-5 text-sky-700" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Centro Seleccionado</span>
            <p className="text-sm font-bold text-slate-900">{selectedCenter.name}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToCenter}
          className="cursor-pointer gap-1.5 self-start text-xs font-semibold sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Centro</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Paso 2: Seleccione la Especialidad Médica
        </h2>
        <p className="text-sm text-slate-600">
          Especialidades con servicio activo en {selectedCenter.name}.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder="Buscar especialidad..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* Specialties Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((specialty) => {
          const isSelected = selectedSpecialty?.id === specialty.id

          return (
            <Card
              key={specialty.id}
              className={`transition-all hover:border-sky-500 hover:shadow-sm ${
                isSelected ? 'border-2 border-sky-700 ring-2 ring-sky-100' : 'border-slate-200'
              }`}
            >
              <CardContent className="flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {renderSpecialtyIcon(specialty.iconName)}
                      <h3 className="text-sm font-bold text-slate-900">{specialty.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {specialty.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <Badge variant="secondary" className="text-[11px]">
                    {specialty.totalDoctors} profesionales
                  </Badge>
                  <Button
                    type="button"
                    onClick={() => onSelectSpecialty(specialty)}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="cursor-pointer gap-1.5 font-semibold text-xs"
                  >
                    <span>{isSelected ? 'Seleccionada' : 'Elegir'}</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {specialties.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            No se encontraron especialidades activas para la búsqueda en esta institución.
          </p>
        </div>
      )}
    </section>
  )
}
