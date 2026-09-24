import { User, Calendar, Award, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <section className="space-y-4">
      {/* Compact Context Header */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Stethoscope className="size-4 text-sky-700" />
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="text-xs font-bold text-slate-900">{selectedSpecialty.name}</span>
            <span className="text-xs text-slate-500">· {selectedCenter.name}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToSpecialty}
          className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-semibold self-start sm:self-auto"
        >
          <ChevronLeft className="size-3" />
          <span>Cambiar Especialidad</span>
        </Button>
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          3. Seleccione el Profesional Médico
        </h2>
        <p className="text-xs text-slate-500">
          {doctors.length} profesionales matriculados con turnos disponibles
        </p>
      </div>

      {/* Doctors Grid: 3 columns on large desktop */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => {
          const isSelected = selectedDoctor?.id === doctor.id

          return (
            <Card
              key={doctor.id}
              className={`transition-all hover:border-sky-500 hover:shadow-xs ${
                isSelected ? 'border-2 border-sky-700 ring-2 ring-sky-100' : 'border-slate-200'
              }`}
            >
              <CardContent className="flex h-full flex-col justify-between p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <User className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{doctor.name}</h3>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Award className="size-3 text-slate-400" />
                          <span>{doctor.licenseNumber}</span>
                        </div>
                      </div>
                    </div>
                    {/* Clean typography indicator instead of vibecoded badge */}
                    <span className="text-[10px] font-semibold text-slate-500">
                      {doctor.consultationType === 'PRESENCIAL' ? 'Presencial' : 'Telemedicina'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <p className="text-[11px]">
                      Días: <span className="font-medium text-slate-800">{doctor.availableDays.join(', ')}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="size-3 text-emerald-700" />
                      <span className="font-semibold text-emerald-800">
                        Próximo cupo: {doctor.nextAvailableDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    onClick={() => onSelectDoctor(doctor)}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-semibold"
                  >
                    <span>{isSelected ? 'Seleccionado' : 'Ver Horarios'}</span>
                    <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {doctors.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-xs font-medium text-slate-600">
            No se registran médicos con agenda abierta para esta especialidad e institución en este momento.
          </p>
        </div>
      )}
    </section>
  )
}
