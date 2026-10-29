import { CheckCircle2, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AvailabilitySlotList } from './AvailabilitySlotList'
import { formatLocalDate } from '../availability'
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
  availabilityLoading: boolean
  availabilityError: string | null
  availabilityCanRetry: boolean
  bookingError?: string | null
  onRetryAvailability: () => void
  onProceed: () => void
  onBackToDoctor: () => void
}

export function Step4DateTimeSelection({
  selectedDoctor,
  selectedSpecialty,
  selectedDate,
  onSelectDate,
  morningSlots,
  afternoonSlots,
  selectedSlot,
  onSelectSlot,
  availabilityLoading,
  availabilityError,
  availabilityCanRetry,
  bookingError,
  onRetryAvailability,
  onProceed,
  onBackToDoctor,
}: Step4DateTimeSelectionProps) {
  const hasSlots = morningSlots.length + afternoonSlots.length > 0

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <User aria-hidden="true" className="size-6" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-bold text-slate-900">{selectedDoctor.name}</p>
            <p className="mt-0.5 text-sm sm:text-base text-slate-600">
              Matrícula {selectedDoctor.licenseNumber} · {selectedSpecialty.name}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToDoctor}
          className="h-10 cursor-pointer gap-2 px-4 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <ChevronLeft aria-hidden="true" className="size-4" /> <span>Cambiar médico</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">4. Seleccione Fecha y Horario</h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Elegí un horario libre para continuar con tu reserva.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="appointment-date" className="block text-xs sm:text-sm font-semibold text-slate-700">Fecha del turno</label>
          <input
            id="appointment-date"
            type="date"
            min={formatLocalDate(new Date())}
            value={selectedDate}
            onChange={(event) => onSelectDate(event.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm sm:text-base text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 shadow-xs"
          />
        </div>
      </div>

      {availabilityLoading && (
        <p role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm sm:text-base text-slate-700">
          Consultando horarios disponibles…
        </p>
      )}
      {availabilityError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-300 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm sm:text-base text-rose-800">{availabilityError}</p>
          {availabilityCanRetry && (
            <Button type="button" variant="outline" onClick={onRetryAvailability} className="h-10 px-4 text-xs sm:text-sm font-semibold self-start sm:self-auto">Reintentar consulta</Button>
          )}
        </div>
      )}
      {bookingError && <p role="alert" className="rounded-2xl border border-rose-700 bg-white p-6 text-sm sm:text-base font-medium text-rose-800">{bookingError}</p>}
      {!availabilityLoading && !availabilityError && !hasSlots && (
        <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm sm:text-base text-slate-700">
          No hay horarios disponibles para esta fecha. Probá con otro día.
        </p>
      )}
      {!availabilityLoading && !availabilityError && hasSlots && (
        <AvailabilitySlotList
          date={selectedDate}
          morningSlots={morningSlots}
          afternoonSlots={afternoonSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={onSelectSlot}
        />
      )}

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs sm:flex-row">
        <div className="flex items-center gap-4">
          <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${selectedSlot ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {selectedSlot ? <CheckCircle2 aria-hidden="true" className="size-6" /> : <Clock aria-hidden="true" className="size-6" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Horario seleccionado</p>
            {selectedSlot ? (
              <p className="text-base sm:text-lg font-bold text-slate-900">{selectedDate} · {selectedSlot.time} hs · {selectedDoctor.name}</p>
            ) : (
              <p className="text-sm text-slate-600">Seleccioná un horario disponible para continuar.</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          onClick={onProceed}
          disabled={!selectedSlot || availabilityLoading || Boolean(availabilityError)}
          className="h-11 px-5 cursor-pointer gap-2 bg-sky-700 text-sm sm:text-base font-bold text-white hover:bg-sky-800 rounded-xl"
        >
          <span>Continuar a confirmación</span> <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  )
}
