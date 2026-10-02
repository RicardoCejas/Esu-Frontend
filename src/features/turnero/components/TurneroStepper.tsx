import React from 'react'
import { Check } from 'lucide-react'
import type { BookingStep } from '../types'

interface StepConfig {
  number: BookingStep
  title: string
}

const STEPS: StepConfig[] = [
  { number: 1, title: '1. Centro de Salud' },
  { number: 2, title: '2. Especialidad' },
  { number: 3, title: '3. Profesional' },
  { number: 4, title: '4. Fecha y Horario' },
  { number: 5, title: '5. Confirmación' },
]

interface TurneroStepperProps {
  currentStep: BookingStep
  onGoToStep: (step: BookingStep) => void
}

export const TurneroStepper: React.FC<TurneroStepperProps> = ({ currentStep, onGoToStep }) => {
  return (
    <nav aria-label="Progreso del Turnero" className="sticky top-16 z-30 bg-slate-50/95 py-2.5 backdrop-blur-md border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 shadow-xs">
          {/* Mobile View */}
          <div className="flex h-9 items-center justify-between px-2 sm:hidden">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {currentStep}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {STEPS[currentStep - 1]?.title}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Paso {currentStep} de 5
            </span>
          </div>

          {/* Desktop View: Corporate clean stepper */}
          <ol className="hidden h-9 items-center justify-between gap-1 sm:flex px-1">
            {STEPS.map((step, idx) => {
              const isCompleted = step.number < currentStep
              const isCurrent = step.number === currentStep
              const isClickable = isCompleted

              return (
                <li key={step.number} className="flex flex-1 items-center">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onGoToStep(step.number)}
                    className={`group flex items-center gap-2 rounded-lg px-2.5 py-1 text-left transition-all ${
                      isClickable
                        ? 'cursor-pointer hover:bg-slate-100'
                        : isCurrent
                          ? 'bg-slate-100/90 border border-slate-200 shadow-2xs'
                          : 'cursor-default opacity-60'
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-slate-800 text-white'
                          : isCurrent
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isCompleted ? <Check className="size-3.5 stroke-[2.5]" /> : step.number}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-slate-900 font-bold'
                          : isCompleted
                            ? 'text-slate-700'
                            : 'text-slate-400'
                      }`}
                    >
                      {step.title.substring(3)}
                    </span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 rounded-full transition-all ${
                        step.number < currentStep
                          ? 'bg-slate-800'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </nav>
  )
}
