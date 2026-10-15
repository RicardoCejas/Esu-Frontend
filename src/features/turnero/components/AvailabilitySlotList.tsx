import { Clock, Moon, Sun } from 'lucide-react'
import type { AppointmentSlot } from '../types'
import { isBookableSlot } from '../availability'

interface AvailabilitySlotListProps {
  date: string
  morningSlots: AppointmentSlot[]
  afternoonSlots: AppointmentSlot[]
  selectedSlot: AppointmentSlot | null
  onSelectSlot: (slot: AppointmentSlot) => void
}

export function AvailabilitySlotList({
  date,
  morningSlots,
  afternoonSlots,
  selectedSlot,
  onSelectSlot,
}: AvailabilitySlotListProps) {
  const periods = [
    { label: 'Turno Mañana', Icon: Sun, slots: morningSlots },
    { label: 'Turno Tarde', Icon: Moon, slots: afternoonSlots },
  ]

  return (
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
      {periods.map(({ label, Icon, slots }) => (
        <section key={label} aria-label={label} className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Icon aria-hidden="true" className="size-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{label}</h3>
          </div>
          {slots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {slots.map((slot) => {
                const bookable = isBookableSlot(slot, date)
                const selected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!bookable}
                    aria-pressed={selected}
                    aria-label={`${slot.time} horas${bookable ? ', disponible' : ', no disponible'}`}
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                      !bookable
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 line-through'
                        : selected
                          ? 'border-sky-700 bg-sky-700 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-sky-700 hover:bg-sky-50'
                    }`}
                  >
                    <Clock aria-hidden="true" className="size-3" />
                    <span>{slot.time} hs</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-600">No hay horarios en esta franja.</p>
          )}
        </section>
      ))}
    </div>
  )
}
