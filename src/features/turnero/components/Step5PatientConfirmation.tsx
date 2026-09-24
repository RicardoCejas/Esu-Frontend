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
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Paso 5: Datos del Paciente y Confirmación
        </h2>
        <p className="text-sm text-slate-600">
          Verifique el resumen de la cita e ingrese los datos de la persona que recibirá la atención médica.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Booking Summary Card */}
        <Card className="border-slate-200 lg:col-span-1">
          <CardContent className="space-y-4 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resumen del Turno
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Building2 className="size-4 shrink-0 text-sky-700" />
                <div>
                  <p className="font-bold text-slate-900">{selectedCenter.name}</p>
                  <p className="text-slate-500">{selectedCenter.address}, Cruz del Eje</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
                <Stethoscope className="size-4 shrink-0 text-sky-700" />
                <div>
                  <p className="font-bold text-slate-900">{selectedSpecialty.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
                <User className="size-4 shrink-0 text-sky-700" />
                <div>
                  <p className="font-bold text-slate-900">{selectedDoctor.name}</p>
                  <p className="text-slate-500">{selectedDoctor.licenseNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
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

            <div className="border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBackToSlots}
                className="w-full cursor-pointer gap-1.5 text-xs font-semibold"
              >
                <ChevronLeft className="size-3.5" />
                <span>Modificar Fecha u Horario</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Form */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardContent className="space-y-4 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Datos Personales y de Cobertura
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="patient-dni">DNI / Documento *</Label>
                <Input
                  id="patient-dni"
                  placeholder="Ej: 38123456"
                  value={patientForm.dni}
                  onChange={(e) => onFormChange('dni', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patient-phone">Teléfono de Contacto (WhatsApp) *</Label>
                <Input
                  id="patient-phone"
                  placeholder="Ej: 3549 15412345"
                  value={patientForm.phone}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patient-firstname">Nombre(s) *</Label>
                <Input
                  id="patient-firstname"
                  placeholder="Ej: Juan Carlos"
                  value={patientForm.firstName}
                  onChange={(e) => onFormChange('firstName', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patient-lastname">Apellido(s) *</Label>
                <Input
                  id="patient-lastname"
                  placeholder="Ej: Pérez"
                  value={patientForm.lastName}
                  onChange={(e) => onFormChange('lastName', e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="patient-email">Correo Electrónico</Label>
                <Input
                  id="patient-email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={patientForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patient-insurance">Obra Social / Cobertura Médica</Label>
                <select
                  id="patient-insurance"
                  value={patientForm.healthInsurance}
                  onChange={(e) => onFormChange('healthInsurance', e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none"
                >
                  {AVAILABLE_INSURANCES.map((ins) => (
                    <option key={ins} value={ins}>{ins}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patient-affiliate">N° de Afiliado (si corresponde)</Label>
                <Input
                  id="patient-affiliate"
                  placeholder="Ej: 102938475-01"
                  value={patientForm.affiliateNumber}
                  onChange={(e) => onFormChange('affiliateNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 pt-4">
              <Button
                type="button"
                onClick={onConfirm}
                disabled={!isFormValid}
                className="cursor-pointer gap-2 bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
              >
                <CheckCircle2 className="size-4" />
                <span>Confirmar Turno y Emitir Comprobante</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
