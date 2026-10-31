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
    <nav aria-label="Progreso de la reserva" className="sticky top-16 z-30 border-b border-sky-200/60 bg-[#edf5fa]/90 backdrop-blur py-2 sm:py-2.5">
      <ol className="w-full flex gap-1 sm:gap-2 overflow-x-auto px-3 sm:px-8 lg:px-12 xl:px-14 scrollbar-none">
        {STEPS.map((step) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          const content = (
            <>
              <span aria-hidden="true" className={`flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-full text-[11px] sm:text-sm font-bold ${
                isCompleted || isCurrent ? 'bg-sky-700 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
              }`}>
                {isCompleted ? <Check className="size-3.5 sm:size-4" /> : step.number}
              </span>
              <span className="hidden whitespace-nowrap text-xs sm:text-sm font-semibold sm:inline">{step.title}</span>
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
                  className="flex w-full items-center justify-center gap-1.5 sm:gap-2.5 rounded-lg sm:rounded-xl px-1.5 sm:px-3 py-1 sm:py-2 text-slate-700 hover:bg-white/90 hover:text-sky-800 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 sm:justify-start cursor-pointer"
                >
                  {content}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Paso ${step.number} de ${STEPS.length}: ${step.title}${isCurrent ? ', actual' : ', pendiente'}`}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2.5 rounded-lg sm:rounded-xl px-1.5 sm:px-3 py-1 sm:py-2 sm:justify-start ${isCurrent ? 'bg-white font-bold text-sky-900 shadow-xs border border-sky-200/60' : 'text-slate-500'}`}
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
