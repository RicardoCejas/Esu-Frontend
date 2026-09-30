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
    <div className="pt-6 pb-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-teal-500/25 bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 p-6 text-white shadow-xl">
          {/* Decorative Glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-0.5 text-[11px] font-bold text-teal-200 mb-1.5 shadow-xs">
                <span>Padrón Unificado • Cruz del Eje</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
                Reserva de Turnos Médicos Online
              </h1>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Hospitales, clínicas, dispensarios barriales y consultorios independientes
              </p>
            </div>

            {/* Breadcrumb de Selección Activa con Badges Coloridos */}
            {hasActiveSelection && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/10 p-2.5 backdrop-blur-md border border-white/15 text-xs">
                {selectedCenter && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500/30 border border-teal-300/40 px-3 py-1 font-bold text-teal-100 shadow-xs">
                    <Building2 className="size-3.5 text-teal-300 shrink-0" />
                    <span>{selectedCenter.name}</span>
                  </div>
                )}

                {selectedSpecialty && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/30 border border-amber-300/40 px-3 py-1 font-bold text-amber-100 shadow-xs">
                    <Stethoscope className="size-3.5 text-amber-300 shrink-0" />
                    <span>{selectedSpecialty.name}</span>
                  </div>
                )}

                {selectedDoctor && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500/30 border border-sky-300/40 px-3 py-1 font-bold text-sky-100 shadow-xs">
                    <User className="size-3.5 text-sky-300 shrink-0" />
                    <span>{selectedDoctor.name}</span>
                  </div>
                )}

                {selectedDate && selectedSlotTime && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/30 border border-emerald-300/40 px-3 py-1 font-bold text-emerald-100 shadow-xs animate-pulse">
                    <Calendar className="size-3.5 text-emerald-300 shrink-0" />
                    <span>{selectedSlotTime} hs</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onReset}
                  className="ml-1 inline-flex items-center gap-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 border border-rose-400/40 px-2.5 py-1 text-xs font-bold text-rose-200 transition cursor-pointer"
                  title="Reiniciar y comenzar desde el paso 1"
                >
                  <RotateCcw className="size-3" />
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
