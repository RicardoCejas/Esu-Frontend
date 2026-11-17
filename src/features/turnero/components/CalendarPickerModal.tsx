import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Check,
  Stethoscope,
  FlaskConical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatLocalDate } from '../availability'
import type { TipoAtencionTurno } from '../types'

interface CalendarPickerModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  onSelectDate: (date: string) => void
  availableDays?: string[]
  doctorOrServiceName?: string
  tipoAtencion?: TipoAtencionTurno
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

export const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  availableDays = [],
  doctorOrServiceName,
  tipoAtencion = 'CONSULTA',
}) => {
  const today = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => formatLocalDate(today), [today])

  // Fecha para navegar entre meses
  const [navDate, setNavDate] = useState(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number)
      if (y && m && d) return new Date(y, m - 1, 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  if (!isOpen) return null

  const year = navDate.getFullYear()
  const month = navDate.getMonth()

  const monthName = navDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  // Desactivar mes anterior si es anterior al mes actual
  const isPrevDisabled =
    year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth())

  // Limitar hasta 3 meses a futuro
  const maxFutureDate = new Date(today.getFullYear(), today.getMonth() + 3, 1)
  const isNextDisabled =
    navDate >= maxFutureDate

  const handlePrevMonth = () => {
    if (!isPrevDisabled) {
      setNavDate(new Date(year, month - 1, 1))
    }
  }

  const handleNextMonth = () => {
    if (!isNextDisabled) {
      setNavDate(new Date(year, month + 1, 1))
    }
  }

  // Días de la semana normalizados del profesional (ej: ['martes', 'jueves'])
  const daysNormalized = availableDays.map(normalize)

  // Generar la grilla de días del mes
  // Primer día del mes (0=Dom, 1=Lun, ..., 6=Sáb) -> convertir a Lunes=0, Dom=6
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const offsetDays = (firstDayOfMonth + 6) % 7 // Lunes = 0

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  interface CalendarDayItem {
    dayNumber: number
    dateStr: string
    isPast: boolean
    isToday: boolean
    isSelected: boolean
    attends: boolean
    isSunday: boolean
  }
  const days: CalendarDayItem[] = []
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    const dateStr = formatLocalDate(d)
    const dayOfWeek = d.getDay() // 0=Dom, 6=Sáb
    const isPast = dateStr < todayStr
    const isToday = dateStr === todayStr
    const isSelected = dateStr === selectedDate

    const weekdayLong = d.toLocaleDateString('es-AR', { weekday: 'long' })
    const weekdayNorm = normalize(weekdayLong)

    // Atiende: si es estudio (Lun-Vie) o coincide con días del doctor
    let attends = false
    if (!isPast && dayOfWeek !== 0) {
      if (tipoAtencion === 'ESTUDIO') {
        attends = dayOfWeek >= 1 && dayOfWeek <= 5
      } else if (daysNormalized.length === 0) {
        attends = dayOfWeek >= 1 && dayOfWeek <= 5
      } else {
        attends = daysNormalized.some((dn) => weekdayNorm.includes(dn) || dn.includes(weekdayNorm))
      }
    }

    days.push({
      dayNumber: i,
      dateStr,
      isPast,
      isToday,
      isSelected,
      attends,
      isSunday: dayOfWeek === 0,
    })
  }

  const handleSelectDay = (dateStr: string, selectable: boolean) => {
    if (!selectable) return
    onSelectDate(dateStr)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Selector de calendario completo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white overflow-hidden shadow-2xl space-y-0 animate-in zoom-in-95 duration-150">
        {/* Cabecera con Degradado y Detalles */}
        <div className="bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896] p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs shadow-inner shrink-0">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">
                  Calendario de Turnos
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Seleccionar Fecha de Atención
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
              title="Cerrar calendario"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Información del médico o estudio */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/15 px-3 py-1.5 text-xs text-sky-100 backdrop-blur-2xs">
            {tipoAtencion === 'ESTUDIO' ? (
              <FlaskConical className="size-3.5 shrink-0 text-teal-300" />
            ) : (
              <Stethoscope className="size-3.5 shrink-0 text-sky-300" />
            )}
            <span className="truncate">
              <strong>{doctorOrServiceName || 'Profesional'}</strong>
              {availableDays.length > 0 && ` • Atiende: ${availableDays.join(', ')}`}
            </span>
          </div>
        </div>

        {/* Cuerpo del Calendario */}
        <div className="p-5 space-y-4">
          {/* Navegación de Mes */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-[#005a87] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {monthNameCapitalized}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextDisabled}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-[#005a87] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Días de la semana (LUN a DOM) */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-1 text-[11px] font-extrabold tracking-wider uppercase ${
                  idx >= 5 ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Grilla de Días */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Espacios vacíos de offset */}
            {Array.from({ length: offsetDays }).map((_, i) => (
              <div key={`offset-${i}`} className="h-9 sm:h-10" />
            ))}

            {/* Días del mes */}
            {days.map((d) => {
              const selectable = !d.isPast && !d.isSunday && d.attends

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  disabled={!selectable}
                  onClick={() => handleSelectDay(d.dateStr, selectable)}
                  className={`relative flex h-9 sm:h-10 flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    d.isSelected
                      ? 'bg-gradient-to-b from-[#005a87] to-[#0284c7] text-white font-black shadow-md ring-2 ring-[#00a896] scale-105 z-10'
                      : d.isPast || d.isSunday
                      ? 'text-slate-300 bg-transparent cursor-not-allowed'
                      : d.attends
                      ? 'bg-sky-50/70 text-slate-900 border border-sky-200/80 hover:bg-[#005a87] hover:text-white hover:border-[#005a87] hover:shadow-xs'
                      : 'text-slate-400 bg-slate-50/50 cursor-not-allowed hover:bg-slate-100'
                  } ${d.isToday && !d.isSelected ? 'border-2 border-[#00a896] font-bold' : ''}`}
                >
                  <span>{d.dayNumber}</span>

                  {/* Punto verde de día en que atiende el profesional */}
                  {d.attends && !d.isSelected && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-emerald-500" />
                  )}

                  {/* Indicador de seleccionado */}
                  {d.isSelected && (
                    <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[#00a896] text-white text-[8px]">
                      <Check className="size-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Leyenda y Acciones */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                <span>Atiende este día</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#005a87] inline-block" />
                <span>Seleccionado</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNavDate(new Date(today.getFullYear(), today.getMonth(), 1))
                  // Buscar el primer día de atención disponible desde hoy
                  const nextDay = days.find((d) => !d.isPast && d.attends)
                  if (nextDay) {
                    onSelectDate(nextDay.dateStr)
                    onClose()
                  }
                }}
                className="text-xs font-semibold text-[#005a87] hover:bg-sky-50 cursor-pointer h-8 px-2.5"
              >
                Próximo día disponible
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs font-semibold rounded-xl h-8 px-3 cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
