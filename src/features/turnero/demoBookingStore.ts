import { MOCK_MORNING_SLOTS, MOCK_AFTERNOON_SLOTS } from './data/mockTurneroData.ts'
import { patientBookingSchema } from './patientValidation.ts'
import { formatLocalDate, isBookableSlot } from './availability.ts'
import type { AppointmentSlot, MedicalDoctor, PatientBookingForm } from './types'

// Demo-only policy. This module is the source of truth for this browser tab;
// bookings are not persisted or shared with another user, browser or server.
export const DEMO_SCHEDULE = {
  morning: MOCK_MORNING_SLOTS,
  afternoon: MOCK_AFTERNOON_SLOTS,
} as const

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export interface DemoBookingRequest {
  centerId: string
  specialtyId: string
  doctor: Pick<MedicalDoctor, 'id' | 'specialtyId' | 'centerIds' | 'availableDays'>
  date: string
  slotId: string
  patient: PatientBookingForm
}

export interface DemoBooking extends DemoBookingRequest {
  code: string
  slot: AppointmentSlot
  appointmentAt: Date
  reminderAt: Date
  createdAt: Date
}

function appointmentDate(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

export function createDemoBookingStore(schedule = DEMO_SCHEDULE) {
  const bookings = new Map<string, DemoBooking>()
  let nextCode = 1
  const allSlots = [...schedule.morning, ...schedule.afternoon]
  const keyFor = (doctorId: string, date: string, slotId: string) => `${doctorId}|${date}|${slotId}`

  function getSlots(doctor: Pick<MedicalDoctor, 'id' | 'availableDays'>, date: string, now = new Date()): AppointmentSlot[] {
    const dateObject = appointmentDate(date, '12:00')
    if (Number.isNaN(dateObject.getTime()) || formatLocalDate(dateObject) !== date ||
      !doctor.availableDays.includes(WEEKDAYS[dateObject.getDay()])) return []
    return allSlots.map((slot) => ({
      ...slot,
      isAvailable: isBookableSlot(slot, date, now) && !bookings.has(keyFor(doctor.id, date, slot.id)),
    }))
  }

  function book(request: DemoBookingRequest, now = new Date()): DemoBooking {
    if (!request.doctor.centerIds.includes(request.centerId)) throw new Error('El centro no corresponde al profesional de demostración.')
    if (request.doctor.specialtyId !== request.specialtyId) throw new Error('La especialidad no corresponde al profesional de demostración.')
    if (!patientBookingSchema.safeParse(request.patient).success) throw new Error('Los datos del paciente son inválidos.')
    const slot = getSlots(request.doctor, request.date, now).find((candidate) => candidate.id === request.slotId)
    if (!slot?.isAvailable) throw new Error('El horario ya no está disponible para esta demostración. Elegí otro.')
    const appointmentAt = appointmentDate(request.date, slot.time)
    const booking: DemoBooking = {
      ...request,
      patient: { ...request.patient },
      slot,
      code: `DEMO-${String(nextCode++).padStart(4, '0')}`,
      appointmentAt,
      reminderAt: new Date(appointmentAt.getTime() - 24 * 60 * 60 * 1000),
      createdAt: new Date(now),
    }
    bookings.set(keyFor(request.doctor.id, request.date, request.slotId), booking)
    return booking
  }

  return { getSlots, book }
}

export const demoBookingStore = createDemoBookingStore()
