import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAvailability } from './useAvailability'
import { formatLocalDate, isBookableSlot } from '../availability'
import {
  canSelectCenter,
  canSelectSpecialty,
  canSelectDoctor,
  canSelectDate,
  canProceedToPatient,
} from '../bookingStepValidation'
import type {
  HealthCenter,
  MedicalSpecialty,
  MedicalDoctor,
  AppointmentSlot,
  PatientBookingForm,
  BookingStep,
  CenterType,
} from '../types'
import {
  MOCK_CENTERS,
  MOCK_SPECIALTIES,
  MOCK_DOCTORS,
} from '../data/mockTurneroData'

const INITIAL_PATIENT_FORM: PatientBookingForm = {
  dni: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  healthInsurance: 'Particular (Sin cobertura)',
  affiliateNumber: '',
  notes: '',
}

export function useTurnero() {
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState<BookingStep>(1)

  // Step 1: Health Center state
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null)
  const [centerSearch, setCenterSearch] = useState('')
  const [centerTypeFilter, setCenterTypeFilter] = useState<CenterType | 'ALL'>('ALL')

  // Step 2: Specialty state
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | null>(null)
  const [specialtySearch, setSpecialtySearch] = useState('')

  // Step 3: Doctor state
  const [selectedDoctor, setSelectedDoctor] = useState<MedicalDoctor | null>(null)

  // Step 4: Date & Slot state
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate(new Date()))
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const availability = useAvailability(selectedDoctor?.id ?? '', selectedDate)

  // Step 5: Patient Form state
  const [patientForm, setPatientForm] = useState<PatientBookingForm>(INITIAL_PATIENT_FORM)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // HU-FE-64: Preselección automática si el paciente ingresa desde la Ficha Pública del Profesional
  useEffect(() => {
    const profId = searchParams.get('profesionalId') || searchParams.get('doctorId')
    const espId = searchParams.get('especialidadId')
    const centerId = searchParams.get('centroSaludId')

    if (profId) {
      const matchedDoctor =
        MOCK_DOCTORS.find(
          (d) => d.id === profId || d.id.includes(profId) || profId.includes(d.id)
        ) || MOCK_DOCTORS[0]

      if (matchedDoctor) {
        const targetCenterId = centerId || matchedDoctor.centerIds?.[0] || 'cde-hosp-crespo'
        const matchedCenter =
          MOCK_CENTERS.find((c) => c.id === targetCenterId) || MOCK_CENTERS[0]

        const targetSpecId = espId || matchedDoctor.specialtyId
        const matchedSpec =
          MOCK_SPECIALTIES.find((s) => s.id === targetSpecId) ||
          MOCK_SPECIALTIES.find((s) => s.id === matchedDoctor.specialtyId) ||
          MOCK_SPECIALTIES[0]

        setSelectedCenter(matchedCenter)
        setSelectedSpecialty(matchedSpec)
        setSelectedDoctor(matchedDoctor)
        setCurrentStep(4) // Avanza directo a selección de fecha y hora
      }
    } else if (centerId) {
      const matchedCenter =
        MOCK_CENTERS.find((c) => c.id === centerId || c.name.toLowerCase().includes(centerId.toLowerCase())) ||
        (centerId.includes('crespo') ? MOCK_CENTERS.find(c => c.id.includes('crespo')) : null) ||
        (centerId.includes('cabrera') ? MOCK_CENTERS.find(c => c.id.includes('cabrera')) : null) ||
        (centerId.includes('diag') ? MOCK_CENTERS.find(c => c.id.includes('diag')) : null)

      if (matchedCenter) {
        setSelectedCenter(matchedCenter)
        setCurrentStep(2) // Avanza directo a selección de especialidad sin re-elegir centro
      }
    }
  }, [searchParams])

  // Filtered Centers
  const filteredCenters = useMemo(() => {
    return MOCK_CENTERS.filter((center) => {
      const matchesSearch =
        center.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
        center.neighborhood.toLowerCase().includes(centerSearch.toLowerCase()) ||
        center.address.toLowerCase().includes(centerSearch.toLowerCase())

      const matchesType = centerTypeFilter === 'ALL' || center.type === centerTypeFilter
      return matchesSearch && matchesType
    })
  }, [centerSearch, centerTypeFilter])

  // Available Specialties for Selected Center
  const availableSpecialties = useMemo(() => {
    if (!selectedCenter) return []
    return MOCK_SPECIALTIES.filter((specialty) => {
      const isAvailableInCenter = selectedCenter.availableSpecialtyIds?.includes(specialty.id)
      const matchesSearch =
        specialty.name.toLowerCase().includes(specialtySearch.toLowerCase()) ||
        specialty.description.toLowerCase().includes(specialtySearch.toLowerCase())
      return isAvailableInCenter && matchesSearch
    })
  }, [selectedCenter, specialtySearch])

  // Available Doctors for Selected Center & Specialty
  const availableDoctors = useMemo(() => {
    if (!selectedCenter || !selectedSpecialty) return []
    return MOCK_DOCTORS.filter((doctor) => {
      const matchesCenter = doctor.centerIds?.includes(selectedCenter.id)
      const matchesSpecialty = doctor.specialtyId === selectedSpecialty.id
      return matchesCenter && matchesSpecialty
    })
  }, [selectedCenter, selectedSpecialty])

  const morningSlots = availability.slots.filter((slot) => slot.period === 'MORNING')
  const afternoonSlots = availability.slots.filter((slot) => slot.period === 'AFTERNOON')

  const handleSelectDate = useCallback((date: string) => {
    if (!canSelectDate(date)) return
    setSelectedDate(date)
    setSelectedSlot(null)
  }, [])

  // Navigation handlers
  const handleSelectCenter = useCallback((center: HealthCenter, autoAdvance: boolean = true) => {
    if (!canSelectCenter(center, MOCK_CENTERS)) return
    setSelectedCenter((prev) => {
      if (prev?.id !== center.id) {
        setSelectedSpecialty(null)
        setSelectedDoctor(null)
        setSelectedSlot(null)
      }
      return center
    })
    if (autoAdvance) {
      setCurrentStep(2)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [])

  const handleProceedToSpecialty = useCallback(() => {
    if (!selectedCenter) return
    setCurrentStep(2)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [selectedCenter])

  const handleSelectSpecialty = useCallback((specialty: MedicalSpecialty, autoAdvance: boolean = true) => {
    if (!canSelectSpecialty(selectedCenter, specialty, availableSpecialties)) return
    setSelectedSpecialty((prev) => {
      if (prev?.id !== specialty.id) {
        setSelectedDoctor(null)
        setSelectedSlot(null)
      }
      return specialty
    })
    if (autoAdvance) {
      setCurrentStep(3)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [selectedCenter, availableSpecialties])

  const handleProceedToDoctor = useCallback(() => {
    if (!selectedSpecialty) return
    setCurrentStep(3)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [selectedSpecialty])

  const handleSelectDoctor = useCallback((doctor: MedicalDoctor, autoAdvance: boolean = true) => {
    if (!canSelectDoctor(selectedCenter, selectedSpecialty, doctor, availableDoctors)) return
    setSelectedDoctor((prev) => {
      if (prev?.id !== doctor.id) {
        setSelectedSlot(null)
      }
      return doctor
    })
    if (autoAdvance) {
      setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [selectedCenter, selectedSpecialty, availableDoctors])

  const handleProceedToDateTime = useCallback(() => {
    if (!selectedDoctor) return
    setCurrentStep(4)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [selectedDoctor])

  const handleSelectSlot = useCallback((slot: AppointmentSlot) => {
    const currentSlot = availability.slots.find((availableSlot) => availableSlot.id === slot.id)
    if (!currentSlot || !canSelectDate(selectedDate) || !isBookableSlot(currentSlot, selectedDate)) return
    setSelectedSlot(currentSlot)
  }, [availability.slots, selectedDate])

  const handleProceedToConfirmation = useCallback(() => {
    if (canProceedToPatient(selectedCenter, selectedSpecialty, selectedDoctor, selectedDate, selectedSlot, availability.slots)) {
      setCurrentStep(5)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [selectedCenter, selectedSpecialty, selectedDoctor, availability.slots, selectedDate, selectedSlot])

  const handlePatientFormChange = useCallback((field: keyof PatientBookingForm, value: string) => {
    setPatientForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleGoToStep = useCallback((step: BookingStep) => {
    if (step < currentStep) {
      setCurrentStep(step)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [currentStep])

  const handleResetBooking = useCallback(() => {
    setSelectedCenter(null)
    setSelectedSpecialty(null)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setPatientForm(INITIAL_PATIENT_FORM)
    setBookingError(null)
    setCurrentStep(1)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [])

  return {
    currentStep,
    selectedCenter,
    centerSearch,
    setCenterSearch,
    centerTypeFilter,
    setCenterTypeFilter,
    filteredCenters,
    selectedSpecialty,
    specialtySearch,
    setSpecialtySearch,
    availableSpecialties,
    selectedDoctor,
    availableDoctors,
    selectedDate,
    setSelectedDate: handleSelectDate,
    selectedSlot: availability.slots.find((slot) => slot.id === selectedSlot?.id && isBookableSlot(slot, selectedDate)) ?? null,
    morningSlots,
    afternoonSlots,
    availabilityLoading: availability.isLoading,
    availabilityError: availability.error,
    availabilityCanRetry: availability.canRetry,
    retryAvailability: availability.retry,
    patientForm,
    bookingError,
    handleSelectCenter,
    handleProceedToSpecialty,
    handleSelectSpecialty,
    handleProceedToDoctor,
    handleSelectDoctor,
    handleProceedToDateTime,
    handleSelectSlot,
    handleProceedToConfirmation,
    handlePatientFormChange,
    handleGoToStep,
    handleResetBooking,
  }
}
