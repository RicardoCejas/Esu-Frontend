import { Building2, Stethoscope, User, Calendar, Clock, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { HealthCenter, MedicalSpecialty, MedicalDoctor, AppointmentSlot, PatientBookingForm } from '../types'
import { AVAILABLE_INSURANCES } from '../data/mockTurneroData'

interface Step5PatientConfirmationProps {
  selectedCenter: HealthCenter
  selectedSpecialty: MedicalSpecialty
  selectedDoctor: MedicalDoctor
  selectedDate: string
  selectedSlot: AppointmentSlot
  patientForm: PatientBookingForm
  onFormChange: (field: keyof PatientBookingForm, value: string) => void
  onConfirm: () => void
  onBackToSlots: () => void
}

export function Step5PatientConfirmation({
  selectedCenter,
  selectedSpecialty,
  selectedDoctor,
  selectedDate,
  selectedSlot,
  patientForm,
  onFormChange,
  onConfirm,
  onBackToSlots,
}: Step5PatientConfirmationProps) {
  const isFormValid =
    patientForm.dni.trim().length >= 7 &&
    patientForm.firstName.trim().length > 1 &&
    patientForm.lastName.trim().length > 1 &&
    patientForm.phone.trim().length >= 6

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          5. Confirmación de Cita y Datos del Paciente
        </h2>
        <p className="text-xs text-slate-500">
          Revise los datos del turno e ingrese la información de la persona que asistirá a la consulta
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Booking Summary Card */}
        <Card className="border-slate-200 lg:col-span-1">
          <CardContent className="space-y-3.5 p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resumen del Turno
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Building2 className="size-4 shrink-0 text-sky-700" />
                <div>
                  <p className="font-bold text-slate-900">{selectedCenter.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedCenter.address}, Cruz del Eje</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-2.5">
                <Stethoscope className="size-4 shrink-0 text-sky-700" />
                <div>
                  <p className="font-bold text-slate-900">{selectedSpecialty.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-2.5">
                <User className="size-4 shrink-0 text-sky-700" />
                <div>
                  <p className="font-bold text-slate-900">{selectedDoctor.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedDoctor.licenseNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-2.5">
                <Calendar className="size-4 shrink-0 text-emerald-700" />
                <div>
                  <p className="font-bold text-slate-900">Fecha: {selectedDate}</p>
                  <div className="flex items-center gap-1 font-semibold text-emerald-800">
                    <Clock className="size-3" />
                    <span>Horario: {selectedSlot.time} hs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBackToSlots}
                className="w-full h-7 cursor-pointer gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="size-3" />
                <span>Modificar Fecha u Horario</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Form */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Datos Personales del Paciente
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="patient-dni" className="text-xs font-medium">DNI / Documento *</Label>
                <Input
                  id="patient-dni"
                  placeholder="Ej: 38123456"
                  value={patientForm.dni}
                  onChange={(e) => onFormChange('dni', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-phone" className="text-xs font-medium">Teléfono (WhatsApp) *</Label>
                <Input
                  id="patient-phone"
                  placeholder="Ej: 3549 15412345"
                  value={patientForm.phone}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-firstname" className="text-xs font-medium">Nombre(s) *</Label>
                <Input
                  id="patient-firstname"
                  placeholder="Ej: Juan Carlos"
                  value={patientForm.firstName}
                  onChange={(e) => onFormChange('firstName', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-lastname" className="text-xs font-medium">Apellido(s) *</Label>
                <Input
                  id="patient-lastname"
                  placeholder="Ej: Pérez"
                  value={patientForm.lastName}
                  onChange={(e) => onFormChange('lastName', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="patient-email" className="text-xs font-medium">Correo Electrónico</Label>
                <Input
                  id="patient-email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={patientForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-insurance" className="text-xs font-medium">Cobertura Médica</Label>
                <select
                  id="patient-insurance"
                  value={patientForm.healthInsurance}
                  onChange={(e) => onFormChange('healthInsurance', e.target.value)}
                  className="w-full h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
                >
                  {AVAILABLE_INSURANCES.map((ins) => (
                    <option key={ins} value={ins}>{ins}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-affiliate" className="text-xs font-medium">N° Afiliado (opcional)</Label>
                <Input
                  id="patient-affiliate"
                  placeholder="Ej: 102938475-01"
                  value={patientForm.affiliateNumber}
                  onChange={(e) => onFormChange('affiliateNumber', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 pt-3">
              <Button
                type="button"
                onClick={onConfirm}
                disabled={!isFormValid}
                size="sm"
                className="cursor-pointer gap-1.5 bg-emerald-700 font-semibold text-xs text-white hover:bg-emerald-800"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Confirmar Turno y Emitir Comprobante</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
