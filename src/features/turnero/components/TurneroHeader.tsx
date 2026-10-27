import React from 'react'
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

export const TurneroHeader: React.FC<TurneroHeaderProps> = ({
  selectedCenter,
  selectedSpecialty,
  selectedDoctor,
  selectedDate,
  selectedSlotTime,
  onReset,
}) => {
  const hasActiveSelection = Boolean(selectedCenter || selectedSpecialty || selectedDoctor)

  return (
    <div className="pt-6 pb-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-sky-100 bg-[#edf5fa] p-6 text-slate-900 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-white border border-sky-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800 mb-2 shadow-xs">
                <span>Padrón Unificado • Cruz del Eje</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900">
                Reserva de Turnos Médicos Online
              </h1>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                Hospitales, clínicas y centros del sistema unificado de salud de Cruz del Eje.
              </p>
            </div>

            {/* Breadcrumb de Selección Activa Sobrio y Ejecutivo */}
            {hasActiveSelection && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/90 p-2 border border-sky-200/80 text-xs shadow-xs">
                {selectedCenter && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/70 px-3 py-1 text-slate-800 font-medium">
                    <Building2 className="size-3.5 text-sky-600 shrink-0" />
                    <span className="truncate max-w-[160px] sm:max-w-none">{selectedCenter.name}</span>
                  </div>
                )}

                {selectedSpecialty && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/70 px-3 py-1 text-slate-800 font-medium">
                    <Stethoscope className="size-3.5 text-sky-600 shrink-0" />
                    <span>{selectedSpecialty.name}</span>
                  </div>
                )}

                {selectedDoctor && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/70 px-3 py-1 text-slate-800 font-medium">
                    <User className="size-3.5 text-sky-600 shrink-0" />
                    <span>{selectedDoctor.name}</span>
                  </div>
                )}

                {selectedDate && selectedSlotTime && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100/80 border border-sky-300 px-3 py-1 text-sky-900 font-medium">
                    <Calendar className="size-3.5 text-sky-700 shrink-0" />
                    <span>{selectedSlotTime} hs</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                  title="Reiniciar y comenzar desde el paso 1"
                >
                  <RotateCcw className="size-3 text-slate-500" />
                  <span>Reiniciar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
