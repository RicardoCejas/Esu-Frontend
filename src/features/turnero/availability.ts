import type { AppointmentSlot } from './types'

export function isBackendProfessionalId(id: string): boolean {
  return /^[1-9]\d*$/.test(id)
}

export function parseAvailabilityResponse(payload: unknown): AppointmentSlot[] {
  if (!Array.isArray(payload)) {
    throw new Error('El formato de disponibilidad recibido no es válido.')
  }

  return payload.map((slot: unknown, index: number) => {
    if (
      typeof slot !== 'object' || slot === null ||
      !('id' in slot) || typeof slot.id !== 'string' ||
      !('time' in slot) || typeof slot.time !== 'string' || !isValidTime(slot.time) ||
      !('period' in slot) || (slot.period !== 'MORNING' && slot.period !== 'AFTERNOON') ||
      !('isAvailable' in slot) || typeof slot.isAvailable !== 'boolean'
    ) {
      throw new Error(`El horario ${index + 1} no tiene el formato de disponibilidad esperado.`)
    }

    return {
      id: slot.id,
      time: slot.time,
      period: slot.period,
      isAvailable: slot.isAvailable,
    }
  })
}

export function isBookableSlot(slot: AppointmentSlot, date: string, now = new Date()): boolean {
  if (!slot.isAvailable || !isValidDate(date) || !isValidTime(slot.time)) return false

  const today = formatLocalDate(now)
  if (date < today) return false
  if (date > today) return true

  const [hours, minutes] = slot.time.split(':').map(Number)
  const slotDate = new Date(now)
  slotDate.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return slotDate.getTime() > now.getTime()
}

function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  return formatLocalDate(new Date(year ?? 0, (month ?? 1) - 1, day ?? 0)) === date
}

function isValidTime(time: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(time)) return false
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 24) < 24 && (minutes ?? 60) < 60
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
