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
      <div className="flex flex-col gap-3 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 via-white to-cyan-50/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-sm shadow-teal-600/20">
            <User className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-sm font-bold text-slate-900">{selectedDoctor.name}</span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                {selectedDoctor.licenseNumber}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Especialidad: <span className="font-semibold text-teal-700">{selectedSpecialty.name}</span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToDoctor}
          className="h-8 cursor-pointer gap-1.5 rounded-xl border-teal-200 bg-white/90 px-3 text-xs font-bold text-teal-800 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-900 self-start sm:self-auto shadow-xs"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Médico</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-xs">
              4
            </span>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Seleccione Fecha y Franja Horaria
            </h2>
          </div>
          <p className="text-xs text-slate-500 pl-8">
            Disponibilidad sincronizada en tiempo real para turnos presenciales
          </p>
        </div>
      </div>

      {/* Date Selector Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {UPCOMING_DATES.map((d) => {
          const isSelected = selectedDate === d.value
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => onSelectDate(d.value)}
              className={`group relative cursor-pointer rounded-2xl border p-3 text-center transition-all ${
                isSelected
                  ? 'border-teal-500 bg-gradient-to-b from-teal-600 to-cyan-700 text-white shadow-md shadow-teal-700/25 scale-[1.02]'
                  : 'border-slate-200/90 bg-white/90 backdrop-blur-xs text-slate-700 hover:border-teal-400 hover:bg-teal-50/40 hover:shadow-sm'
              }`}
            >
              <p className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {d.label}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-teal-100' : 'text-slate-400 group-hover:text-teal-600'}`}>
                {d.sub}
              </p>
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-xs">
                  <CheckCircle2 className="size-3 text-slate-900 stroke-[3]" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Slots Section */}
      <Card className="rounded-2xl border-teal-100 bg-white/95 shadow-md shadow-teal-900/5 backdrop-blur-xs">
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Morning Slots */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Sun className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Turno Mañana
                </span>
                <span className="ml-2 text-[11px] font-medium text-slate-400">08:00 a 12:30 hs</span>
              </div>
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
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-100/80 text-slate-400 line-through border border-slate-200/50'
                        : isSelected
                          ? 'cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/30 ring-2 ring-teal-400 scale-105'
                          : 'cursor-pointer border border-amber-200/80 bg-amber-50/50 text-amber-950 hover:border-amber-400 hover:bg-amber-100/70 hover:scale-[1.02]'
                    }`}
                  >
                    <Clock className={`size-3 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                    <span>{slot.time} hs</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <Moon className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                  Turno Tarde
                </span>
                <span className="ml-2 text-[11px] font-medium text-slate-400">16:00 a 19:30 hs</span>
              </div>
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
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-100/80 text-slate-400 line-through border border-slate-200/50'
                        : isSelected
                          ? 'cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/30 ring-2 ring-teal-400 scale-105'
                          : 'cursor-pointer border border-sky-200/80 bg-sky-50/50 text-sky-950 hover:border-sky-400 hover:bg-sky-100/70 hover:scale-[1.02]'
                    }`}
                  >
                    <Clock className={`size-3 ${isSelected ? 'text-white' : 'text-sky-600'}`} />
                    <span>{slot.time} hs</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prominent Action Card with Solid CTA Button */}
      <Card className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/90 via-white to-cyan-50/90 shadow-sm">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-all ${
              selectedSlot
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-200/80 text-slate-400'
            }`}>
              {selectedSlot ? <CheckCircle2 className="size-6" /> : <Clock className="size-6" />}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Horario Seleccionado
              </p>
              {selectedSlot ? (
                <p className="text-sm font-bold text-slate-900">
                  {selectedDate} a las <span className="text-teal-700 font-extrabold text-base">{selectedSlot.time} hs</span> con {selectedDoctor.name}
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
            className={`h-11 px-6 rounded-xl text-xs font-bold transition-all ${
              selectedSlot
                ? 'cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/30 hover:from-teal-700 hover:to-cyan-700 hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Continuar a Confirmación</span>
            <ChevronRight className="size-4 ml-1.5" />
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
