import { Check } from 'lucide-react'
import type { BookingStep } from '../types'

const STEPS: { number: BookingStep; title: string }[] = [
  { number: 1, title: 'Centro de Salud' },
  { number: 2, title: 'Especialidad' },
  { number: 3, title: 'Profesional' },
  { number: 4, title: 'Fecha y Horario' },
  { number: 5, title: 'Confirmación' },
]

interface TurneroStepperProps {
  currentStep: BookingStep
  onGoToStep: (step: BookingStep) => void
}

export function TurneroStepper({ currentStep, onGoToStep }: TurneroStepperProps) {
  return (
    <nav aria-label="Progreso de la reserva" className="sticky top-16 z-30 border-b border-slate-200 bg-slate-50 py-2.5">
      <ol className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {STEPS.map((step) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          const content = (
            <>
              <span aria-hidden="true" className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isCompleted || isCurrent ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isCompleted ? <Check className="size-3.5" /> : step.number}
              </span>
              <span className="hidden whitespace-nowrap text-xs font-semibold sm:inline">{step.title}</span>
              <span className="sr-only sm:hidden">{step.title}</span>
            </>
          )
          return (
            <li key={step.number} className="min-w-0 flex-1">
              {isCompleted ? (
                <button
                  type="button"
                  aria-label={`Volver al paso ${step.number}: ${step.title}`}
                  onClick={() => onGoToStep(step.number)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 sm:justify-start"
                >
                  {content}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Paso ${step.number} de ${STEPS.length}: ${step.title}${isCurrent ? ', actual' : ', pendiente'}`}
                  className={`flex items-center justify-center gap-2 rounded-lg px-2.5 py-2 sm:justify-start ${isCurrent ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600'}`}
                >
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
