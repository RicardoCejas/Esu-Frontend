import { Clock, Sun, Moon, ChevronLeft, ChevronRight, User, CheckCircle2 } from 'lucide-react'
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
  { value: '2026-09-25', label: 'Viernes 25', sub: 'Sep' },
  { value: '2026-09-28', label: 'Lunes 28', sub: 'Sep' },
  { value: '2026-09-29', label: 'Martes 29', sub: 'Sep' },
  { value: '2026-09-30', label: 'Miércoles 30', sub: 'Sep' },
  { value: '2026-10-01', label: 'Jueves 01', sub: 'Oct' },
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
    <section className="space-y-4">
      {/* Compact Context Header */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <User className="size-4 text-sky-700" />
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="text-xs font-bold text-slate-900">{selectedDoctor.name}</span>
            <span className="text-xs text-slate-500">· {selectedSpecialty.name} ({selectedDoctor.licenseNumber})</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToDoctor}
          className="h-7 cursor-pointer gap-1 px-2.5 text-xs font-semibold self-start sm:self-auto"
        >
          <ChevronLeft className="size-3" />
          <span>Cambiar Médico</span>
        </Button>
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          4. Seleccione Fecha y Franja Horaria
        </h2>
        <p className="text-xs text-slate-500">
          Cupos presenciales en tiempo real
        </p>
      </div>

      {/* Date Selector Row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {UPCOMING_DATES.map((d) => {
          const isSelected = selectedDate === d.value
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => onSelectDate(d.value)}
              className={`cursor-pointer rounded-lg border p-2.5 text-center transition-all ${
                isSelected
                  ? 'border-sky-700 bg-sky-700 text-white shadow-xs font-bold'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold">{d.label}</p>
              <p className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>{d.sub}</p>
            </button>
          )
        })}
      </div>

      {/* Slots Section */}
      <Card className="border-slate-200">
        <CardContent className="space-y-5 p-4 sm:p-5">
          {/* Morning Slots */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Sun className="size-3.5 text-amber-600" />
              <span>Turno Mañana (08:00 a 12:30 hs)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {morningSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                        : isSelected
                          ? 'cursor-pointer bg-sky-700 text-white shadow-xs ring-2 ring-sky-300'
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
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Moon className="size-3.5 text-sky-700" />
              <span>Turno Tarde (16:00 a 19:30 hs)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {afternoonSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                        : isSelected
                          ? 'cursor-pointer bg-sky-700 text-white shadow-xs ring-2 ring-sky-300'
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

      {/* Prominent Action Card with Solid CTA Button */}
      <Card className="border border-slate-300 bg-white shadow-xs">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
              selectedSlot ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-400'
            }`}>
              {selectedSlot ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Horario para Consulta
              </p>
              {selectedSlot ? (
                <p className="text-sm font-bold text-slate-900">
                  {selectedDate} a las <span className="text-emerald-700 font-extrabold">{selectedSlot.time} hs</span> con {selectedDoctor.name}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Seleccione una pastilla de horario disponible arriba para habilitar el botón
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={onProceed}
            disabled={!selectedSlot}
            className={`h-10 px-5 text-xs font-bold transition-all ${
              selectedSlot
                ? 'cursor-pointer bg-sky-700 text-white hover:bg-sky-800 shadow-sm'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Continuar a Confirmación</span>
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
