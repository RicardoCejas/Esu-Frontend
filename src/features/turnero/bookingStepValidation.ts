import { z } from 'zod'
import { formatLocalDate, isBookableSlot } from './availability.ts'
import type { AppointmentSlot, HealthCenter, MedicalDoctor, MedicalSpecialty } from './types'

type CenterSelection = Pick<HealthCenter, 'id'> | null
type SpecialtySelection = Pick<MedicalSpecialty, 'id'> | null
type DoctorSelection = Pick<MedicalDoctor, 'id'> | null
type SlotSelection = Pick<AppointmentSlot, 'id'> | null

const idSchema = z.string().trim().min(1)
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((date) => {
  const [year, month, day] = date.split('-').map(Number)
  return formatLocalDate(new Date(year ?? 0, (month ?? 1) - 1, day ?? 0)) === date
})

export const bookingStepSchemas = {
  center: z.object({ centerId: idSchema }),
  specialty: z.object({ centerId: idSchema, specialtyId: idSchema }),
  doctor: z.object({ centerId: idSchema, specialtyId: idSchema, doctorId: idSchema }),
  date: z.object({ date: dateSchema }),
  slot: z.object({
    centerId: idSchema,
    specialtyId: idSchema,
    doctorId: idSchema,
    date: dateSchema,
    slotId: idSchema,
  }),
}

export function canSelectCenter(center: CenterSelection, centers: CenterSelection[]): boolean {
  return bookingStepSchemas.center.safeParse({ centerId: center?.id }).success &&
    centers.some((candidate) => candidate?.id === center?.id)
}

export function canSelectSpecialty(
  center: CenterSelection,
  specialty: SpecialtySelection,
  specialties: SpecialtySelection[],
): boolean {
  return bookingStepSchemas.specialty.safeParse({ centerId: center?.id, specialtyId: specialty?.id }).success &&
    specialties.some((candidate) => candidate?.id === specialty?.id)
}

export function canSelectDoctor(
  center: CenterSelection,
  specialty: SpecialtySelection,
  doctor: DoctorSelection,
  doctors: DoctorSelection[],
): boolean {
  return bookingStepSchemas.doctor.safeParse({ centerId: center?.id, specialtyId: specialty?.id, doctorId: doctor?.id }).success &&
    doctors.some((candidate) => candidate?.id === doctor?.id)
}

export function canSelectDate(date: string, now = new Date()): boolean {
  return bookingStepSchemas.date.safeParse({ date }).success && date >= formatLocalDate(now)
}

export function canProceedToPatient(
  center: CenterSelection,
  specialty: SpecialtySelection,
  doctor: DoctorSelection,
  date: string,
  slot: SlotSelection,
  availableSlots: AppointmentSlot[],
  now = new Date(),
): boolean {
  if (!bookingStepSchemas.slot.safeParse({
    centerId: center?.id,
    specialtyId: specialty?.id,
    doctorId: doctor?.id,
    date,
    slotId: slot?.id,
  }).success) return false

  const currentSlot = availableSlots.find((candidate) => candidate.id === slot?.id)
  return Boolean(currentSlot && isBookableSlot(currentSlot, date, now))
}
