import { useState, useMemo, useCallback } from 'react'
import { useAvailability } from './useAvailability'
import { formatLocalDate, isBookableSlot } from '../availability'
import type {
  HealthCenter,
  MedicalSpecialty,
  MedicalDoctor,
  AppointmentSlot,
  PatientBookingForm,
  ConfirmedAppointment,
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
  const [confirmedAppointment, setConfirmedAppointment] = useState<ConfirmedAppointment | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

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
    if (date < formatLocalDate(new Date())) return
    setSelectedDate(date)
    setSelectedSlot(null)
  }, [])

  // Navigation handlers
  const handleSelectCenter = useCallback((center: HealthCenter) => {
    setSelectedCenter(center)
    setSelectedSpecialty(null)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setCurrentStep(2)
  }, [])

  const handleSelectSpecialty = useCallback((specialty: MedicalSpecialty) => {
    setSelectedSpecialty(specialty)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setCurrentStep(3)
  }, [])

  const handleSelectDoctor = useCallback((doctor: MedicalDoctor) => {
    setSelectedDoctor(doctor)
    setSelectedSlot(null)
    setCurrentStep(4)
  }, [])

  const handleSelectSlot = useCallback((slot: AppointmentSlot) => {
    const currentSlot = availability.slots.find((availableSlot) => availableSlot.id === slot.id)
    if (!currentSlot || !isBookableSlot(currentSlot, selectedDate)) return
    setSelectedSlot(currentSlot)
  }, [availability.slots, selectedDate])

  const handleProceedToConfirmation = useCallback(() => {
    const currentSlot = availability.slots.find((slot) => slot.id === selectedSlot?.id)
    if (currentSlot && isBookableSlot(currentSlot, selectedDate)) {
      setCurrentStep(5)
    }
  }, [availability.slots, selectedDate, selectedSlot])

  const handlePatientFormChange = useCallback((field: keyof PatientBookingForm, value: string) => {
    setPatientForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleConfirmAppointment = useCallback(() => {
    if (!selectedCenter || !selectedSpecialty || !selectedDoctor || !selectedSlot) return

    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const code = `LUVIA-CDE-${randomSuffix}`

    const newAppointment: ConfirmedAppointment = {
      bookingCode: code,
      center: selectedCenter,
      specialty: selectedSpecialty,
      doctor: selectedDoctor,
      date: selectedDate,
      slot: selectedSlot,
      patient: patientForm,
      createdAt: new Date().toISOString(),
    }

    setConfirmedAppointment(newAppointment)
    setIsReceiptOpen(true)
  }, [selectedCenter, selectedSpecialty, selectedDoctor, selectedSlot, selectedDate, patientForm])

  const handleGoToStep = useCallback((step: BookingStep) => {
    // Only allow going back or jumping to completed steps
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }, [currentStep])

  const handleResetBooking = useCallback(() => {
    setSelectedCenter(null)
    setSelectedSpecialty(null)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setSelectedDate(formatLocalDate(new Date()))
    setPatientForm(INITIAL_PATIENT_FORM)
    setConfirmedAppointment(null)
    setIsReceiptOpen(false)
    setCurrentStep(1)
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
    confirmedAppointment,
    isReceiptOpen,
    setIsReceiptOpen,
    handleSelectCenter,
    handleSelectSpecialty,
    handleSelectDoctor,
    handleSelectSlot,
    handleProceedToConfirmation,
    handlePatientFormChange,
    handleConfirmAppointment,
    handleGoToStep,
    handleResetBooking,
  }
}
