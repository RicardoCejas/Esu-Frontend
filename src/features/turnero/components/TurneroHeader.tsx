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
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 border border-slate-700/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 mb-2">
                <span>Padrón Unificado • Cruz del Eje</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
                Reserva de Turnos Médicos Online
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Hospitales, clínicas, centros de atención primaria y consultorios del sistema unificado de salud.
              </p>
            </div>

            {/* Breadcrumb de Selección Activa Sobrio y Ejecutivo */}
            {hasActiveSelection && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-800/90 p-2 border border-slate-700/80 text-xs">
                {selectedCenter && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/90 border border-slate-700 px-3 py-1 text-slate-200 font-medium">
                    <Building2 className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[160px] sm:max-w-none">{selectedCenter.name}</span>
                  </div>
                )}

                {selectedSpecialty && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/90 border border-slate-700 px-3 py-1 text-slate-200 font-medium">
                    <Stethoscope className="size-3.5 text-slate-400 shrink-0" />
                    <span>{selectedSpecialty.name}</span>
                  </div>
                )}

                {selectedDoctor && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/90 border border-slate-700 px-3 py-1 text-slate-200 font-medium">
                    <User className="size-3.5 text-slate-400 shrink-0" />
                    <span>{selectedDoctor.name}</span>
                  </div>
                )}

                {selectedDate && selectedSlotTime && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-950/80 border border-sky-800/80 px-3 py-1 text-sky-200 font-medium">
                    <Calendar className="size-3.5 text-sky-400 shrink-0" />
                    <span>{selectedSlotTime} hs</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-slate-600/70 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  title="Reiniciar y comenzar desde el paso 1"
                >
                  <RotateCcw className="size-3 text-slate-400" />
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
