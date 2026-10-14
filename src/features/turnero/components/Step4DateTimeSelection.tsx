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
  onRetryAvailability,
  onProceed,
  onBackToDoctor,
}: Step4DateTimeSelectionProps) {
  const hasSlots = morningSlots.length + afternoonSlots.length > 0

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <User aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{selectedDoctor.name}</p>
            <p className="mt-0.5 text-xs text-slate-600">
              Matrícula {selectedDoctor.licenseNumber} · {selectedSpecialty.name}
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onBackToDoctor} className="self-start gap-1.5 sm:self-auto">
          <ChevronLeft aria-hidden="true" className="size-3.5" /> Cambiar médico
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">Seleccione fecha y horario</h2>
          <p className="text-xs text-slate-600">Elegí un horario libre para continuar con tu reserva.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="appointment-date" className="block text-xs font-semibold text-slate-700">Fecha del turno</label>
          <input
            id="appointment-date"
            type="date"
            min={formatLocalDate(new Date())}
            value={selectedDate}
            onChange={(event) => onSelectDate(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
          />
        </div>
      </div>

      {availabilityLoading && (
        <p role="status" aria-live="polite" className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          Consultando horarios disponibles…
        </p>
      )}
      {availabilityError && (
        <div role="alert" className="flex flex-col gap-3 rounded-lg border border-rose-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-rose-800">{availabilityError}</p>
          {availabilityCanRetry && (
            <Button type="button" variant="outline" onClick={onRetryAvailability} className="self-start sm:self-auto">Reintentar consulta</Button>
          )}
        </div>
      )}
      {!availabilityLoading && !availabilityError && !hasSlots && (
        <p role="status" className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
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

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:p-5">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${selectedSlot ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {selectedSlot ? <CheckCircle2 aria-hidden="true" className="size-5" /> : <Clock aria-hidden="true" className="size-5" />}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Horario seleccionado</p>
            {selectedSlot ? (
              <p className="text-sm font-bold text-slate-900">{selectedDate} · {selectedSlot.time} hs · {selectedDoctor.name}</p>
            ) : (
              <p className="text-xs text-slate-600">Seleccioná un horario disponible para continuar.</p>
            )}
          </div>
        </div>
        <Button type="button" onClick={onProceed} disabled={!selectedSlot || availabilityLoading || Boolean(availabilityError)} className="gap-1.5 bg-sky-700 text-white hover:bg-sky-800">
          Continuar a confirmación <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  )
}
