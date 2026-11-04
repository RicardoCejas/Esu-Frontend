import { useCallback, useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  MOCK_CENTERS,
  MOCK_DOCTORS,
  MOCK_SPECIALTIES,
  MOCK_DIAGNOSTIC_STUDIES,
  MOCK_MORNING_SLOTS,
  MOCK_AFTERNOON_SLOTS,
} from '../data/mockTurneroData'
import { demoBookingStore, type DemoBooking } from '../demoBookingStore'
import { formatLocalDate } from '../availability'
import {
  canProceedToPatient,
  canSelectCenter,
  canSelectDate,
  canSelectDoctor,
  canSelectSpecialty,
} from '../bookingStepValidation'
import type {
  AppointmentSlot,
  BookingStep,
  CenterType,
  HealthCenter,
  MedicalDoctor,
  MedicalSpecialty,
  PatientBookingForm,
  TipoAtencionTurno,
  DiagnosticStudy,
} from '../types'

const INITIAL_PATIENT_FORM: PatientBookingForm = {
  dni: '', firstName: '', lastName: '', phone: '', email: '',
  healthInsurance: 'Particular (Sin cobertura)', affiliateNumber: '', notes: '',
}

export function useDemoTurnero() {
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState<BookingStep>(1)
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null)
  const [tipoAtencion, setTipoAtencion] = useState<TipoAtencionTurno>('CONSULTA')
  const [centerSearch, setCenterSearch] = useState('')
  const [centerTypeFilter, setCenterTypeFilter] = useState<CenterType | 'ALL'>('ALL')
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | null>(null)
  const [selectedStudy, setSelectedStudy] = useState<DiagnosticStudy | null>(null)
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<MedicalDoctor | null>(null)
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()))
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [patientForm, setPatientForm] = useState<PatientBookingForm>(INITIAL_PATIENT_FORM)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [createdAppointment, setCreatedAppointment] = useState<DemoBooking | null>(null)
  const [, setBookingRevision] = useState(0)

  useEffect(() => {
    const centerId = searchParams.get('centroSaludId') || searchParams.get('centroId')
    const profId = searchParams.get('profesionalId') || searchParams.get('doctorId')
    if (!profId && centerId) {
      const matchedCenter =
        MOCK_CENTERS.find((c) => c.id === centerId || c.name.toLowerCase().includes(centerId.toLowerCase())) ||
        (centerId.includes('crespo') ? MOCK_CENTERS.find(c => c.id.includes('crespo')) : null) ||
        (centerId.includes('cabrera') ? MOCK_CENTERS.find(c => c.id.includes('cabrera')) : null) ||
        (centerId.includes('diag') ? MOCK_CENTERS.find(c => c.id.includes('diag')) : null) ||
        (centerId.includes('isabel') ? MOCK_CENTERS.find(c => c.id.includes('isabel')) : null)
      if (matchedCenter) {
        setSelectedCenter(matchedCenter)
        if (!matchedCenter.permiteConsultas && matchedCenter.permiteEstudios) {
          setTipoAtencion('ESTUDIO')
        } else {
          setTipoAtencion('CONSULTA')
        }
        setCurrentStep(2)
      }
    }
  }, [searchParams])

  const filteredCenters = useMemo(() => MOCK_CENTERS.filter((center) => {
    const search = centerSearch.toLocaleLowerCase()
    return (center.name.toLocaleLowerCase().includes(search) || center.neighborhood.toLocaleLowerCase().includes(search) ||
      center.address.toLocaleLowerCase().includes(search)) && (centerTypeFilter === 'ALL' || center.type === centerTypeFilter)
  }), [centerSearch, centerTypeFilter])

  const availableSpecialties = useMemo(() => {
    if (!selectedCenter || !selectedCenter.permiteConsultas) return []
    const ids = new Set(MOCK_DOCTORS.filter((doctor) => doctor.centerIds.includes(selectedCenter.id)).map((doctor) => doctor.specialtyId))
    const search = specialtySearch.toLocaleLowerCase()
    return MOCK_SPECIALTIES.filter((specialty) => ids.has(specialty.id) &&
      (specialty.name.toLocaleLowerCase().includes(search) || specialty.description.toLocaleLowerCase().includes(search)))
  }, [selectedCenter, specialtySearch])

  const availableStudies = useMemo(() => {
    if (!selectedCenter || !selectedCenter.permiteEstudios) return []
    const search = specialtySearch.toLocaleLowerCase()
    return MOCK_DIAGNOSTIC_STUDIES.filter((study) =>
      selectedCenter.estudiosDisponibles?.includes(study.name) &&
      (study.name.toLocaleLowerCase().includes(search) || study.description.toLocaleLowerCase().includes(search))
    )
  }, [selectedCenter, specialtySearch])

  const availableDoctors = useMemo(() => MOCK_DOCTORS.filter((doctor) => selectedCenter && selectedSpecialty && tipoAtencion !== 'ESTUDIO' &&
    doctor.centerIds.includes(selectedCenter.id) && doctor.specialtyId === selectedSpecialty.id), [selectedCenter, selectedSpecialty, tipoAtencion])

  const slots = useMemo(() => {
    if (tipoAtencion === 'ESTUDIO') {
      return [...MOCK_MORNING_SLOTS, ...MOCK_AFTERNOON_SLOTS]
    }
    return selectedDoctor ? demoBookingStore.getSlots(selectedDoctor, selectedDate) : []
  }, [tipoAtencion, selectedDoctor, selectedDate])

  const morningSlots = slots.filter((slot) => slot.period === 'MORNING')
  const afternoonSlots = slots.filter((slot) => slot.period === 'AFTERNOON')
  const liveSelectedSlot = slots.find((slot) => slot.id === selectedSlot?.id && slot.isAvailable) ?? null

  const handleSelectCenter = useCallback((center: HealthCenter, autoAdvance: boolean = false, preferredCategory?: TipoAtencionTurno) => {
    if (!canSelectCenter(center, MOCK_CENTERS)) return
    setSelectedCenter((prev) => {
      if (prev?.id !== center.id) {
        setSelectedSpecialty(null); setSelectedStudy(null); setSelectedDoctor(null); setSelectedSlot(null)
      }
      return center
    })
    if (!center.permiteConsultas && center.permiteEstudios) {
      setTipoAtencion('ESTUDIO')
    } else if (center.permiteConsultas && !center.permiteEstudios) {
      setTipoAtencion('CONSULTA')
    } else if (preferredCategory) {
      setTipoAtencion(preferredCategory)
    }

    if (autoAdvance) {
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(2)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [])

  const handleSelectCategory = useCallback((category: TipoAtencionTurno) => {
    setTipoAtencion(category)
    setSelectedSpecialty(null)
    setSelectedStudy(null)
    setSelectedDoctor(null)
    setSelectedSlot(null)
  }, [])

  const handleUnselectCenter = useCallback(() => {
    setSelectedCenter(null); setSelectedSpecialty(null); setSelectedStudy(null); setSelectedDoctor(null); setSelectedSlot(null)
  }, [])

  const handleProceedToSpecialty = useCallback(() => {
    if (!selectedCenter) return
    setCreatedAppointment(null); setBookingError(null); setCurrentStep(2)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [selectedCenter])

  const handleSelectSpecialty = useCallback((specialty: MedicalSpecialty, autoAdvance: boolean = false) => {
    if (!canSelectSpecialty(selectedCenter, specialty, availableSpecialties)) return
    setSelectedSpecialty((prev) => {
      if (prev?.id !== specialty.id) {
        setSelectedDoctor(null); setSelectedSlot(null)
      }
      return specialty
    })
    if (autoAdvance) {
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(3)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [selectedCenter, availableSpecialties])

  const handleSelectStudy = useCallback((study: DiagnosticStudy, autoAdvance: boolean = true) => {
    setSelectedStudy(study)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    if (autoAdvance) {
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [])

  const handleUnselectSpecialty = useCallback(() => {
    setSelectedSpecialty(null); setSelectedStudy(null); setSelectedDoctor(null); setSelectedSlot(null)
  }, [])

  const handleProceedToDoctor = useCallback(() => {
    if (tipoAtencion === 'ESTUDIO') {
      if (!selectedStudy) return
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
      return
    }
    if (!selectedSpecialty) return
    setCreatedAppointment(null); setBookingError(null); setCurrentStep(3)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [tipoAtencion, selectedStudy, selectedSpecialty])

  const handleSelectDoctor = useCallback((doctor: MedicalDoctor, autoAdvance: boolean = false) => {
    if (!canSelectDoctor(selectedCenter, selectedSpecialty, doctor, availableDoctors)) return
    setSelectedDoctor((prev) => {
      if (prev?.id !== doctor.id) setSelectedSlot(null)
      return doctor
    })
    if (autoAdvance) {
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [selectedCenter, selectedSpecialty, availableDoctors])

  const handleUnselectDoctor = useCallback(() => {
    setSelectedDoctor(null); setSelectedSlot(null)
  }, [])

  const handleProceedToDateTime = useCallback(() => {
    if (tipoAtencion === 'ESTUDIO') {
      if (!selectedStudy) return
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
      return
    }
    if (!selectedDoctor) return
    setCreatedAppointment(null); setBookingError(null); setCurrentStep(4)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [tipoAtencion, selectedStudy, selectedDoctor])

  const handleSelectSlot = useCallback((slot: AppointmentSlot) => {
    const current = slots.find((candidate) => candidate.id === slot.id)
    if (!current?.isAvailable || !canSelectDate(selectedDate)) return
    setSelectedSlot(current)
  }, [slots, selectedDate])

  const handleProceedToConfirmation = useCallback(() => {
    if (tipoAtencion === 'ESTUDIO') {
      if (selectedCenter && selectedStudy && canProceedToPatient(selectedCenter, null, null, selectedDate, liveSelectedSlot, slots, new Date(), true)) {
        setCreatedAppointment(null); setBookingError(null); setCurrentStep(5)
        if (typeof window !== 'undefined') window.scrollTo(0, 0)
      }
      return
    }
    if (canProceedToPatient(selectedCenter, selectedSpecialty, selectedDoctor, selectedDate, liveSelectedSlot, slots)) {
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(5)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [tipoAtencion, selectedCenter, selectedStudy, selectedSpecialty, selectedDoctor, selectedDate, liveSelectedSlot, slots])

  const handlePatientFormChange = useCallback((field: keyof PatientBookingForm, value: string) => {
    setPatientForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleConfirmBooking = useCallback((form?: PatientBookingForm) => {
    const activeForm = form ?? patientForm
    if (!selectedCenter || !selectedDate || !liveSelectedSlot) return
    try {
      if (tipoAtencion === 'ESTUDIO') {
        if (!selectedStudy) return
        const fakeDoctor = {
          id: 'serv-diagnostico',
          specialtyId: selectedStudy.id,
          centerIds: [selectedCenter.id],
          availableDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        }
        const booking = demoBookingStore.book({
          centerId: selectedCenter.id,
          specialtyId: selectedStudy.id,
          doctor: fakeDoctor,
          date: selectedDate,
          slotId: liveSelectedSlot.id,
          patient: activeForm,
        })
        setCreatedAppointment(booking)
        setBookingError(null)
        setBookingRevision((r) => r + 1)
        return
      }

      if (!selectedSpecialty || !selectedDoctor) return
      const booking = demoBookingStore.book({
        centerId: selectedCenter.id,
        specialtyId: selectedSpecialty.id,
        doctor: selectedDoctor,
        date: selectedDate,
        slotId: liveSelectedSlot.id,
        patient: activeForm,
      })
      setCreatedAppointment(booking)
      setBookingError(null)
      setBookingRevision((r) => r + 1)
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'No se pudo confirmar la reserva de demostración.')
    }
  }, [selectedCenter, selectedSpecialty, selectedDoctor, selectedStudy, tipoAtencion, selectedDate, liveSelectedSlot, patientForm])

  const handleGoToStep = useCallback((step: BookingStep) => {
    if (step < currentStep) {
      setCreatedAppointment(null); setBookingError(null); setCurrentStep(step)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [currentStep])

  const handleResetBooking = useCallback(() => {
    setSelectedCenter(null); setTipoAtencion('CONSULTA'); setSelectedSpecialty(null); setSelectedStudy(null); setSelectedDoctor(null); setSelectedSlot(null)
    setPatientForm(INITIAL_PATIENT_FORM); setBookingError(null); setCreatedAppointment(null); setCurrentStep(1)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [])

  return {
    currentStep,
    selectedCenter,
    tipoAtencion,
    setTipoAtencion: handleSelectCategory,
    centerSearch,
    setCenterSearch,
    centerTypeFilter,
    setCenterTypeFilter,
    filteredCenters,
    selectedSpecialty,
    selectedStudy,
    specialtySearch,
    setSpecialtySearch,
    availableSpecialties,
    availableStudies,
    selectedDoctor,
    availableDoctors,
    selectedDate,
    setSelectedDate,
    selectedSlot: liveSelectedSlot,
    morningSlots,
    afternoonSlots,
    availabilityLoading: false,
    availabilityError: null,
    availabilityCanRetry: false,
    retryAvailability: () => {},
    patientForm,
    bookingError,
    createdAppointment,
    handleSelectCenter,
    handleUnselectCenter,
    handleProceedToSpecialty,
    handleSelectSpecialty,
    handleSelectStudy,
    handleUnselectSpecialty,
    handleProceedToDoctor,
    handleSelectDoctor,
    handleUnselectDoctor,
    handleProceedToDateTime,
    handleSelectSlot,
    handleProceedToConfirmation,
    handlePatientFormChange,
    handleConfirmBooking,
    handleGoToStep,
    handleResetBooking,
  }
}
