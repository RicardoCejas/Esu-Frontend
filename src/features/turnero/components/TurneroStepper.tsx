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

export function TurneroStepper({ currentStep, onGoToStep }: TurneroStepperProps) {
  return (
    <nav aria-label="Progreso del Turnero" className="py-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-teal-100 bg-white/80 p-2 sm:p-2.5 shadow-sm backdrop-blur-md">
          {/* Mobile View */}
          <div className="flex h-10 items-center justify-between px-2 sm:hidden">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-xs">
                {currentStep}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {STEPS[currentStep - 1]?.title}
              </span>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Paso {currentStep} de 5
            </span>
          </div>

          {/* Desktop View: Compact single-row stepper with vibrant colors */}
          <ol className="hidden h-10 items-center justify-between gap-2 sm:flex px-2">
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
                    className={`group flex items-center gap-2 rounded-xl px-2.5 py-1 text-left transition-all ${
                      isClickable
                        ? 'cursor-pointer hover:bg-teal-50/80'
                        : isCurrent
                          ? 'bg-teal-50/80 border border-teal-200/80 shadow-xs'
                          : 'cursor-default opacity-60'
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : isCurrent
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/30 scale-105'
                            : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : step.number}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-teal-900'
                          : isCompleted
                            ? 'text-slate-800'
                            : 'text-slate-400'
                      }`}
                    >
                      {step.title.substring(3)}
                    </span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-1 flex-1 rounded-full transition-all ${
                        step.number < currentStep
                          ? 'bg-emerald-500'
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
