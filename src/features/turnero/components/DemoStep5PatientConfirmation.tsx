import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AVAILABLE_INSURANCES } from '../data/mockTurneroData'
import { patientBookingSchema } from '../patientValidation'
import type { DemoBooking } from '../demoBookingStore'
import type { AppointmentSlot, HealthCenter, MedicalDoctor, MedicalSpecialty, PatientBookingForm } from '../types'

interface Props {
  selectedCenter: HealthCenter
  selectedSpecialty: MedicalSpecialty
  selectedDoctor: MedicalDoctor
  selectedDate: string
  selectedSlot: AppointmentSlot
  patientForm: PatientBookingForm
  onFormChange: (field: keyof PatientBookingForm, value: string) => void
  bookingError: string | null
  createdAppointment: DemoBooking | null
  onConfirm: (patient: PatientBookingForm) => void
  onBackToSlots: () => void
}

export function DemoStep5PatientConfirmation({
  selectedCenter,
  selectedSpecialty,
  selectedDoctor,
  selectedDate,
  selectedSlot,
  patientForm,
  onFormChange,
  bookingError,
  createdAppointment,
  onConfirm,
  onBackToSlots,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientBookingForm>({
    resolver: zodResolver(patientBookingSchema) as any,
    defaultValues: {
      ...patientForm,
      affiliateNumber: '',
    },
    mode: 'onBlur',
    shouldFocusError: true,
  })

  return (
    <section aria-labelledby="demo-patient-heading" className="space-y-6 pb-20">
      <div>
        <h2 id="demo-patient-heading" className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
          5. Datos del Paciente y Confirmación
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Completá los datos del paciente para asegurar el turno en el sistema de salud de Cruz del Eje.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xs">
        <h3 className="font-bold text-base sm:text-lg mb-2">Resumen de la reserva</h3>
        <p className="text-sm sm:text-base text-slate-700">
          <span className="font-semibold text-slate-900">{selectedCenter.name}</span> · {selectedSpecialty.name} · {selectedDoctor.name}
        </p>
        <p className="text-sm sm:text-base font-bold text-[#005a87] mt-1">
          {selectedDate} a las {selectedSlot.time} hs (Consulta Presencial)
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToSlots}
          className="mt-4 h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 cursor-pointer hover:bg-slate-50"
        >
          Cambiar fecha u horario
        </Button>
      </div>

      {createdAppointment ? (
        <div role="status" className="rounded-2xl border-2 border-sky-800 bg-white p-6 sm:p-7 text-slate-900 shadow-md space-y-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-800">
            ✓ Turno Registrado con Éxito
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">Comprobante de Turno</h3>
          <p className="text-sm sm:text-base">
            <span className="font-semibold">Código de Gestión:</span> <span className="font-mono font-bold text-sky-800">{createdAppointment.code}</span>
          </p>
          <p className="text-sm sm:text-base">
            <span className="font-semibold">Paciente:</span> {createdAppointment.patient.firstName} {createdAppointment.patient.lastName} (DNI {createdAppointment.patient.dni})
          </p>
          <p className="text-sm sm:text-base">
            <span className="font-semibold">Fecha y Hora:</span> {selectedDate} · {selectedSlot.time} hs · {selectedDoctor.name}
          </p>
          <p className="text-sm text-slate-500 pt-2 border-t border-slate-100">
            Recordatorio registrado para 24 horas antes del turno. Guarde su código para futuras consultas.
          </p>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(onConfirm)} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">Datos del paciente</h3>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* DNI */}
            <div className="space-y-1.5">
              <label htmlFor="demo-dni" className="block text-xs sm:text-sm font-bold text-slate-800">
                DNI * (Obligatorio)
              </label>
              <Input
                id="demo-dni"
                type="text"
                placeholder="Número de documento sin puntos"
                aria-invalid={Boolean(errors.dni)}
                aria-describedby={errors.dni ? 'demo-dni-error' : undefined}
                {...register('dni', { onChange: (e) => onFormChange('dni', e.target.value) })}
                className="h-11 rounded-xl text-sm sm:text-base border-slate-200 focus-visible:outline-2 focus-visible:outline-[#005a87]"
              />
              {errors.dni && (
                <p id="demo-dni-error" role="alert" className="text-xs sm:text-sm font-medium text-rose-700">
                  {errors.dni.message}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="demo-firstName" className="block text-xs sm:text-sm font-bold text-slate-800">
                Nombre * (Obligatorio)
              </label>
              <Input
                id="demo-firstName"
                type="text"
                placeholder="Ej: Juan Carlos"
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? 'demo-firstName-error' : undefined}
                {...register('firstName', { onChange: (e) => onFormChange('firstName', e.target.value) })}
                className="h-11 rounded-xl text-sm sm:text-base border-slate-200 focus-visible:outline-2 focus-visible:outline-[#005a87]"
              />
              {errors.firstName && (
                <p id="demo-firstName-error" role="alert" className="text-xs sm:text-sm font-medium text-rose-700">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div className="space-y-1.5">
              <label htmlFor="demo-lastName" className="block text-xs sm:text-sm font-bold text-slate-800">
                Apellido * (Obligatorio)
              </label>
              <Input
                id="demo-lastName"
                type="text"
                placeholder="Ej: Pérez"
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={errors.lastName ? 'demo-lastName-error' : undefined}
                {...register('lastName', { onChange: (e) => onFormChange('lastName', e.target.value) })}
                className="h-11 rounded-xl text-sm sm:text-base border-slate-200 focus-visible:outline-2 focus-visible:outline-[#005a87]"
              />
              {errors.lastName && (
                <p id="demo-lastName-error" role="alert" className="text-xs sm:text-sm font-medium text-rose-700">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="demo-phone" className="block text-xs sm:text-sm font-bold text-slate-800">
                  Teléfono * (Obligatorio)
                </label>
                <span className="text-[11px] font-medium text-slate-500">
                  Para confirmar el turno 24 hs antes
                </span>
              </div>
              <Input
                id="demo-phone"
                type="tel"
                placeholder="Ej: 3549 123456"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'demo-phone-error' : undefined}
                {...register('phone', { onChange: (e) => onFormChange('phone', e.target.value) })}
                className="h-11 rounded-xl text-sm sm:text-base border-slate-200 focus-visible:outline-2 focus-visible:outline-[#005a87]"
              />
              {errors.phone && (
                <p id="demo-phone-error" role="alert" className="text-xs sm:text-sm font-medium text-rose-700">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-1.5">
              <label htmlFor="demo-email" className="block text-xs sm:text-sm font-semibold text-slate-800">
                Correo electrónico
              </label>
              <Input
                id="demo-email"
                type="email"
                placeholder="ejemplo@correo.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'demo-email-error' : undefined}
                {...register('email', { onChange: (e) => onFormChange('email', e.target.value) })}
                className="h-11 rounded-xl text-sm sm:text-base border-slate-200 focus-visible:outline-2 focus-visible:outline-[#005a87]"
              />
              {errors.email && (
                <p id="demo-email-error" role="alert" className="text-xs sm:text-sm font-medium text-rose-700">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Cobertura médica */}
            <div className="space-y-1.5">
              <label htmlFor="demo-insurance" className="block text-xs sm:text-sm font-bold text-slate-800">
                Cobertura médica * (Obligatorio)
              </label>
              <select
                id="demo-insurance"
                required
                aria-invalid={Boolean(errors.healthInsurance)}
                aria-describedby={errors.healthInsurance ? 'demo-insurance-error' : undefined}
                {...register('healthInsurance', {
                  onChange: (e) => onFormChange('healthInsurance', e.target.value),
                })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm sm:text-base text-slate-900 focus-visible:outline-2 focus-visible:outline-[#005a87] shadow-2xs cursor-pointer"
              >
                {AVAILABLE_INSURANCES.map((insurance) => (
                  <option key={insurance} value={insurance}>
                    {insurance}
                  </option>
                ))}
              </select>
              {errors.healthInsurance && (
                <p id="demo-insurance-error" role="alert" className="text-xs sm:text-sm font-medium text-rose-700">
                  {errors.healthInsurance.message}
                </p>
              )}
            </div>
          </div>

          {bookingError && (
            <p role="alert" className="rounded-xl border border-rose-700 bg-rose-50 p-4 text-sm font-medium text-rose-800">
              {bookingError}
            </p>
          )}

          <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-xs sm:text-sm text-sky-900">
            Reserva oficial del sistema unificado ESU Cruz del Eje. Verifique sus datos antes de confirmar.
          </div>

          <Button
            type="submit"
            className="h-12 w-full sm:w-auto px-8 bg-[#005a87] text-sm sm:text-base font-bold text-white hover:bg-[#00486c] rounded-xl cursor-pointer shadow-md transition-transform hover:scale-102"
          >
            Confirmar Turno
          </Button>
        </form>
      )}
    </section>
  )
}
