import React from 'react'
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

export const Step4DateTimeSelection: React.FC<Step4DateTimeSelectionProps> = ({
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
}) => {
  return (
    <section className="space-y-4">
      {/* Context Banner: Selected Doctor */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <User className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-sm font-bold text-slate-900 font-heading">{selectedDoctor.name}</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-600 border border-slate-200">
                {selectedDoctor.licenseNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Especialidad: <span className="font-semibold text-slate-800">{selectedSpecialty.name}</span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToDoctor}
          className="h-8 cursor-pointer gap-1.5 rounded-lg border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Médico</span>
        </Button>
      </div>

      <div className="pt-1">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg font-heading">
          4. Seleccione Fecha y Franja Horaria
        </h2>
        <p className="text-xs text-slate-500">
          Disponibilidad sincronizada en tiempo real con la agenda del profesional
        </p>
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
              className={`group relative cursor-pointer rounded-xl border p-3 text-center transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {d.label}
              </p>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                {d.sub}
              </p>
            </button>
          )
        })}
      </div>

      {/* Slots Section */}
      <Card className="rounded-2xl border-slate-200 bg-white shadow-xs">
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Morning Slots */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Sun className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Turno Mañana
                </span>
                <span className="ml-2 text-[11px] text-slate-400">08:00 a 12:30 hs</span>
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
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-50 text-slate-300 line-through border border-slate-100'
                        : isSelected
                          ? 'cursor-pointer bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20'
                          : 'cursor-pointer border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className={`size-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{slot.time} hs</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Moon className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Turno Tarde
                </span>
                <span className="ml-2 text-[11px] text-slate-400">16:00 a 19:30 hs</span>
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
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                      !slot.isAvailable
                        ? 'cursor-not-allowed bg-slate-50 text-slate-300 line-through border border-slate-100'
                        : isSelected
                          ? 'cursor-pointer bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20'
                          : 'cursor-pointer border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className={`size-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{slot.time} hs</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prominent Action Card with Solid CTA Button */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                selectedSlot
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {selectedSlot ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Horario Seleccionado
              </p>
              {selectedSlot ? (
                <p className="text-sm font-bold text-slate-900">
                  {selectedDate} a las <span className="text-slate-900 font-extrabold">{selectedSlot.time} hs</span> con {selectedDoctor.name}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Seleccione un horario disponible arriba para continuar
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={onProceed}
            disabled={!selectedSlot}
            className={`h-10 px-6 rounded-lg text-xs font-semibold transition-all ${
              selectedSlot
                ? 'cursor-pointer bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
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
