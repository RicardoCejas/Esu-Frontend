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
    <div className="bg-transparent pt-4 pb-2">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Reserva de Turnos Médicos
          </h1>
          <p className="text-xs text-slate-500">
            Padrón unificado de instituciones y especialistas de Cruz del Eje
          </p>
        </div>

        {/* Static Accessible Metadata Breadcrumb directly on the general background */}
        {hasActiveSelection && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            {selectedCenter && (
              <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                <Building2 className="size-4 text-sky-700 shrink-0" />
                <span className="font-bold text-slate-900">{selectedCenter.name}</span>
              </div>
            )}

            {selectedSpecialty && (
              <>
                <span className="text-slate-400 select-none">/</span>
                <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <Stethoscope className="size-4 text-sky-700 shrink-0" />
                  <span className="font-semibold text-slate-800">{selectedSpecialty.name}</span>
                </div>
              </>
            )}

            {selectedDoctor && (
              <>
                <span className="text-slate-400 select-none">/</span>
                <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <User className="size-4 text-sky-700 shrink-0" />
                  <span className="font-semibold text-slate-900">{selectedDoctor.name}</span>
                </div>
              </>
            )}

            {selectedDate && selectedSlotTime && (
              <>
                <span className="text-slate-400 select-none">/</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-emerald-700 shrink-0" />
                  <span className="font-extrabold text-emerald-700">{selectedSlotTime} hs</span>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={onReset}
              className="ml-2 inline-flex items-center gap-1 cursor-pointer text-xs font-bold text-rose-700 hover:text-rose-900 underline underline-offset-2 transition-colors"
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
