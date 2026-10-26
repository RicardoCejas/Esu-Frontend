import { useCallback, useMemo, useState } from 'react'
import { MOCK_CENTERS, MOCK_DOCTORS, MOCK_SPECIALTIES } from '../data/mockTurneroData'
import { demoBookingStore, type DemoBooking } from '../demoBookingStore'
import { formatLocalDate } from '../availability'
import { canProceedToPatient, canSelectCenter, canSelectDate, canSelectDoctor, canSelectSpecialty } from '../bookingStepValidation'
import type { AppointmentSlot, BookingStep, CenterType, HealthCenter, MedicalDoctor, MedicalSpecialty, PatientBookingForm } from '../types'

const INITIAL_PATIENT_FORM: PatientBookingForm = {
  dni: '', firstName: '', lastName: '', phone: '', email: '',
  healthInsurance: 'Particular (Sin cobertura)', affiliateNumber: '', notes: '',
}

export function useDemoTurnero() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1)
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null)
  const [centerSearch, setCenterSearch] = useState('')
  const [centerTypeFilter, setCenterTypeFilter] = useState<CenterType | 'ALL'>('ALL')
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | null>(null)
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<MedicalDoctor | null>(null)
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()))
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [patientForm, setPatientForm] = useState<PatientBookingForm>(INITIAL_PATIENT_FORM)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [createdAppointment, setCreatedAppointment] = useState<DemoBooking | null>(null)
  const [, setBookingRevision] = useState(0)

  const filteredCenters = useMemo(() => MOCK_CENTERS.filter((center) => {
    const search = centerSearch.toLocaleLowerCase()
    return (center.name.toLocaleLowerCase().includes(search) || center.neighborhood.toLocaleLowerCase().includes(search) ||
      center.address.toLocaleLowerCase().includes(search)) && (centerTypeFilter === 'ALL' || center.type === centerTypeFilter)
  }), [centerSearch, centerTypeFilter])

  const availableSpecialties = useMemo(() => {
    if (!selectedCenter) return []
    const ids = new Set(MOCK_DOCTORS.filter((doctor) => doctor.centerIds.includes(selectedCenter.id)).map((doctor) => doctor.specialtyId))
    const search = specialtySearch.toLocaleLowerCase()
    return MOCK_SPECIALTIES.filter((specialty) => ids.has(specialty.id) &&
      (specialty.name.toLocaleLowerCase().includes(search) || specialty.description.toLocaleLowerCase().includes(search)))
  }, [selectedCenter, specialtySearch])

  const availableDoctors = useMemo(() => MOCK_DOCTORS.filter((doctor) => selectedCenter && selectedSpecialty &&
    doctor.centerIds.includes(selectedCenter.id) && doctor.specialtyId === selectedSpecialty.id), [selectedCenter, selectedSpecialty])

  const slots = selectedDoctor ? demoBookingStore.getSlots(selectedDoctor, selectedDate) : []
  const morningSlots = slots.filter((slot) => slot.period === 'MORNING')
  const afternoonSlots = slots.filter((slot) => slot.period === 'AFTERNOON')
  const liveSelectedSlot = slots.find((slot) => slot.id === selectedSlot?.id && slot.isAvailable) ?? null

  const handleSelectCenter = useCallback((center: HealthCenter) => {
    if (!canSelectCenter(center, MOCK_CENTERS)) return
    setSelectedCenter(center); setSelectedSpecialty(null); setSelectedDoctor(null); setSelectedSlot(null)
    setCreatedAppointment(null); setBookingError(null); setCurrentStep(2)
  }, [])
  const handleSelectSpecialty = useCallback((specialty: MedicalSpecialty) => {
    if (!canSelectSpecialty(selectedCenter, specialty, availableSpecialties)) return
    setSelectedSpecialty(specialty); setSelectedDoctor(null); setSelectedSlot(null)
    setCreatedAppointment(null); setBookingError(null); setCurrentStep(3)
  }, [selectedCenter, availableSpecialties])
  const handleSelectDoctor = useCallback((doctor: MedicalDoctor) => {
    if (!canSelectDoctor(selectedCenter, selectedSpecialty, doctor, availableDoctors)) return
    setSelectedDoctor(doctor); setSelectedSlot(null); setCreatedAppointment(null); setBookingError(null); setCurrentStep(4)
  }, [selectedCenter, selectedSpecialty, availableDoctors])
  const handleSelectDate = useCallback((date: string) => {
    if (!canSelectDate(date)) return
    setSelectedDate(date); setSelectedSlot(null); setCreatedAppointment(null); setBookingError(null)
  }, [])
  const handleSelectSlot = (slot: AppointmentSlot) => {
    const currentSlot = slots.find((candidate) => candidate.id === slot.id)
    if (!currentSlot?.isAvailable) return
    setSelectedSlot(currentSlot); setCreatedAppointment(null); setBookingError(null)
  }
  const handleProceedToConfirmation = () => {
    if (!canProceedToPatient(selectedCenter, selectedSpecialty, selectedDoctor, selectedDate, liveSelectedSlot, slots)) {
      setBookingError('Seleccioná un centro, profesional, fecha y horario disponible antes de continuar.')
      return
    }
    setBookingError(null); setCurrentStep(5)
  }
  const handleConfirmBooking = (patient: PatientBookingForm) => {
    if (createdAppointment) return
    if (!selectedCenter || !selectedSpecialty || !selectedDoctor || !liveSelectedSlot ||
      !canProceedToPatient(selectedCenter, selectedSpecialty, selectedDoctor, selectedDate, liveSelectedSlot, slots)) {
      setBookingError('El horario de demostración ya no está disponible. Volvé a elegir uno.')
      return
    }
    try {
      const booking = demoBookingStore.book({ centerId: selectedCenter.id, specialtyId: selectedSpecialty.id,
        doctor: selectedDoctor, date: selectedDate, slotId: liveSelectedSlot.id, patient })
      setPatientForm(patient); setCreatedAppointment(booking); setBookingError(null); setBookingRevision((value) => value + 1)
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'No se pudo completar la demostración.')
      setBookingRevision((value) => value + 1)
    }
  }
  const handlePatientFormChange = useCallback((field: keyof PatientBookingForm, value: string) => {
    setPatientForm((current) => ({ ...current, [field]: value }))
  }, [])
  const handleGoToStep = useCallback((step: BookingStep) => {
    if (step < currentStep) setCurrentStep(step)
  }, [currentStep])
  const handleResetBooking = useCallback(() => {
    setSelectedCenter(null); setSelectedSpecialty(null); setSelectedDoctor(null); setSelectedSlot(null)
    setSelectedDate(formatLocalDate(new Date())); setPatientForm(INITIAL_PATIENT_FORM)
    setCreatedAppointment(null); setBookingError(null); setCurrentStep(1)
  }, [])

  return { currentStep, selectedCenter, centerSearch, setCenterSearch, centerTypeFilter, setCenterTypeFilter,
    filteredCenters, selectedSpecialty, specialtySearch, setSpecialtySearch,
    availableSpecialties, selectedDoctor, availableDoctors, selectedDate, setSelectedDate: handleSelectDate,
    selectedSlot: createdAppointment ? selectedSlot : liveSelectedSlot, morningSlots, afternoonSlots,
    availabilityLoading: false, availabilityError: null, availabilityCanRetry: false, retryAvailability: () => {},
    patientForm, bookingError, isBooking: false, createdAppointment,
    handleSelectCenter, handleSelectSpecialty, handleSelectDoctor, handleSelectSlot,
    handleProceedToConfirmation, handleConfirmBooking, handlePatientFormChange, handleGoToStep, handleResetBooking }
}
