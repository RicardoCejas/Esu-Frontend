import { Clock, Sun, Moon, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MedicalDoctor, MedicalSpecialty, AppointmentSlot } from '../types'

interface Step4DateTimeSelectionProps {
  selectedDoctor: MedicalDoctor
  selectedSpecialty: MedicalSpecialty
  selectedDate: string
  onSelectDate: (date: string) => void
  morningSlots: AppointmentSlot[]
  afternoonSlots: AppointmentSlot[]
  selectedSlot: AppointmentSlot | null
  onSelectSlot: (slot: AppointmentSlot) => void
  onProceed: () => void
  onBackToDoctor: () => void
}

const UPCOMING_DATES = [
  { value: '2026-09-25', label: 'Viernes 25', sub: 'Sep 2026' },
  { value: '2026-09-28', label: 'Lunes 28', sub: 'Sep 2026' },
  { value: '2026-09-29', label: 'Martes 29', sub: 'Sep 2026' },
  { value: '2026-09-30', label: 'Miércoles 30', sub: 'Sep 2026' },
  { value: '2026-10-01', label: 'Jueves 01', sub: 'Oct 2026' },
]

export function Step4DateTimeSelection({
  selectedDoctor,
  selectedSpecialty,
  selectedDate,
  onSelectDate,
  morningSlots,
  afternoonSlots,
  selectedSlot,
  onSelectSlot,
  onProceed,
  onBackToDoctor,
}: Step4DateTimeSelectionProps) {
  return (
    <section className="space-y-6">
      {/* Context Banner */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <User className="size-5 text-sky-700" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {selectedSpecialty.name} · {selectedDoctor.licenseNumber}
            </span>
            <p className="text-sm font-bold text-slate-900">{selectedDoctor.name}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToDoctor}
          className="cursor-pointer gap-1.5 self-start text-xs font-semibold sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Médico</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Paso 4: Seleccione Fecha y Franja Horaria
        </h2>
        <p className="text-sm text-slate-600">
          Turnos disponibles en tiempo real para consulta médica presencial.
        </p>
      </div>

      {/* Date Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Fechas Disponibles
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {UPCOMING_DATES.map((d) => {
            const isSelected = selectedDate === d.value
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => onSelectDate(d.value)}
                className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${
                  isSelected
                    ? 'border-sky-700 bg-sky-700 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-bold">{d.label}</p>
                <p className={`text-[11px] ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>{d.sub}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slots Section */}
      <Card className="border-slate-200">
        <CardContent className="space-y-6 p-5">
          {/* Morning Slots */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Sun className="size-4 text-amber-600" />
              <span>Turno Mañana (08:00 a 12:30 hs)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {morningSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                        : isSelected
                          ? 'cursor-pointer bg-sky-700 text-white shadow-sm ring-2 ring-sky-300'
                          : 'cursor-pointer border border-slate-200 bg-white text-slate-800 hover:border-sky-600 hover:bg-sky-50'
                    }`}
                  >
                    <Clock className="size-3" />
                    <span>{slot.time} hs</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Moon className="size-4 text-sky-700" />
              <span>Turno Tarde (16:00 a 19:30 hs)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {afternoonSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                        : isSelected
                          ? 'cursor-pointer bg-sky-700 text-white shadow-sm ring-2 ring-sky-300'
                          : 'cursor-pointer border border-slate-200 bg-white text-slate-800 hover:border-sky-600 hover:bg-sky-50'
                    }`}
                  >
                    <Clock className="size-3" />
                    <span>{slot.time} hs</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proceed CTA */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-xs text-slate-600">
          {selectedSlot ? (
            <span className="font-semibold text-slate-900">
              Horario seleccionado: {selectedSlot.time} hs
            </span>
          ) : (
            'Por favor, seleccione un horario disponible para continuar.'
          )}
        </span>
        <Button
          type="button"
          onClick={onProceed}
          disabled={!selectedSlot}
          className="cursor-pointer gap-2 font-semibold"
        >
          <span>Continuar a Confirmación</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  )
}
