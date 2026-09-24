export type CenterType = 'HOSPITAL' | 'CLINICA' | 'CAPS' | 'CONSULTORIO'

export interface HealthCenter {
  id: string
  name: string
  type: CenterType
  address: string
  neighborhood: string
  city: string
  phone: string
  specialtiesCount: number
  availableSpecialtyIds: string[]
}

export interface MedicalSpecialty {
  id: string
  name: string
  description: string
  iconName: string
  totalDoctors: number
}

export interface MedicalDoctor {
  id: string
  name: string
  specialtyId: string
  centerIds: string[]
  licenseNumber: string // Matrícula Provincial (MP)
  consultationType: 'PRESENCIAL' | 'VIRTUAL'
  availableDays: string[]
  nextAvailableDate: string
}

export interface AppointmentSlot {
  id: string
  time: string
  period: 'MORNING' | 'AFTERNOON'
  isAvailable: boolean
}

export interface PatientBookingForm {
  dni: string
  firstName: string
  lastName: string
  phone: string
  email: string
  healthInsurance: string // Obra Social / Prepaga / Particular
  affiliateNumber: string
  notes?: string
}

export interface ConfirmedAppointment {
  bookingCode: string
  center: HealthCenter
  specialty: MedicalSpecialty
  doctor: MedicalDoctor
  date: string
  slot: AppointmentSlot
  patient: PatientBookingForm
  createdAt: string
}

export type BookingStep = 1 | 2 | 3 | 4 | 5
