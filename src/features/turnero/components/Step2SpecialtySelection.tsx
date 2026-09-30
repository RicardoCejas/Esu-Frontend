import { Search, Stethoscope, Baby, HeartPulse, Bone, Eye, Smile, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
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

function getSpecialtyTheme(name: string, iconName: string) {
  const lower = name.toLowerCase()
  if (iconName === 'Baby' || lower.includes('pediatr')) {
    return {
      Icon: Baby,
      iconContainer: 'bg-amber-500/15 text-amber-700',
      tag: 'Salud Infantil',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      accentBorder: 'border-t-amber-500',
      hoverBorder: 'hover:border-amber-400',
    }
  }
  if (iconName === 'HeartPulse' || lower.includes('cardio')) {
    return {
      Icon: HeartPulse,
      iconContainer: 'bg-rose-500/15 text-rose-700',
      tag: 'Cardiología & ECG',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      accentBorder: 'border-t-rose-500',
      hoverBorder: 'hover:border-rose-400',
    }
  }
  if (iconName === 'Bone' || lower.includes('trauma') || lower.includes('ortop')) {
    return {
      Icon: Bone,
      iconContainer: 'bg-blue-500/15 text-blue-700',
      tag: 'Huesos & Articulaciones',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      accentBorder: 'border-t-blue-500',
      hoverBorder: 'hover:border-blue-400',
    }
  }
  if (iconName === 'Eye' || lower.includes('oftalmo')) {
    return {
      Icon: Eye,
      iconContainer: 'bg-emerald-500/15 text-emerald-700',
      tag: 'Salud Visual',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accentBorder: 'border-t-emerald-500',
      hoverBorder: 'hover:border-emerald-400',
    }
  }
  if (iconName === 'Smile' || lower.includes('odonto')) {
    return {
      Icon: Smile,
      iconContainer: 'bg-cyan-500/15 text-cyan-700',
      tag: 'Salud Bucodental',
      badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      accentBorder: 'border-t-cyan-500',
      hoverBorder: 'hover:border-cyan-400',
    }
  }
  return {
    Icon: Stethoscope,
    iconContainer: 'bg-teal-500/15 text-teal-700',
    tag: 'Atención Primaria',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    accentBorder: 'border-t-teal-500',
    hoverBorder: 'hover:border-teal-400',
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
      {/* Context & Controls Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white/90 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Institución Elegida</span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">{selectedCenter.name}</h3>
            <span className="text-xs text-muted-foreground">{selectedCenter.address}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToCenter}
          className="h-8 cursor-pointer gap-1.5 px-3.5 text-xs font-bold rounded-full border-teal-300 text-teal-700 hover:bg-teal-50 self-start sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Centro</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 sm:text-lg font-heading">
            2. Seleccione la Especialidad Médica
          </h2>
          <p className="text-xs text-muted-foreground">
            {specialties.length} especialidades con servicio activo en este centro
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-teal-600" />
          <Input
            type="search"
            placeholder="Buscar especialidad..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-8 text-xs rounded-xl border-teal-200 bg-white shadow-xs focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Specialties Grid: 3-4 columns with colorful styling */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {specialties.map((specialty) => {
          const isSelected = selectedSpecialty?.id === specialty.id
          const theme = getSpecialtyTheme(specialty.name, specialty.iconName)
          const SpecialtyIcon = theme.Icon

          return (
            <Card
              key={specialty.id}
              className={`rounded-2xl border-t-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer bg-white/95 backdrop-blur-sm ${theme.accentBorder} ${
                isSelected
                  ? 'border-2 border-teal-600 ring-2 ring-teal-200 shadow-md'
                  : `border-slate-200 ${theme.hoverBorder}`
              }`}
              onClick={() => onSelectSpecialty(specialty)}
            >
              <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-2xl shadow-xs shrink-0 ${theme.iconContainer}`}>
                      <SpecialtyIcon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 font-heading leading-tight">
                        {specialty.name}
                      </h3>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded-md border ${theme.badge}`}>
                        {theme.tag}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {specialty.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {specialty.totalDoctors} médicos
                  </span>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSpecialty(specialty)
                    }}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 cursor-pointer gap-1 px-3 text-xs font-bold rounded-full transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'border-teal-300 text-teal-700 hover:bg-teal-600 hover:text-white'
                    }`}
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
          <p className="text-xs font-medium text-slate-600">
            No se encontraron especialidades activas para la búsqueda en esta institución.
          </p>
        </div>
      )}
    </section>
  )
}
