import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTurnero } from './hooks/useTurnero'
import { useDemoTurnero } from './hooks/useDemoTurnero'
import { useAuth } from '@/context/AuthContext'
import { AppHeader, SUPPORTED_CITIES, type CityOption } from '@/components/layout/AppHeader'
import { TurneroHeader } from './components/TurneroHeader'
import { Step1CenterSelection } from './components/Step1CenterSelection'
import { Step2SpecialtySelection } from './components/Step2SpecialtySelection'
import { Step3DoctorSelection } from './components/Step3DoctorSelection'
import { Step4DateTimeSelection } from './components/Step4DateTimeSelection'
import { Step5PatientConfirmation } from './components/Step5PatientConfirmation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogIn, AlertTriangle } from 'lucide-react'
import { turnosService } from '@/api/turnosService'
import { pacientesService } from '@/api/pacientesService'
import type { Turno } from '@/types'
import type { PatientBookingForm } from './types'

interface TurneroContainerProps {
  isDemoMode?: boolean
}

export function TurneroContainer({ isDemoMode: initialDemoMode = false }: TurneroContainerProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isDemo = initialDemoMode || searchParams.get('demo') === 'true'

  const [selectedCity, setSelectedCity] = useState<CityOption>(SUPPORTED_CITIES[0])
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [bookingErrorMsg, setBookingErrorMsg] = useState<string | null>(null)
  const [persistedAppointment, setPersistedAppointment] = useState<Turno | null>(null)

  // Seleccionar hook según el modo: demo explícito o turnero productivo oficial
  const realHook = useTurnero()
  const demoHook = useDemoTurnero()
  const activeHook = isDemo ? demoHook : realHook
  const { catalogLoading, catalogError, retryCatalog } = realHook

  const {
    currentStep,
    selectedCenter,
    tipoAtencion,
    setTipoAtencion,
    selectedStudy,
    availableStudies,
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
    setSelectedDate,
    selectedSlot,
    morningSlots,
    afternoonSlots,
    availabilityLoading,
    availabilityError,
    availabilityCanRetry,
    retryAvailability,
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
    handleResetBooking: resetBaseBooking,
  } = activeHook

  // Pre-poblar datos de paciente autenticado si existen
  useEffect(() => {
    if (user) {
      const isGooglePlaceholderDni = user.dni?.startsWith('G-')
      if (user.dni && !isGooglePlaceholderDni && !patientForm.dni) {
        handlePatientFormChange('dni', user.dni)
      }
      if (user.nombre && !patientForm.firstName) handlePatientFormChange('firstName', user.nombre)
      if (user.apellido && !patientForm.lastName) handlePatientFormChange('lastName', user.apellido)
      if (user.email && !patientForm.email) handlePatientFormChange('email', user.email)
    }
  }, [user, patientForm.dni, handlePatientFormChange])

  const handleResetBooking = () => {
    setPersistedAppointment(null)
    setBookingErrorMsg(null)
    resetBaseBooking()
  }

  const handleConfirmRealBooking = async (form: PatientBookingForm) => {
    if (!selectedCenter || !selectedSlot) return
    if (tipoAtencion !== 'ESTUDIO' && !selectedDoctor) return
    if (tipoAtencion === 'ESTUDIO' && !selectedStudy) return
    setIsSubmittingBooking(true)
    setBookingErrorMsg(null)

    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `turnero-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      const nuevoTurno = await turnosService.reservarTurnoPublico({
        centroSaludId: selectedCenter.id,
        profesionalId: selectedDoctor?.id || null,
        tipoAtencion,
        servicio: tipoAtencion === 'ESTUDIO' ? selectedStudy?.name : undefined,
        especialidadId: selectedSpecialty?.id || null,
        fecha: selectedDate,
        hora: selectedSlot.time,
        dni: form.dni,
        nombre: form.firstName,
        apellido: form.lastName,
        telefono: form.phone,
        email: form.email || undefined,
        obraSocial: form.healthInsurance,
        numeroAfiliado: form.affiliateNumber || undefined,
        motivoConsulta: form.notes || (tipoAtencion === 'ESTUDIO' ? `Estudio diagnóstico: ${selectedStudy?.name}` : undefined),
        idempotencyKey,
      })

      setPersistedAppointment(nuevoTurno)

      // Guardar automáticamente datos del paciente en la base de datos de la institución médica
      if (user?.pacienteId || user?.id) {
        try {
          await pacientesService.updateContacto(user.pacienteId || user.id, {
            dni: form.dni,
            telefono: form.phone,
            obraSocial: form.healthInsurance,
            nroAfiliado: form.affiliateNumber || undefined,
          })
        } catch (e) {
          console.warn('Sincronización de perfil médico:', e)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo confirmar el turno en el sistema.'
      setBookingErrorMsg(msg)
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  const isPatientExistingError = Boolean(bookingErrorMsg && bookingErrorMsg.includes('pertenece a un paciente registrado'))

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e3eff6] via-[#ebf5f7] to-[#d9edf4] text-slate-900 selection:bg-[#005a87] selection:text-white relative overflow-x-hidden">
      {/* Banner de modo demo: ÚNICAMENTE visible cuando se solicita explícitamente modo de prueba */}
      {isDemo && (
        <div className="w-full bg-amber-100 border-b border-amber-300 py-1.5 px-4 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2">
          <AlertTriangle className="size-3.5 text-amber-700 shrink-0" />
          <span>Turnero de demostración: las reservas no se registran en el sistema real.</span>
        </div>
      )}

      {catalogError && !isDemo && (
        <div role="alert" className="w-full bg-red-50 border-b border-red-300 py-2 px-4 text-center text-xs font-semibold text-red-800 flex items-center justify-center gap-3">
          <span>{catalogError}</span>
          <Button type="button" size="sm" variant="outline" onClick={retryCatalog}>
            Reintentar
          </Button>
        </div>
      )}

      {catalogLoading && !isDemo && (
        <div role="status" className="w-full bg-sky-50 border-b border-sky-200 py-2 px-4 text-center text-xs font-semibold text-sky-900">
          Cargando centros, especialidades y profesionales...
        </div>
      )}

      {/* Luces y auras de fondo sutiles referidas a los colores azul marino y turquesa del logo */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 -top-24 size-[650px] rounded-full bg-gradient-to-br from-[#005a87]/12 to-[#00a896]/12 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-0 translate-x-1/4 size-[700px] rounded-full bg-gradient-to-bl from-[#00a896]/12 via-[#0284c7]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 left-1/3 size-[500px] rounded-full bg-[#005a87]/8 blur-3xl pointer-events-none" />

      {/* Global Application Header with Brand, City Selector and Navigation */}
      <AppHeader
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onNewBooking={handleResetBooking}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      {/* Header banner shown only on Step 1 (Centros) */}
      {currentStep === 1 && (
        <TurneroHeader
          selectedCenter={selectedCenter}
          selectedSpecialty={selectedSpecialty}
          selectedDoctor={selectedDoctor}
          selectedDate={selectedDate}
          selectedSlotTime={selectedSlot?.time ?? null}
          onReset={handleResetBooking}
        />
      )}

      {/* Main Content Area: Dedicated full-screen per step */}
      <main className="w-full px-3 sm:px-8 lg:px-12 xl:px-14 py-3 sm:py-5">
        <div key={currentStep}>
          {currentStep === 1 && (
            <Step1CenterSelection
              centers={filteredCenters}
              selectedCenter={selectedCenter}
              tipoAtencion={tipoAtencion}
              searchTerm={centerSearch}
              onSearchChange={setCenterSearch}
              typeFilter={centerTypeFilter}
              onTypeFilterChange={setCenterTypeFilter}
              onSelectCenter={(center, auto, pref) => handleSelectCenter(center, auto, pref)}
              onProceed={handleProceedToSpecialty}
            />
          )}

          {currentStep === 2 && selectedCenter && (
            <Step2SpecialtySelection
              selectedCenter={selectedCenter}
              tipoAtencion={tipoAtencion}
              specialties={availableSpecialties}
              selectedSpecialty={selectedSpecialty}
              studies={availableStudies}
              selectedStudy={selectedStudy}
              searchTerm={specialtySearch}
              onSearchChange={setSpecialtySearch}
              onSelectSpecialty={handleSelectSpecialty}
              onSelectStudy={handleSelectStudy}
              onChangeCategory={setTipoAtencion}
              onBackToCenter={() => handleGoToStep(1)}
              onProceed={handleProceedToDoctor}
            />
          )}

          {currentStep === 3 && selectedCenter && (selectedSpecialty || tipoAtencion === 'ESTUDIO') && (
            <Step3DoctorSelection
              selectedCenter={selectedCenter}
              selectedSpecialty={selectedSpecialty}
              selectedStudy={selectedStudy}
              tipoAtencion={tipoAtencion}
              doctors={availableDoctors}
              selectedDoctor={selectedDoctor}
              onSelectDoctor={handleSelectDoctor}
              onBackToSpecialty={() => handleGoToStep(2)}
              onProceed={handleProceedToDateTime}
            />
          )}

          {currentStep === 4 && ((tipoAtencion === 'ESTUDIO' && selectedStudy) || (selectedDoctor && selectedSpecialty)) && (
            <Step4DateTimeSelection
              selectedDoctor={selectedDoctor}
              selectedSpecialty={selectedSpecialty}
              selectedStudy={selectedStudy}
              tipoAtencion={tipoAtencion}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              morningSlots={morningSlots}
              afternoonSlots={afternoonSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              availabilityLoading={availabilityLoading}
              availabilityError={availabilityError}
              availabilityCanRetry={availabilityCanRetry}
              bookingError={bookingError}
              onRetryAvailability={retryAvailability}
              onProceed={handleProceedToConfirmation}
              onBackToDoctor={() => handleGoToStep(tipoAtencion === 'ESTUDIO' ? 2 : 3)}
            />
          )}

          {currentStep === 5 && selectedCenter && selectedSlot && ((tipoAtencion === 'ESTUDIO' && selectedStudy) || (selectedSpecialty && selectedDoctor)) && (
            <div className="space-y-4">
              {isPatientExistingError && (
                <div className="rounded-2xl border border-sky-300 bg-sky-50 p-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sky-900 text-sm">
                    <LogIn className="size-4 text-sky-700" />
                    <span>Identificación requerida para confirmar turno</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    El DNI ingresado ya pertenece a un paciente registrado en el sistema. Para proteger sus antecedentes clínicos, inicie sesión o identifíquese con su cuenta de Google.
                  </p>
                  <Button
                    type="button"
                    onClick={() => navigate(`/login?redirect=/turnero`)}
                    className="cursor-pointer bg-sky-700 text-xs font-bold text-white hover:bg-sky-800"
                  >
                    Iniciar Sesión con mi Cuenta
                  </Button>
                </div>
              )}

              <Step5PatientConfirmation
                selectedCenter={selectedCenter}
                selectedSpecialty={selectedSpecialty}
                selectedDoctor={selectedDoctor}
                selectedStudy={selectedStudy}
                tipoAtencion={tipoAtencion}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                patientForm={patientForm}
                bookingError={bookingErrorMsg || bookingError}
                isSubmitting={isSubmittingBooking}
                createdAppointment={persistedAppointment}
                onConfirm={handleConfirmRealBooking}
                onFormChange={handlePatientFormChange}
                onBackToSlots={() => handleGoToStep(4)}
              />
            </div>
          )}
        </div>
      </main>


      {/* Login Navigation Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Portal del Paciente y Profesionales
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Acceda con sus credenciales oficiales para gestionar sus citas y recetas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-slate-600">
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3">
              Inicie sesión con su cuenta para acceder al historial médico, gestión de recetas y turnos.
            </p>
            <Button
              type="button"
              onClick={() => {
                setIsLoginModalOpen(false)
                navigate('/login')
              }}
              className="w-full bg-sky-700 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
