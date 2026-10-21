import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Stethoscope, User, Calendar, Clock, ChevronLeft, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { HealthCenter, MedicalSpecialty, MedicalDoctor, AppointmentSlot, PatientBookingForm } from '../types'
import { AVAILABLE_INSURANCES } from '../data/mockTurneroData'
import { patientBookingSchema } from '../patientValidation'
import { CoverageValidator } from '@/features/paciente/components/CoverageValidator'
import { GrupoFamiliarModal, type Familiar } from '@/features/paciente/components/GrupoFamiliarModal'

interface Step5PatientConfirmationProps {
  selectedCenter: HealthCenter
  selectedSpecialty: MedicalSpecialty
  selectedDoctor: MedicalDoctor
  selectedDate: string
  selectedSlot: AppointmentSlot
  patientForm: PatientBookingForm
  onFormChange: (field: keyof PatientBookingForm, value: string) => void
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
  onBackToSlots,
}) => {
  const [isFamiliarModalOpen, setIsFamiliarModalOpen] = React.useState(false)

  const { register, setValue, formState: { errors } } = useForm<PatientBookingForm>({
    resolver: zodResolver(patientBookingSchema) as any,
    defaultValues: patientForm,
    mode: 'onBlur',
    shouldFocusError: true,
  })

  const handleSelectFamiliar = (fam: Familiar) => {
    onFormChange('firstName', fam.nombre)
    onFormChange('lastName', fam.apellido)
    onFormChange('dni', fam.dni.replace(/\D/g, ''))
    if (fam.obraSocial) onFormChange('healthInsurance', fam.obraSocial)
    if (fam.nroAfiliado) onFormChange('affiliateNumber', fam.nroAfiliado)

    setValue('firstName', fam.nombre, { shouldValidate: true })
    setValue('lastName', fam.apellido, { shouldValidate: true })
    setValue('dni', fam.dni.replace(/\D/g, ''), { shouldValidate: true })
    if (fam.obraSocial) setValue('healthInsurance', fam.obraSocial, { shouldValidate: true })
    if (fam.nroAfiliado) setValue('affiliateNumber', fam.nroAfiliado)
  }

  const fieldProps = (field: keyof PatientBookingForm) => register(field, {
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onFormChange(field, event.target.value)
    },
  })

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Datos Personales del Paciente
                </h3>
                <p className="text-xs text-slate-500">
                  Revise sus datos antes de solicitar el turno.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFamiliarModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-sky-700" />
                <span>¿Turno para un familiar?</span>
              </button>
            </div>

            <form noValidate onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="patient-dni" className="text-xs font-semibold text-slate-700">DNI / Documento *</Label>
                <Input
                  id="patient-dni"
                  placeholder="Ej: 38123456"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.dni)}
                  aria-describedby={errors.dni ? 'patient-dni-error' : undefined}
                  {...fieldProps('dni')}
                  className="h-9 rounded-lg border-slate-300 text-xs focus-visible:ring-sky-700"
                />
                {errors.dni && <p id="patient-dni-error" role="alert" className="text-xs font-medium text-rose-700">{errors.dni.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-phone" className="text-xs font-semibold text-slate-700">Teléfono de Contacto (WhatsApp) *</Label>
                <Input
                  id="patient-phone"
                  placeholder="Ej: 3549 15412345"
                  required
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'patient-phone-error' : undefined}
                  {...fieldProps('phone')}
                  className="h-9 rounded-lg border-slate-300 text-xs focus-visible:ring-sky-700"
                />
                {errors.phone && <p id="patient-phone-error" role="alert" className="text-xs font-medium text-rose-700">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-firstname" className="text-xs font-semibold text-slate-700">Nombre(s) *</Label>
                <Input
                  id="patient-firstname"
                  placeholder="Ej: Juan Carlos"
                  required
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? 'patient-firstname-error' : undefined}
                  {...fieldProps('firstName')}
                  className="h-9 rounded-lg border-slate-300 text-xs focus-visible:ring-sky-700"
                />
                {errors.firstName && <p id="patient-firstname-error" role="alert" className="text-xs font-medium text-rose-700">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-lastname" className="text-xs font-semibold text-slate-700">Apellido(s) *</Label>
                <Input
                  id="patient-lastname"
                  placeholder="Ej: Pérez"
                  required
                  autoComplete="family-name"
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? 'patient-lastname-error' : undefined}
                  {...fieldProps('lastName')}
                  className="h-9 rounded-lg border-slate-300 text-xs focus-visible:ring-sky-700"
                />
                {errors.lastName && <p id="patient-lastname-error" role="alert" className="text-xs font-medium text-rose-700">{errors.lastName.message}</p>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="patient-email" className="text-xs font-semibold text-slate-700">Correo Electrónico (opcional)</Label>
                <Input
                  id="patient-email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'patient-email-error' : undefined}
                  {...fieldProps('email')}
                  className="h-9 rounded-lg border-slate-300 text-xs focus-visible:ring-sky-700"
                />
                {errors.email && <p id="patient-email-error" role="alert" className="text-xs font-medium text-rose-700">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-insurance" className="text-xs font-semibold text-slate-700">Cobertura Médica / Obra Social</Label>
                <select
                  id="patient-insurance"
                  required
                  aria-invalid={Boolean(errors.healthInsurance)}
                  aria-describedby={errors.healthInsurance ? 'patient-insurance-error' : undefined}
                  {...fieldProps('healthInsurance')}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  {AVAILABLE_INSURANCES.map((ins) => (
                    <option key={ins} value={ins}>{ins}</option>
                  ))}
                </select>
                {errors.healthInsurance && <p id="patient-insurance-error" role="alert" className="text-xs font-medium text-rose-700">{errors.healthInsurance.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="patient-affiliate" className="text-xs font-semibold text-slate-700">N° de Afiliado (opcional)</Label>
                <Input
                  id="patient-affiliate"
                  placeholder="Ej: 102938475-01"
                  {...fieldProps('affiliateNumber')}
                  className="h-9 rounded-lg border-slate-300 text-xs focus-visible:ring-sky-700"
                />
              </div>
            </div>

            {/* HU-FE-67: Validador de Coberturas Médicas y Estado de Obra Social */}
            <CoverageValidator
              obraSocial={patientForm.healthInsurance}
              nroAfiliado={patientForm.affiliateNumber}
              className="mt-3"
            />

            <p role="status" className="rounded-lg border border-amber-600 bg-white p-3 text-xs font-medium text-slate-900">
              La reserva en línea todavía no está conectada. Sus datos no se enviarán ni se guardarán. Para solicitar el turno, comuníquese con {selectedCenter.name} al {selectedCenter.phone}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-500">
                * Puede revisar los datos, pero aún no confirmar la reserva en línea.
              </span>
              <Button
                type="button"
                disabled
                className="h-10 px-6 rounded-lg bg-sky-700 font-semibold text-xs text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                <span>Reserva en línea no disponible</span>
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* HU-FE-66: Modal de Grupo Familiar */}
      <GrupoFamiliarModal
        isOpen={isFamiliarModalOpen}
        onClose={() => setIsFamiliarModalOpen(false)}
        onSelectFamiliar={handleSelectFamiliar}
      />
    </section>
  )
}
