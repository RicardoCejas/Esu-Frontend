import { User, Calendar, Award, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { HealthCenter, MedicalSpecialty, MedicalDoctor } from '../types'

interface Step3DoctorSelectionProps {
  selectedCenter: HealthCenter
  selectedSpecialty: MedicalSpecialty
  doctors: MedicalDoctor[]
  selectedDoctor: MedicalDoctor | null
  onSelectDoctor: (doctor: MedicalDoctor) => void
  onBackToSpecialty: () => void
}

export function Step3DoctorSelection({
  selectedCenter,
  selectedSpecialty,
  doctors,
  selectedDoctor,
  onSelectDoctor,
  onBackToSpecialty,
}: Step3DoctorSelectionProps) {
  return (
    <section className="space-y-6">
      {/* Context Banner */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="size-5 text-sky-700" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {selectedCenter.name}
            </span>
            <p className="text-sm font-bold text-slate-900">{selectedSpecialty.name}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToSpecialty}
          className="cursor-pointer gap-1.5 self-start text-xs font-semibold sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Especialidad</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Paso 3: Seleccione el Profesional Médico
        </h2>
        <p className="text-sm text-slate-600">
          Profesionales matriculados con atención disponible para {selectedSpecialty.name}.
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {doctors.map((doctor) => {
          const isSelected = selectedDoctor?.id === doctor.id

          return (
            <Card
              key={doctor.id}
              className={`transition-all hover:border-sky-500 hover:shadow-sm ${
                isSelected ? 'border-2 border-sky-700 ring-2 ring-sky-100' : 'border-slate-200'
              }`}
            >
              <CardContent className="flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <User className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{doctor.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Award className="size-3 text-slate-400" />
                          <span>{doctor.licenseNumber}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      {doctor.consultationType}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <p className="font-medium text-slate-700">
                      Días de atención: <span className="font-normal text-slate-600">{doctor.availableDays.join(', ')}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="size-3.5 text-emerald-700" />
                      <span className="font-semibold text-emerald-800">Próximo cupo: {doctor.nextAvailableDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    onClick={() => onSelectDoctor(doctor)}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="cursor-pointer gap-1.5 font-semibold text-xs"
                  >
                    <span>{isSelected ? 'Seleccionado' : 'Ver Horarios'}</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {doctors.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            No se registran médicos con agenda abierta para esta especialidad e institución en este momento.
          </p>
        </div>
      )}
    </section>
  )
}
