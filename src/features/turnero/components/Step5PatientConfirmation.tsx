import React from 'react'
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

export const Step5PatientConfirmation: React.FC<Step5PatientConfirmationProps> = ({
  selectedCenter,
  selectedSpecialty,
  selectedDoctor,
  selectedDate,
  selectedSlot,
  patientForm,
  onFormChange,
  onConfirm,
  onBackToSlots,
}) => {
  const isFormValid =
    patientForm.dni.trim().length >= 7 &&
    patientForm.firstName.trim().length > 1 &&
    patientForm.lastName.trim().length > 1 &&
    patientForm.phone.trim().length >= 6

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg font-heading">
          5. Confirmación de Cita y Datos del Paciente
        </h2>
        <p className="text-xs text-slate-500">
          Revise los datos del turno e ingrese la información de la persona que asistirá a la consulta
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Booking Summary Card */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="bg-slate-900 px-5 py-3.5 text-white">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Resumen de Cita
              </span>
              <h3 className="text-sm font-bold text-white font-heading">
                Verificación de Turno
              </h3>
            </div>

            <div className="space-y-3.5 p-5 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Centro Médico</p>
                  <p className="font-bold text-slate-900">{selectedCenter.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedCenter.address}, Cruz del Eje</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Stethoscope className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Especialidad</p>
                  <p className="font-bold text-slate-900">{selectedSpecialty.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <User className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Profesional</p>
                  <p className="font-bold text-slate-900">{selectedDoctor.name}</p>
                  <p className="text-slate-600 font-mono text-[11px]">{selectedDoctor.licenseNumber}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Calendar className="size-4 text-slate-500" />
                  <span>Fecha: {selectedDate}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                  <Clock className="size-4 text-slate-500" />
                  <span>Horario: <strong className="text-sm font-bold text-slate-900">{selectedSlot.time} hs</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBackToSlots}
              className="w-full h-8 cursor-pointer gap-1.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="size-3.5" />
              <span>Modificar Fecha u Horario</span>
            </Button>
          </div>
        </Card>

        {/* Patient Form */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-xs lg:col-span-2">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Datos Personales del Paciente
              </h3>
              <p className="text-xs text-slate-500">
                Información para la emisión oficial del turno y envío del comprobante digital
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="patient-dni" className="text-xs font-semibold text-slate-700">DNI / Documento *</Label>
                <Input
                  id="patient-dni"
                  placeholder="Ej: 38123456"
                  value={patientForm.dni}
                  onChange={(e) => onFormChange('dni', e.target.value)}
                  className="h-9 rounded-lg border-slate-200 text-xs focus-visible:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-phone" className="text-xs font-semibold text-slate-700">Teléfono de Contacto (WhatsApp) *</Label>
                <Input
                  id="patient-phone"
                  placeholder="Ej: 3549 15412345"
                  value={patientForm.phone}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  className="h-9 rounded-lg border-slate-200 text-xs focus-visible:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-firstname" className="text-xs font-semibold text-slate-700">Nombre(s) *</Label>
                <Input
                  id="patient-firstname"
                  placeholder="Ej: Juan Carlos"
                  value={patientForm.firstName}
                  onChange={(e) => onFormChange('firstName', e.target.value)}
                  className="h-9 rounded-lg border-slate-200 text-xs focus-visible:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-lastname" className="text-xs font-semibold text-slate-700">Apellido(s) *</Label>
                <Input
                  id="patient-lastname"
                  placeholder="Ej: Pérez"
                  value={patientForm.lastName}
                  onChange={(e) => onFormChange('lastName', e.target.value)}
                  className="h-9 rounded-lg border-slate-200 text-xs focus-visible:ring-slate-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="patient-email" className="text-xs font-semibold text-slate-700">Correo Electrónico (opcional)</Label>
                <Input
                  id="patient-email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={patientForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  className="h-9 rounded-lg border-slate-200 text-xs focus-visible:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-insurance" className="text-xs font-semibold text-slate-700">Cobertura Médica / Obra Social</Label>
                <select
                  id="patient-insurance"
                  value={patientForm.healthInsurance}
                  onChange={(e) => onFormChange('healthInsurance', e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  {AVAILABLE_INSURANCES.map((ins) => (
                    <option key={ins} value={ins}>{ins}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-affiliate" className="text-xs font-semibold text-slate-700">N° de Afiliado (opcional)</Label>
                <Input
                  id="patient-affiliate"
                  placeholder="Ej: 102938475-01"
                  value={patientForm.affiliateNumber}
                  onChange={(e) => onFormChange('affiliateNumber', e.target.value)}
                  className="h-9 rounded-lg border-slate-200 text-xs focus-visible:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-500">
                {isFormValid ? '✓ Campos requeridos completos' : '* Complete los campos obligatorios para continuar'}
              </span>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={!isFormValid}
                className={`h-10 px-6 rounded-lg font-semibold text-xs text-white transition-all ${
                  isFormValid
                    ? 'cursor-pointer bg-slate-900 hover:bg-slate-800 shadow-xs'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200 shadow-none'
                }`}
              >
                <CheckCircle2 className="size-4 mr-1.5" />
                <span>Confirmar Turno y Emitir Comprobante</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
