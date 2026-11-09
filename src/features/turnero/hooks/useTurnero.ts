import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAvailability } from './useAvailability'
import { formatLocalDate, isBookableSlot } from '../availability'
import { centrosService } from '@/api/centrosService'
import { profesionalesService } from '@/api/profesionalesService'
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
  TipoAtencionTurno,
  DiagnosticStudy,
} from '../types'
import type {
  CentroSalud,
  Especialidad as EspecialidadApi,
  Profesional as ProfesionalApi,
} from '@/types'

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

function mapCenterType(tipo: CentroSalud['tipo']): CenterType {
  if (tipo === 'DISPENSARIO') return 'CAPS'
  if (tipo === 'CONSULTORIO_PRIVADO') return 'CONSULTORIO'
  return tipo
}

function mapCenter(centro: CentroSalud, profesionales: ProfesionalApi[]): HealthCenter {
  const centerDoctors = profesionales.filter((profesional) =>
    profesional.centrosSaludIds.includes(String(centro.id))
  )
  const specialtyIds = [...new Set(centerDoctors.map((profesional) => profesional.especialidadId))]

  return {
    id: String(centro.id),
    name: centro.nombre,
    type: mapCenterType(centro.tipo),
    address: centro.direccion || '',
    neighborhood: centro.ciudad || '',
    city: centro.ciudad || 'Cruz del Eje',
    phone: centro.telefono || '',
    specialtiesCount: specialtyIds.length,
    availableSpecialtyIds: specialtyIds,
    permiteConsultas: centro.permiteConsultas !== false,
    permiteEstudios: false,
    estudiosDisponibles: [],
  }
}

function mapSpecialty(especialidad: EspecialidadApi, profesionales: ProfesionalApi[]): MedicalSpecialty {
  return {
    id: String(especialidad.id),
    name: especialidad.nombre,
    description: especialidad.descripcion || 'Atención médica especializada.',
    iconName: 'Stethoscope',
    totalDoctors: profesionales.filter(
      (profesional) => profesional.especialidadId === String(especialidad.id)
    ).length,
  }
}

function mapDoctor(profesional: ProfesionalApi): MedicalDoctor {
  const nombre = profesional.nombre?.trim() || ''
  const apellido = profesional.apellido?.trim() || ''
  const tratamiento = /a$/i.test(nombre) ? 'Dra.' : 'Dr.'

  return {
    id: String(profesional.id),
    name: `${tratamiento} ${nombre} ${apellido}`.replace(/\s+/g, ' ').trim(),
    specialtyId: String(profesional.especialidadId),
    centerIds: profesional.centrosSaludIds.map(String),
    licenseNumber: profesional.matricula,
    consultationType: 'PRESENCIAL',
    availableDays: profesional.diasAtencion || [],
    nextAvailableDate: '',
  }
}

export function useTurnero() {
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState<BookingStep>(1)

  // Step 1: Health Center state & Tipo de Atención
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null)
  const [tipoAtencion, setTipoAtencion] = useState<TipoAtencionTurno>('CONSULTA')
  const [centerSearch, setCenterSearch] = useState('')
  const [centerTypeFilter, setCenterTypeFilter] = useState<CenterType | 'ALL'>('ALL')

  // Step 2: Specialty / Study state
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | null>(null)
  const [selectedStudy, setSelectedStudy] = useState<DiagnosticStudy | null>(null)
  const [specialtySearch, setSpecialtySearch] = useState('')

  // Step 3: Doctor state
  const [selectedDoctor, setSelectedDoctor] = useState<MedicalDoctor | null>(null)

  // Step 4: Date & Slot state
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate(new Date()))
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const availability = useAvailability(tipoAtencion === 'ESTUDIO' ? '' : (selectedDoctor?.id ?? ''), selectedDate)

  // Step 5: Patient Form state
  const [patientForm, setPatientForm] = useState<PatientBookingForm>(INITIAL_PATIENT_FORM)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Catálogo real: centros, especialidades y profesionales
  const [centros, setCentros] = useState<HealthCenter[]>([])
  const [especialidades, setEspecialidades] = useState<MedicalSpecialty[]>([])
  const [profesionales, setProfesionales] = useState<MedicalDoctor[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogVersion, setCatalogVersion] = useState(0)

  useEffect(() => {
    let active = true
    setCatalogLoading(true)
    setCatalogError(null)

    Promise.all([
      centrosService.getAll(),
      profesionalesService.getEspecialidades(),
      profesionalesService.getAll(),
    ])
      .then(([centrosApi, especialidadesApi, profesionalesApi]) => {
        if (!active) return
        setCentros(centrosApi.map((centro) => mapCenter(centro, profesionalesApi)))
        setEspecialidades(especialidadesApi.map((especialidad) => mapSpecialty(especialidad, profesionalesApi)))
        setProfesionales(profesionalesApi.map(mapDoctor))
      })
      .catch((error: unknown) => {
        if (!active) return
        setCentros([])
        setEspecialidades([])
        setProfesionales([])
        setCatalogError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el catálogo de centros, especialidades y profesionales.'
        )
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })

    return () => {
      active = false
    }
  }, [catalogVersion])

  const retryCatalog = useCallback(() => setCatalogVersion((version) => version + 1), [])

  // Preselección automática si el paciente ingresa desde URL
  useEffect(() => {
    if (catalogLoading || centros.length === 0 || profesionales.length === 0 || especialidades.length === 0) {
      return
    }

    const profId = searchParams.get('profesionalId') || searchParams.get('doctorId')
    const espId = searchParams.get('especialidadId')
    const centerId = searchParams.get('centroSaludId')

    if (profId) {
      const matchedDoctor = profesionales.find(
        (doctor) => doctor.id === profId || doctor.id.includes(profId) || profId.includes(doctor.id)
      )

      if (!matchedDoctor) return

      const targetCenterId = centerId || matchedDoctor.centerIds[0]
      const matchedCenter = centros.find((center) => center.id === targetCenterId)
      if (!matchedCenter) return

      const targetSpecId = espId || matchedDoctor.specialtyId
      const matchedSpec = especialidades.find((specialty) => specialty.id === targetSpecId)
      if (!matchedSpec) return

      setSelectedCenter(matchedCenter)
      setTipoAtencion('CONSULTA')
      setSelectedSpecialty(matchedSpec)
      setSelectedDoctor(matchedDoctor)
      setCurrentStep(4)
    } else if (centerId) {
      const matchedCenter = centros.find(
        (center) =>
          center.id === centerId ||
          center.name.toLowerCase().includes(centerId.toLowerCase())
      )

      if (!matchedCenter) return

      setSelectedCenter(matchedCenter)
      setTipoAtencion('CONSULTA')
      setCurrentStep(2)
    }
  }, [searchParams, catalogLoading, centros, profesionales, especialidades])

  // Filtered Centers
  const filteredCenters = useMemo(() => {
    return centros.filter((center) => {
      const matchesSearch =
        center.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
        center.neighborhood.toLowerCase().includes(centerSearch.toLowerCase()) ||
        center.address.toLowerCase().includes(centerSearch.toLowerCase())

      const matchesType = centerTypeFilter === 'ALL' || center.type === centerTypeFilter
      return matchesSearch && matchesType
    })
  }, [centros, centerSearch, centerTypeFilter])

  // Available Specialties for Selected Center
  const availableSpecialties = useMemo(() => {
    if (!selectedCenter || !selectedCenter.permiteConsultas) return []
    return especialidades.filter((specialty) => {
      const isAvailableInCenter = selectedCenter.availableSpecialtyIds.includes(specialty.id)
      const matchesSearch =
        specialty.name.toLowerCase().includes(specialtySearch.toLowerCase()) ||
        specialty.description.toLowerCase().includes(specialtySearch.toLowerCase())
      return isAvailableInCenter && matchesSearch
    })
  }, [selectedCenter, especialidades, specialtySearch])

  // Estudios públicos: el backend aún no expone disponibilidad por centro sin profesional.
  const availableStudies = useMemo<DiagnosticStudy[]>(() => [], [])

  // Available Doctors for Selected Center & Specialty
  const availableDoctors = useMemo(() => {
    if (!selectedCenter || !selectedSpecialty || tipoAtencion === 'ESTUDIO') return []
    return profesionales.filter((doctor) => {
      const matchesCenter = doctor.centerIds.includes(selectedCenter.id)
      const matchesSpecialty = doctor.specialtyId === selectedSpecialty.id
      return matchesCenter && matchesSpecialty
    })
  }, [profesionales, selectedCenter, selectedSpecialty, tipoAtencion])

  const morningSlots = useMemo(() => {
    if (tipoAtencion === 'ESTUDIO') return []
    return availability.slots.filter(
      (slot) => slot.period === 'MORNING' && isBookableSlot(slot, selectedDate)
    )
  }, [tipoAtencion, availability.slots, selectedDate])

  const afternoonSlots = useMemo(() => {
    if (tipoAtencion === 'ESTUDIO') return []
    return availability.slots.filter(
      (slot) => slot.period === 'AFTERNOON' && isBookableSlot(slot, selectedDate)
    )
  }, [tipoAtencion, availability.slots, selectedDate])

  const effectiveSlots = useMemo(() => {
    return [...morningSlots, ...afternoonSlots]
  }, [morningSlots, afternoonSlots])

  const handleSelectDate = useCallback((date: string) => {
    if (!canSelectDate(date)) return
    setSelectedDate(date)
    setSelectedSlot(null)
  }, [])

  // Navigation handlers
  const handleSelectCenter = useCallback((center: HealthCenter, autoAdvance: boolean = true, preferredCategory?: TipoAtencionTurno) => {
    if (!canSelectCenter(center, centros)) return
    setSelectedCenter((prev) => {
      if (prev?.id !== center.id) {
        setSelectedSpecialty(null)
        setSelectedStudy(null)
        setSelectedDoctor(null)
        setSelectedSlot(null)
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
      setCurrentStep(2)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [centros])

  const handleSelectCategory = useCallback((category: TipoAtencionTurno) => {
    setTipoAtencion(category)
    setSelectedSpecialty(null)
    setSelectedStudy(null)
    setSelectedDoctor(null)
    setSelectedSlot(null)
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

  const handleSelectStudy = useCallback((study: DiagnosticStudy, autoAdvance: boolean = true) => {
    setSelectedStudy(study)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    if (autoAdvance) {
      setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [])

  const handleProceedToDoctor = useCallback(() => {
    if (tipoAtencion === 'ESTUDIO') {
      if (!selectedStudy) return
      setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
      return
    }
    if (!selectedSpecialty) return
    setCurrentStep(3)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [tipoAtencion, selectedStudy, selectedSpecialty])

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
    if (tipoAtencion === 'ESTUDIO') {
      if (!selectedStudy) return
      setCurrentStep(4)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
      return
    }
    if (!selectedDoctor) return
    setCurrentStep(4)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [tipoAtencion, selectedStudy, selectedDoctor])

  const handleSelectSlot = useCallback((slot: AppointmentSlot) => {
    const currentSlot = effectiveSlots.find((availableSlot) => availableSlot.id === slot.id)
    if (!currentSlot || !canSelectDate(selectedDate) || !isBookableSlot(currentSlot, selectedDate)) return
    setSelectedSlot(currentSlot)
  }, [effectiveSlots, selectedDate])

  const handleProceedToConfirmation = useCallback((slotOverride?: AppointmentSlot) => {
    const slotToUse = slotOverride || selectedSlot
    if (slotToUse && slotToUse.id !== selectedSlot?.id) {
      setSelectedSlot(slotToUse)
    }

    if (tipoAtencion === 'ESTUDIO') {
      if (selectedCenter && selectedStudy && slotToUse && (canProceedToPatient(selectedCenter, null, null, selectedDate, slotToUse, effectiveSlots, new Date(), true) || canSelectDate(selectedDate))) {
        setCurrentStep(5)
        if (typeof window !== 'undefined') window.scrollTo(0, 0)
      }
      return
    }

    const canProceed = Boolean(slotToUse && canProceedToPatient(selectedCenter, selectedSpecialty, selectedDoctor, selectedDate, slotToUse, effectiveSlots))
    const canFallbackProceed = Boolean(slotToUse && selectedCenter && selectedSpecialty && selectedDoctor && canSelectDate(selectedDate))

    if (canProceed || canFallbackProceed) {
      setCurrentStep(5)
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
    }
  }, [tipoAtencion, selectedCenter, selectedStudy, selectedSpecialty, selectedDoctor, effectiveSlots, selectedDate, selectedSlot])

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
    setTipoAtencion('CONSULTA')
    setSelectedSpecialty(null)
    setSelectedStudy(null)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setPatientForm(INITIAL_PATIENT_FORM)
    setBookingError(null)
    setCurrentStep(1)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [])

  return {
    currentStep,
    catalogLoading,
    catalogError,
    retryCatalog,
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
    setSelectedDate: handleSelectDate,
    selectedSlot: effectiveSlots.find((slot) => slot.id === selectedSlot?.id && isBookableSlot(slot, selectedDate)) ?? null,
    morningSlots,
    afternoonSlots,
    availabilityLoading: tipoAtencion === 'ESTUDIO' ? false : availability.isLoading,
    availabilityError: (tipoAtencion === 'ESTUDIO' || morningSlots.length > 0 || afternoonSlots.length > 0) ? null : availability.error,
    availabilityCanRetry: tipoAtencion === 'ESTUDIO' ? false : availability.canRetry,
    retryAvailability: availability.retry,
    patientForm,
    bookingError,
    handleSelectCenter,
    handleProceedToSpecialty,
    handleSelectSpecialty,
    handleSelectStudy,
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
