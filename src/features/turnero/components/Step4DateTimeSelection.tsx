import { useMemo, useRef, useEffect, useState } from 'react'
import {
  ChevronLeft,
  Clock,
  Calendar,
  Stethoscope,
  CalendarDays,
  CalendarCheck,
  X,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AvailabilitySlotList } from './AvailabilitySlotList'
import { formatLocalDate } from '../availability'
import type { MedicalDoctor, MedicalSpecialty, AppointmentSlot } from '../types'

interface Step4DateTimeSelectionProps {
  selectedDoctor: MedicalDoctor
  selectedSpecialty: MedicalSpecialty
  selectedDate: string
  onSelectDate: (date: string) => void
  morningSlots: AppointmentSlot[]
  afternoonSlots: AppointmentSlot[]
  selectedSlot: AppointmentSlot | null
  onSelectSlot: (slot: AppointmentSlot) => void
  availabilityLoading: boolean
  availabilityError: string | null
  availabilityCanRetry: boolean
  bookingError?: string | null
  onRetryAvailability: () => void
  onProceed: () => void
  onBackToDoctor: () => void
}

interface DateOption {
  dateStr: string
  dayFullName: string
  dayNumber: string
  monthFullName: string
  isToday: boolean
  isTomorrow: boolean
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

// Genera ÚNICAMENTE los días en los que el profesional atiende (sin sábados ni días inactivos)
function getUpcomingDates(doctorAvailableDays: string[] = []): DateOption[] {
  const dates: DateOption[] = []
  const today = new Date()
  const daysNormalized = doctorAvailableDays.map(normalize)

  // Escanear hasta 40 días hacia adelante para encontrar al menos 10-12 fechas activas del doctor
  for (let i = 0; i < 40 && dates.length < 12; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)

    // Omitir domingos
    if (d.getDay() === 0) continue

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const fullWeekday = d.toLocaleDateString('es-AR', { weekday: 'long' })
    const fullMonth = d.toLocaleDateString('es-AR', { month: 'long' })
    const fullWeekdayNorm = normalize(fullWeekday)

    // Solo incluir si coincide con los días de atención habitual del doctor
    const isAttendingDay =
      daysNormalized.length === 0 ||
      daysNormalized.some((dn) => fullWeekdayNorm.includes(dn) || dn.includes(fullWeekdayNorm))

    if (!isAttendingDay) {
      continue
    }

    const dayNameCapitalized = fullWeekday.charAt(0).toUpperCase() + fullWeekday.slice(1)
    const monthNameCapitalized = fullMonth.charAt(0).toUpperCase() + fullMonth.slice(1)

    dates.push({
      dateStr,
      dayFullName: dayNameCapitalized,
      dayNumber: String(d.getDate()),
      monthFullName: monthNameCapitalized,
      isToday: i === 0,
      isTomorrow: i === 1,
    })
  }

  return dates
}

// Formateo de fecha legible en español
function formatSpanishDateDisplay(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  } catch {
    return dateStr
  }
}

export function Step4DateTimeSelection({
  selectedDoctor,
  selectedSpecialty,
  selectedDate,
  onSelectDate,
  morningSlots,
  afternoonSlots,
  selectedSlot,
  onSelectSlot,
  availabilityLoading,
  availabilityError,
  availabilityCanRetry,
  bookingError,
  onRetryAvailability,
  onProceed,
  onBackToDoctor,
}: Step4DateTimeSelectionProps) {
  const hasSlots = morningSlots.length + afternoonSlots.length > 0
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [confirmSlot, setConfirmSlot] = useState<AppointmentSlot | null>(null)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)

  // Próximas fechas donde ÚNICAMENTE atiende el doctor seleccionado
  const upcomingDates = useMemo(() => {
    return getUpcomingDates(selectedDoctor.availableDays)
  }, [selectedDoctor.availableDays])

  // Si la fecha actual no es un día de atención del doctor, seleccionar automáticamente la primera fecha disponible
  useEffect(() => {
    if (upcomingDates.length > 0 && !upcomingDates.some((d) => d.dateStr === selectedDate)) {
      onSelectDate(upcomingDates[0].dateStr)
    }
  }, [upcomingDates, selectedDate, onSelectDate])

  // Abrir el selector nativo fácilmente al hacer clic en el botón de calendario completo
  const handleOpenCalendarPicker = () => {
    if (dateInputRef.current) {
      if ('showPicker' in dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker()
      } else {
        dateInputRef.current.focus()
        dateInputRef.current.click()
      }
    }
  }

  // Al hacer clic en un horario libre: abre el Pop-up de confirmación de fecha y horario
  const handleSlotClick = (slot: AppointmentSlot) => {
    onSelectSlot(slot)
    setConfirmSlot(slot)
    setIsSlotModalOpen(true)
  }

  const handleConfirmAndProceed = () => {
    if (confirmSlot) {
      onSelectSlot(confirmSlot)
    }
    setIsSlotModalOpen(false)
    setConfirmSlot(null)
    onProceed()
  }

  return (
    <section className="space-y-4 sm:space-y-6 pb-20 sm:pb-24">
      {/* 1. Context Banner: Profesional y Especialidad seleccionados */}
      <div className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-sky-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#00a896] text-white shadow-md shadow-[#00a896]/25">
            <Stethoscope className="size-6 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#005a87]">
              Profesional Seleccionado
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading truncate">
              {selectedDoctor.name}
            </h3>
            <span className="text-xs sm:text-sm text-slate-500 truncate block">
              {selectedSpecialty.name} • Consulta Presencial
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToDoctor}
          className="h-9 sm:h-10 cursor-pointer gap-1.5 px-4 text-xs sm:text-sm font-bold rounded-xl border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white transition-all self-start sm:self-auto shrink-0 shadow-2xs"
        >
          <ChevronLeft className="size-4" />
          <span>Cambiar médico</span>
        </Button>
      </div>

      {/* 2. Selector Visual de Días que atiende este profesional (Formato Completo: Lunes 2 de Noviembre) */}
      <div className="rounded-2xl sm:rounded-3xl border border-sky-100 bg-white/95 backdrop-blur-md p-4 sm:p-6 shadow-xs space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-10 sm:h-11 bg-[#005a87] rounded-full shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 font-heading leading-tight">
                4. Seleccione Fecha y Horario
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                Días de atención confirmados para {selectedDoctor.name}. Tocá para ver horarios disponibles.
              </p>
            </div>
          </div>

          {/* Botón interactivo para elegir otra fecha en calendario completo */}
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              min={formatLocalDate(new Date())}
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
              tabIndex={-1}
              aria-label="Seleccionar fecha"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenCalendarPicker}
              className="h-10 px-4 rounded-xl border border-sky-200 bg-sky-50/70 text-[#005a87] hover:bg-[#005a87] hover:text-white font-semibold text-xs sm:text-sm gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <CalendarDays className="size-4" />
              <span>Ver calendario completo</span>
            </Button>
          </div>
        </div>

        {/* Carrusel / Franja de Cuadros con Fecha Completa: "Lunes 2 de Noviembre" */}
        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-sky-200">
          {upcomingDates.map((item) => {
            const isSelected = selectedDate === item.dateStr

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => onSelectDate(item.dateStr)}
                className={`group flex min-w-[135px] sm:min-w-[155px] shrink-0 flex-col items-center justify-center rounded-2xl p-3 sm:p-3.5 border-2 transition-all duration-200 cursor-pointer text-center relative overflow-hidden ${
                  isSelected
                    ? 'border-[#005a87] bg-gradient-to-b from-[#005a87] to-[#0284c7] text-white shadow-lg ring-2 ring-[#00a896]/40 scale-102'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-[#005a87] hover:bg-sky-50/50 hover:shadow-xs'
                }`}
              >
                {/* Franja superior de selección */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
                    isSelected
                      ? 'bg-[#00a896] opacity-100'
                      : 'bg-gradient-to-r from-[#005a87] to-[#00a896] opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Línea 1: "Lunes 2 de" */}
                <span
                  className={`text-xs sm:text-sm font-bold tracking-tight capitalize ${
                    isSelected ? 'text-sky-100' : 'text-slate-600 group-hover:text-[#005a87]'
                  }`}
                >
                  {item.dayFullName} {item.dayNumber} de
                </span>

                {/* Línea 2: "Noviembre" */}
                <span
                  className={`text-base sm:text-lg font-black font-heading capitalize mt-0.5 leading-snug ${
                    isSelected ? 'text-white' : 'text-slate-900 group-hover:text-[#005a87]'
                  }`}
                >
                  {item.monthFullName}
                </span>

                {/* Indicador de estado */}
                <div
                  className={`mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold ${
                    isSelected ? 'text-teal-200 font-bold' : 'text-emerald-600'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="size-3 text-teal-200 shrink-0" />
                      <span>Seleccionado</span>
                    </>
                  ) : (
                    <>
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      <span>Disponible</span>
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Indicador de Fecha Actualmente Seleccionada */}
        <div className="rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[#005a87]" />
            <span>
              Mostrando horarios para el{' '}
              <strong className="text-slate-900 capitalize">
                {formatSpanishDateDisplay(selectedDate)}
              </strong>
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Días de atención: {selectedDoctor.availableDays.join(', ')}
          </span>
        </div>
      </div>

      {/* 3. Estados de Carga y Disponibilidad */}
      {availabilityLoading && (
        <div role="status" aria-live="polite" className="rounded-2xl border border-sky-100 bg-white p-6 text-sm text-slate-700 flex items-center gap-3 shadow-xs">
          <Clock className="size-5 text-[#005a87] animate-spin" />
          <span>Consultando turnos disponibles en tiempo real…</span>
        </div>
      )}

      {availabilityError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-300 bg-white p-6 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <p className="text-sm font-semibold text-rose-800">{availabilityError}</p>
          {availabilityCanRetry && (
            <Button
              type="button"
              variant="outline"
              onClick={onRetryAvailability}
              className="h-10 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer"
            >
              Reintentar consulta
            </Button>
          )}
        </div>
      )}

      {bookingError && (
        <p role="alert" className="rounded-2xl border border-rose-700 bg-white p-6 text-sm font-medium text-rose-800 shadow-xs">
          {bookingError}
        </p>
      )}

      {!availabilityLoading && !availabilityError && !hasSlots && (
        <div role="status" className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 shadow-xs">
          <Clock className="mx-auto size-8 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-800">No hay horarios disponibles para esta fecha.</p>
          <p className="text-xs text-slate-500 mt-1">
            Por favor, seleccioná otra fecha disponible en la barra superior.
          </p>
        </div>
      )}

      {/* 4. Lista de Horarios Disponibles de Mañana y Tarde (Al tocar abre Pop-up de confirmación) */}
      {!availabilityLoading && !availabilityError && hasSlots && (
        <AvailabilitySlotList
          date={selectedDate}
          morningSlots={morningSlots}
          afternoonSlots={afternoonSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSlotClick}
        />
      )}

      {/* Pop-up Modal de Confirmación de Fecha y Horario */}
      {isSlotModalOpen && confirmSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xl space-y-0 animate-in zoom-in-95 duration-200">
            {/* Header del Pop-up con Degradado */}
            <div className="bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xs shadow-inner shrink-0">
                  <CalendarCheck className="size-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 block">
                    Confirmación de Turno
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-white leading-snug">
                    Fecha y Horario Seleccionado
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSlotModalOpen(false)
                  setConfirmSlot(null)
                }}
                className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Cuerpo del Pop-up con Detalles Completos */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl bg-sky-50/70 border border-sky-100 p-4 space-y-3">
                <div className="flex items-start gap-3 text-slate-800">
                  <Stethoscope className="size-5 text-[#005a87] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{selectedDoctor.name}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {selectedSpecialty.name} • Consulta Presencial
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-100 space-y-2">
                  <div className="flex items-center gap-2.5 text-slate-800">
                    <Calendar className="size-4 text-[#00a896] shrink-0" />
                    <span className="font-semibold capitalize">
                      {formatSpanishDateDisplay(selectedDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800">
                    <Clock className="size-4 text-[#005a87] shrink-0" />
                    <span className="font-bold text-sm text-[#005a87]">
                      {confirmSlot.time} hs
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({confirmSlot.period === 'MORNING' ? 'Turno Mañana' : 'Turno Tarde'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción del Pop-up */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSlotModalOpen(false)
                    setConfirmSlot(null)
                  }}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm cursor-pointer"
                >
                  Elegir otro horario
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmAndProceed}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-[#005a87] to-[#00a896] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#005a87]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                >
                  <span>Siguiente: Datos del Paciente</span>
                  <ArrowRight className="size-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
