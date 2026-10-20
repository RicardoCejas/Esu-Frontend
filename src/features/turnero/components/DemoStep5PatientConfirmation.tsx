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

const FIELDS: { name: 'dni' | 'firstName' | 'lastName' | 'phone' | 'email' | 'affiliateNumber'; label: string; type?: string; required?: boolean }[] = [
  { name: 'dni', label: 'DNI', required: true },
  { name: 'firstName', label: 'Nombre', required: true },
  { name: 'lastName', label: 'Apellido', required: true },
  { name: 'phone', label: 'Teléfono', type: 'tel', required: true },
  { name: 'email', label: 'Correo electrónico', type: 'email' },
  { name: 'affiliateNumber', label: 'Número de afiliado' },
]

export function DemoStep5PatientConfirmation({ selectedCenter, selectedSpecialty, selectedDoctor,
  selectedDate, selectedSlot, patientForm, onFormChange, bookingError, createdAppointment,
  onConfirm, onBackToSlots }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientBookingForm>({
    resolver: zodResolver(patientBookingSchema) as any, defaultValues: patientForm,
    mode: 'onBlur', shouldFocusError: true,
  })

  return <section aria-labelledby="demo-patient-heading" className="space-y-4">
    <div>
      <h2 id="demo-patient-heading" className="text-lg font-bold text-slate-900">5. Datos del paciente y confirmación</h2>
      <p className="text-sm text-slate-700">Completá los datos para simular el turno. No se enviarán a un servidor.</p>
    </div>
    <div className="rounded-xl border border-slate-300 bg-white p-5 text-sm text-slate-900">
      <h3 className="font-bold">Resumen de la demostración</h3>
      <p>{selectedCenter.name} · {selectedSpecialty.name} · {selectedDoctor.name}</p>
      <p>{selectedDate} a las {selectedSlot.time} hs</p>
      <Button type="button" variant="outline" onClick={onBackToSlots} className="mt-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">Cambiar fecha u horario</Button>
    </div>

    {createdAppointment ? <div role="status" className="rounded-xl border-2 border-sky-800 bg-white p-5 text-sm text-slate-900">
      <h3 className="text-lg font-bold">Demostración / no es una reserva real</h3>
      <p>Código local: {createdAppointment.code}</p>
      <p>Paciente: {createdAppointment.patient.firstName} {createdAppointment.patient.lastName}</p>
      <p>Turno simulado: {selectedDate} · {selectedSlot.time} hs · {selectedDoctor.name}</p>
      <p>Recordatorio dentro de la aplicación (simulado, 24 horas antes): {createdAppointment.reminderAt.toLocaleString('es-AR')}</p>
      <p className="mt-2 font-medium">Solo en memoria de esta pestaña. No se envía correo ni SMS; no se comparte con otros usuarios y desaparece al recargar.</p>
    </div> : <form noValidate onSubmit={handleSubmit(onConfirm)} className="space-y-4 rounded-xl border border-slate-300 bg-white p-5">
      <h3 className="font-bold text-slate-900">Datos del paciente</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ name, label, type, required }) => <div key={name} className="space-y-1">
          <label htmlFor={`demo-${name}`} className="block text-sm font-semibold text-slate-800">{label}{required ? ' *' : ''}</label>
          <Input id={`demo-${name}`} type={type ?? 'text'} required={required} aria-invalid={Boolean(errors[name])}
            aria-describedby={errors[name] ? `demo-${name}-error` : undefined}
            {...register(name, { onChange: (event: React.ChangeEvent<HTMLInputElement>) => onFormChange(name, event.target.value) })}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700" />
          {errors[name] && <p id={`demo-${name}-error`} role="alert" className="text-sm font-medium text-rose-800">{errors[name].message}</p>}
        </div>)}
        <div className="space-y-1">
          <label htmlFor="demo-insurance" className="block text-sm font-semibold text-slate-800">Cobertura médica *</label>
          <select id="demo-insurance" required aria-invalid={Boolean(errors.healthInsurance)}
            aria-describedby={errors.healthInsurance ? 'demo-insurance-error' : undefined}
            {...register('healthInsurance', { onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onFormChange('healthInsurance', event.target.value) })}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
            {AVAILABLE_INSURANCES.map((insurance) => <option key={insurance} value={insurance}>{insurance}</option>)}
          </select>
          {errors.healthInsurance && <p id="demo-insurance-error" role="alert" className="text-sm font-medium text-rose-800">{errors.healthInsurance.message}</p>}
        </div>
      </div>
      {bookingError && <p role="alert" className="rounded-lg border border-rose-700 p-3 text-sm font-medium text-rose-800">{bookingError}</p>}
      <p className="rounded-lg border border-amber-700 p-3 text-sm font-medium text-slate-900">Demostración / no es una reserva real. Los datos quedan solo en memoria de esta pestaña y se pierden al recargar.</p>
      <Button type="submit" className="min-h-10 bg-sky-800 px-6 text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">Confirmar demostración</Button>
    </form>}
  </section>
}
