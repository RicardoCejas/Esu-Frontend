import { useState } from 'react'
import { useDemoTurnero } from './hooks/useDemoTurnero'
import { AppHeader, SUPPORTED_CITIES, type CityOption } from '@/components/layout/AppHeader'
import { TurneroHeader } from './components/TurneroHeader'
import { Step1CenterSelection } from './components/Step1CenterSelection'
import { Step2SpecialtySelection } from './components/Step2SpecialtySelection'
import { Step3DoctorSelection } from './components/Step3DoctorSelection'
import { Step4DateTimeSelection } from './components/Step4DateTimeSelection'
import { DemoStep5PatientConfirmation } from './components/DemoStep5PatientConfirmation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function TurneroContainer() {
  const [selectedCity, setSelectedCity] = useState<CityOption>(SUPPORTED_CITIES[0])
  const [isLookupOpen, setIsLookupOpen] = useState(false)
  const [lookupCode, setLookupCode] = useState('')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [lookupMessage, setLookupMessage] = useState<string | null>(null)

  const {
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
    createdAppointment,
    handleSelectCenter,
    handleProceedToSpecialty,
    handleSelectSpecialty,
    handleProceedToDoctor,
    handleSelectDoctor,
    handleProceedToDateTime,
    handleSelectSlot,
    handleProceedToConfirmation,
    handleConfirmBooking,
    handlePatientFormChange,
    handleGoToStep,
    handleResetBooking,
  } = useDemoTurnero()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e3eff6] via-[#ebf5f7] to-[#d9edf4] text-slate-900 selection:bg-[#005a87] selection:text-white relative overflow-x-hidden">
      {/* Luces y auras de fondo sutiles referidas a los colores azul marino y turquesa del logo */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 -top-24 size-[650px] rounded-full bg-gradient-to-br from-[#005a87]/12 to-[#00a896]/12 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-0 translate-x-1/4 size-[700px] rounded-full bg-gradient-to-bl from-[#00a896]/12 via-[#0284c7]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 left-1/3 size-[500px] rounded-full bg-[#005a87]/8 blur-3xl pointer-events-none" />

      {/* Global Application Header with Brand, City Selector and Navigation */}
      <AppHeader
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onNewBooking={handleResetBooking}
        onLookupBooking={() => {
          setLookupMessage(null)
          setIsLookupOpen(true)
        }}
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
              searchTerm={centerSearch}
              onSearchChange={setCenterSearch}
              typeFilter={centerTypeFilter}
              onTypeFilterChange={setCenterTypeFilter}
              onSelectCenter={(center) => handleSelectCenter(center, true)}
              onProceed={handleProceedToSpecialty}
            />
          )}

          {currentStep === 2 && selectedCenter && (
            <Step2SpecialtySelection
              selectedCenter={selectedCenter}
              specialties={availableSpecialties}
              selectedSpecialty={selectedSpecialty}
              searchTerm={specialtySearch}
              onSearchChange={setSpecialtySearch}
              onSelectSpecialty={handleSelectSpecialty}
              onBackToCenter={() => handleGoToStep(1)}
              onProceed={handleProceedToDoctor}
            />
          )}

          {currentStep === 3 && selectedCenter && selectedSpecialty && (
            <Step3DoctorSelection
              selectedCenter={selectedCenter}
              selectedSpecialty={selectedSpecialty}
              doctors={availableDoctors}
              selectedDoctor={selectedDoctor}
              onSelectDoctor={handleSelectDoctor}
              onBackToSpecialty={() => handleGoToStep(2)}
              onProceed={handleProceedToDateTime}
            />
          )}

          {currentStep === 4 && selectedDoctor && selectedSpecialty && (
            <Step4DateTimeSelection
              selectedDoctor={selectedDoctor}
              selectedSpecialty={selectedSpecialty}
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
              onBackToDoctor={() => handleGoToStep(3)}
            />
          )}

          {currentStep === 5 && selectedCenter && selectedSpecialty && selectedDoctor && selectedSlot && (
            <DemoStep5PatientConfirmation
              selectedCenter={selectedCenter}
              selectedSpecialty={selectedSpecialty}
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              patientForm={patientForm}
              bookingError={bookingError}
              createdAppointment={createdAppointment}
              onConfirm={handleConfirmBooking}
              onFormChange={handlePatientFormChange}
              onBackToSlots={() => handleGoToStep(4)}
            />
          )}
        </div>
      </main>

      {/* Quick Lookup Modal */}
      <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
        <DialogContent className="max-w-md p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Consultar o Gestionar Turno Existente
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ingrese su DNI o código alfanumérico para revisar estado, reagendar o cancelar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label htmlFor="lookup-code" className="text-xs font-medium text-slate-700">
                Código de Turno o DNI del Paciente
              </label>
              <Input
                id="lookup-code"
                placeholder="Ej: LUVIA-CDE-8491 o 38123456"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            {lookupMessage && (
              <div className="rounded-md border border-sky-200 bg-sky-50 p-2.5 text-xs text-sky-800">
                {lookupMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLookupOpen(false)}
                className="h-7 text-xs"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (lookupCode.trim()) {
                    setLookupMessage(
                      'La búsqueda de turnos reales no está disponible en esta demostración. El comprobante de prueba se muestra al finalizar el recorrido actual.'
                    )
                  }
                }}
                className="h-7 cursor-pointer gap-1.5 bg-sky-700 text-xs font-semibold text-white hover:bg-sky-800"
              >
                <Search className="size-3.5" />
                <span>Buscar</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accessible Login Portal Dialog */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="max-w-sm p-5 text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Portal Asistencial ESU
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Acceso seguro para profesionales de la salud, secretaría asistencial y pacientes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-slate-600">
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3">
              Módulo de autenticación JWT y control de acceso RBAC disponible en la siguiente fase de integración.
            </p>
            <Button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="w-full bg-sky-700 text-xs font-semibold text-white hover:bg-sky-800"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
