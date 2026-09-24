import { Building2, Stethoscope, User, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { HealthCenter, MedicalSpecialty, MedicalDoctor } from '../types'

interface TurneroHeaderProps {
  selectedCenter: HealthCenter | null
  selectedSpecialty: MedicalSpecialty | null
  selectedDoctor: MedicalDoctor | null
  selectedDate: string | null
  selectedSlotTime: string | null
  onReset: () => void
}

export function TurneroHeader({
  selectedCenter,
  selectedSpecialty,
  selectedDoctor,
  selectedDate,
  selectedSlotTime,
  onReset,
}: TurneroHeaderProps) {
  const hasActiveSelection = Boolean(selectedCenter || selectedSpecialty || selectedDoctor)

  return (
    <header className="border-b border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-[11px] tracking-wide uppercase">
              Cruz del Eje · Red Asistencial
            </Badge>
            <span className="text-xs font-medium text-slate-500">Sistema Público y Privado</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reserva de Turnos Médicos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestión secuencial de citas de salud en Cruz del Eje, Córdoba.
          </p>
        </div>

        {hasActiveSelection && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {selectedCenter && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-800">
                <Building2 className="size-3.5 text-sky-700" />
                {selectedCenter.name}
              </span>
            )}
            {selectedSpecialty && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-800">
                <Stethoscope className="size-3.5 text-sky-700" />
                {selectedSpecialty.name}
              </span>
            )}
            {selectedDoctor && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-800">
                <User className="size-3.5 text-sky-700" />
                {selectedDoctor.name}
              </span>
            )}
            {selectedDate && selectedSlotTime && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 ring-1 ring-emerald-600/30">
                <Calendar className="size-3.5 text-emerald-700" />
                {selectedSlotTime} hs
              </span>
            )}
            <button
              type="button"
              onClick={onReset}
              className="ml-1 cursor-pointer text-xs font-semibold text-rose-700 underline hover:text-rose-800"
            >
              Reiniciar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
