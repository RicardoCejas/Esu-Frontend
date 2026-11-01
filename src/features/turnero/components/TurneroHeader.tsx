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
    <div className="pt-3 sm:pt-6 pb-1 sm:pb-2">
      <div className="w-full px-3 sm:px-8 lg:px-12 xl:px-14">
        <div className="rounded-2xl sm:rounded-3xl border border-teal-300/40 bg-gradient-to-r from-[#00486c] via-[#005a87] to-[#008f80] p-4 sm:p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
          {/* Auras decorativas que reflejan los tonos del logo */}
          <div className="absolute -right-12 -bottom-12 size-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute right-1/4 -top-12 size-56 rounded-full bg-[#14b8a6]/25 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-sm font-semibold text-white mb-1.5 sm:mb-2.5 shadow-xs">
                <span className="size-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                <span>Padrón Unificado • Cruz del Eje</span>
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading text-white drop-shadow-xs">
                Reserva de Turnos Médicos Online
              </h1>
              <p className="text-xs sm:text-base text-sky-100 mt-1 max-w-2xl leading-relaxed">
                Hospitales, clínicas y centros del sistema unificado de salud de Cruz del Eje.
              </p>
            </div>

            {/* Breadcrumb de Selección Activa en Alto Contraste */}
            {hasActiveSelection && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md p-2 sm:p-2.5 border border-white/25 text-xs sm:text-sm shadow-sm">
                {selectedCenter && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-white text-slate-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bold text-xs sm:text-sm shadow-xs">
                    <Building2 className="size-3.5 sm:size-4 text-[#005a87] shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{selectedCenter.name}</span>
                  </div>
                )}

                {selectedSpecialty && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-white text-slate-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bold text-xs sm:text-sm shadow-xs">
                    <Stethoscope className="size-3.5 sm:size-4 text-[#008f80] shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{selectedSpecialty.name}</span>
                  </div>
                )}

                {selectedDoctor && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-white text-slate-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bold text-xs sm:text-sm shadow-xs">
                    <User className="size-3.5 sm:size-4 text-[#005a87] shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{selectedDoctor.name}</span>
                  </div>
                )}

                {selectedDate && selectedSlotTime && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-[#2dd4bf] text-teal-950 px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bold text-xs sm:text-sm shadow-xs">
                    <Calendar className="size-3.5 sm:size-4 text-teal-900 shrink-0" />
                    <span>{selectedSlotTime} hs</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-white transition cursor-pointer"
                  title="Reiniciar y comenzar desde el paso 1"
                >
                  <RotateCcw className="size-3 sm:size-3.5 text-white/80" />
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
