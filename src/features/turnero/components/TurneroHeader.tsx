import { Building2, Stethoscope, User, Calendar, RotateCcw } from 'lucide-react'
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
    <div className="border-b border-slate-200 bg-white py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Reserva de Turnos Médicos
          </h1>
          <p className="text-xs text-slate-500">
            Padrón unificado de instituciones y especialistas de Cruz del Eje
          </p>
        </div>

        {hasActiveSelection && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {selectedCenter && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                <Building2 className="size-3 text-sky-700" />
                <span className="truncate max-w-[180px]">{selectedCenter.name}</span>
              </span>
            )}
            {selectedSpecialty && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                <Stethoscope className="size-3 text-sky-700" />
                <span className="truncate max-w-[160px]">{selectedSpecialty.name}</span>
              </span>
            )}
            {selectedDoctor && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                <User className="size-3 text-sky-700" />
                <span>{selectedDoctor.name}</span>
              </span>
            )}
            {selectedDate && selectedSlotTime && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                <Calendar className="size-3 text-emerald-700" />
                <span>{selectedSlotTime} hs</span>
              </span>
            )}
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 cursor-pointer rounded-md px-2 py-0.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
              title="Reiniciar y comenzar desde el paso 1"
            >
              <RotateCcw className="size-3" />
              <span>Reiniciar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
