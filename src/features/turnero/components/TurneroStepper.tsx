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
    <nav aria-label="Progreso del Turnero" className="bg-transparent py-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile View */}
        <div className="flex h-10 items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-sky-700 text-[10px] font-bold text-white">
              {currentStep}
            </span>
            <span className="text-xs font-bold text-slate-900">
              {STEPS[currentStep - 1]?.title}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Paso {currentStep} de 5</span>
        </div>

        {/* Desktop View: Compact single-row stepper */}
        <ol className="hidden h-11 items-center justify-between gap-2 sm:flex">
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
                  className={`group flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors ${
                    isClickable
                      ? 'cursor-pointer hover:bg-slate-200/60'
                      : 'cursor-default'
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                          ? 'bg-sky-700 text-white ring-2 ring-sky-200'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="size-3 stroke-[3]" /> : step.number}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-sky-800'
                        : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.title.substring(3)}
                  </span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-colors ${
                      step.number < currentStep ? 'bg-emerald-700' : 'bg-slate-200'
                    }`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
