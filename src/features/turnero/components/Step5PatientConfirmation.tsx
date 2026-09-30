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
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-xs">
            5
          </span>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Confirmación de Cita y Datos del Paciente
          </h2>
        </div>
        <p className="text-xs text-slate-500 pl-8">
          Revise los datos del turno e ingrese la información de la persona que asistirá a la consulta
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Booking Summary Card */}
        <Card className="rounded-2xl border-teal-200/80 bg-white/95 shadow-md shadow-teal-900/5 backdrop-blur-xs overflow-hidden lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 px-4 py-3 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200">
                Resumen de Cita
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Verificación de Turno
              </h3>
            </div>

            <div className="space-y-3.5 p-4 sm:p-5 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Centro Médico</p>
                  <p className="font-bold text-slate-900">{selectedCenter.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedCenter.address}, Cruz del Eje</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <Stethoscope className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Especialidad</p>
                  <p className="font-bold text-slate-900">{selectedSpecialty.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                  <User className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profesional</p>
                  <p className="font-bold text-slate-900">{selectedDoctor.name}</p>
                  <p className="text-teal-700 font-semibold text-[11px]">{selectedDoctor.licenseNumber}</p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Calendar className="size-4 text-emerald-700" />
                  <span>Fecha: {selectedDate}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 font-bold text-teal-800">
                  <Clock className="size-4 text-teal-700" />
                  <span>Horario: <strong className="text-sm text-teal-900">{selectedSlot.time} hs</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBackToSlots}
              className="w-full h-8 cursor-pointer gap-1.5 rounded-xl border-teal-200 text-xs font-bold text-teal-800 hover:border-teal-400 hover:bg-teal-50"
            >
              <ChevronLeft className="size-3.5" />
              <span>Modificar Fecha u Horario</span>
            </Button>
          </div>
        </Card>

        {/* Patient Form */}
        <Card className="rounded-2xl border-teal-200/80 bg-white/95 shadow-md shadow-teal-900/5 backdrop-blur-xs lg:col-span-2">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Datos Personales del Paciente
              </h3>
              <p className="text-xs text-slate-500">
                Información para la confección de la ficha digital y envío del comprobante de turno
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="patient-dni" className="text-xs font-bold text-slate-700">DNI / Documento *</Label>
                <Input
                  id="patient-dni"
                  placeholder="Ej: 38123456"
                  value={patientForm.dni}
                  onChange={(e) => onFormChange('dni', e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs focus-visible:border-teal-500 focus-visible:ring-teal-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-phone" className="text-xs font-bold text-slate-700">Teléfono (WhatsApp) *</Label>
                <Input
                  id="patient-phone"
                  placeholder="Ej: 3549 15412345"
                  value={patientForm.phone}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs focus-visible:border-teal-500 focus-visible:ring-teal-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-firstname" className="text-xs font-bold text-slate-700">Nombre(s) *</Label>
                <Input
                  id="patient-firstname"
                  placeholder="Ej: Juan Carlos"
                  value={patientForm.firstName}
                  onChange={(e) => onFormChange('firstName', e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs focus-visible:border-teal-500 focus-visible:ring-teal-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-lastname" className="text-xs font-bold text-slate-700">Apellido(s) *</Label>
                <Input
                  id="patient-lastname"
                  placeholder="Ej: Pérez"
                  value={patientForm.lastName}
                  onChange={(e) => onFormChange('lastName', e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs focus-visible:border-teal-500 focus-visible:ring-teal-200"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="patient-email" className="text-xs font-bold text-slate-700">Correo Electrónico (opcional)</Label>
                <Input
                  id="patient-email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={patientForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs focus-visible:border-teal-500 focus-visible:ring-teal-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-insurance" className="text-xs font-bold text-slate-700">Cobertura Médica / Obra Social</Label>
                <select
                  id="patient-insurance"
                  value={patientForm.healthInsurance}
                  onChange={(e) => onFormChange('healthInsurance', e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                >
                  {AVAILABLE_INSURANCES.map((ins) => (
                    <option key={ins} value={ins}>{ins}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-affiliate" className="text-xs font-bold text-slate-700">N° Afiliado (opcional)</Label>
                <Input
                  id="patient-affiliate"
                  placeholder="Ej: 102938475-01"
                  value={patientForm.affiliateNumber}
                  onChange={(e) => onFormChange('affiliateNumber', e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs focus-visible:border-teal-500 focus-visible:ring-teal-200"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-500">
                {isFormValid ? '✓ Todos los datos requeridos fueron completados' : '* Complete los campos obligatorios'}
              </span>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={!isFormValid}
                className={`h-11 px-6 rounded-xl font-bold text-xs text-white transition-all ${
                  isFormValid
                    ? 'cursor-pointer bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-md shadow-emerald-700/25 hover:from-emerald-700 hover:to-cyan-700 hover:scale-[1.02]'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'
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
