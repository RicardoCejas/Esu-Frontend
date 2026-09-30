import { User, Calendar, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react'
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
      {/* Context Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white/90 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Especialidad Elegida</span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">{selectedSpecialty.name}</h3>
            <span className="text-xs text-muted-foreground">{selectedCenter.name}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToSpecialty}
          className="h-8 cursor-pointer gap-1.5 px-3.5 text-xs font-bold rounded-full border-teal-300 text-teal-700 hover:bg-teal-50 self-start sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Especialidad</span>
        </Button>
      </div>

      <div className="pt-1">
        <h2 className="text-base font-extrabold text-slate-900 sm:text-lg font-heading">
          3. Seleccione el Profesional Médico
        </h2>
        <p className="text-xs text-muted-foreground">
          {doctors.length} profesionales matriculados con turnos disponibles
        </p>
      </div>

      {/* Doctors Grid: 3 columns on large desktop */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => {
          const isSelected = selectedDoctor?.id === doctor.id

          return (
            <Card
              key={doctor.id}
              className={`rounded-2xl border-t-4 border-t-teal-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer bg-white/95 backdrop-blur-sm ${
                isSelected
                  ? 'border-2 border-teal-600 ring-2 ring-teal-200 shadow-md'
                  : 'border-slate-200 hover:border-teal-400'
              }`}
              onClick={() => onSelectDoctor(doctor)}
            >
              <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Gradient Avatar Icon */}
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold shadow-md shadow-teal-600/20 shrink-0">
                        {doctor.name.split(' ').slice(1, 3).map(n => n[0]).join('') || <User className="size-5" />}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm font-heading leading-tight">
                          {doctor.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                            {doctor.licenseNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {doctor.consultationType === 'PRESENCIAL' ? 'Presencial' : 'Telemedicina'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <p className="text-xs">
                      <span className="font-bold text-slate-700">Días de atención: </span>
                      <span className="font-medium text-teal-900">{doctor.availableDays.join(', ')}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs pt-0.5">
                      <Calendar className="size-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-700">
                        Próximo cupo: {doctor.nextAvailableDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectDoctor(doctor)
                    }}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 cursor-pointer gap-1 px-3.5 text-xs font-bold rounded-full transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'border-teal-300 text-teal-700 hover:bg-teal-600 hover:text-white'
                    }`}
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
          <p className="text-xs font-medium text-slate-600">
            No se registran médicos con agenda abierta para esta especialidad e institución en este momento.
          </p>
        </div>
      )}
    </section>
  )
}
