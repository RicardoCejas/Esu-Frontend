import { useTurnero } from './hooks/useTurnero'
import { TurneroHeader } from './components/TurneroHeader'
import { TurneroStepper } from './components/TurneroStepper'
import { Step1CenterSelection } from './components/Step1CenterSelection'
import { Step2SpecialtySelection } from './components/Step2SpecialtySelection'
import { Step3DoctorSelection } from './components/Step3DoctorSelection'
import { Step4DateTimeSelection } from './components/Step4DateTimeSelection'
import { Step5PatientConfirmation } from './components/Step5PatientConfirmation'
import { AppointmentReceiptModal } from './components/AppointmentReceiptModal'

export function TurneroContainer() {
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
  } = useTurnero()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TurneroHeader
        selectedCenter={selectedCenter}
        selectedSpecialty={selectedSpecialty}
        selectedDoctor={selectedDoctor}
        selectedDate={selectedDate}
        selectedSlotTime={selectedSlot?.time ?? null}
        onReset={handleResetBooking}
      />

      <TurneroStepper currentStep={currentStep} onGoToStep={handleGoToStep} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {currentStep === 1 && (
          <Step1CenterSelection
            centers={filteredCenters}
            selectedCenter={selectedCenter}
            searchTerm={centerSearch}
            onSearchChange={setCenterSearch}
            typeFilter={centerTypeFilter}
            onTypeFilterChange={setCenterTypeFilter}
            onSelectCenter={handleSelectCenter}
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
            onProceed={handleProceedToConfirmation}
            onBackToDoctor={() => handleGoToStep(3)}
          />
        )}

        {currentStep === 5 && selectedCenter && selectedSpecialty && selectedDoctor && selectedSlot && (
          <Step5PatientConfirmation
            selectedCenter={selectedCenter}
            selectedSpecialty={selectedSpecialty}
            selectedDoctor={selectedDoctor}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            patientForm={patientForm}
            onFormChange={handlePatientFormChange}
            onConfirm={handleConfirmAppointment}
            onBackToSlots={() => handleGoToStep(4)}
          />
        )}
      </main>

      <AppointmentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        appointment={confirmedAppointment}
        onNewBooking={handleResetBooking}
      />
    </div>
  )
}
