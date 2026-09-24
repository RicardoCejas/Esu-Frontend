import { Check } from 'lucide-react'
import type { BookingStep } from '../types'

interface StepConfig {
  number: BookingStep
  title: string
  subtitle: string
}

const STEPS: StepConfig[] = [
  { number: 1, title: 'Centro de Salud', subtitle: 'Institución médica' },
  { number: 2, title: 'Especialidad', subtitle: 'Área de atención' },
  { number: 3, title: 'Profesional', subtitle: 'Médico tratante' },
  { number: 4, title: 'Fecha y Hora', subtitle: 'Turnos disponibles' },
  { number: 5, title: 'Confirmación', subtitle: 'Datos y comprobante' },
]

interface TurneroStepperProps {
  currentStep: BookingStep
  onGoToStep: (step: BookingStep) => void
}

export function TurneroStepper({ currentStep, onGoToStep }: TurneroStepperProps) {
  return (
    <nav aria-label="Progreso de Reserva" className="border-b border-slate-200 bg-slate-50 py-4">
      <div className="mx-auto max-w-5xl px-4">
        {/* Mobile View */}
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">
              {currentStep}
            </span>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-900">{STEPS[currentStep - 1]?.title}</p>
              <p className="text-[11px] text-slate-500">Paso {currentStep} de 5</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500">{Math.round((currentStep / 5) * 100)}%</span>
        </div>

        {/* Desktop View */}
        <ol className="hidden items-center justify-between sm:flex">
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
                  className={`group flex items-center gap-3 text-left transition-colors ${
                    isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                          ? 'bg-sky-700 text-white ring-4 ring-sky-100'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <Check className="size-4 stroke-[3]" /> : step.number}
                  </span>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-sky-800'
                          : isCompleted
                            ? 'text-slate-900'
                            : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{step.subtitle}</p>
                  </div>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-3 h-0.5 flex-1 transition-colors ${
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
