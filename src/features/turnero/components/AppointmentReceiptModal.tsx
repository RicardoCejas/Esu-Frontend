import { CheckCircle2, QrCode, Printer, RotateCcw, Building2, User, Calendar, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ConfirmedAppointment } from '../types'

interface AppointmentReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: ConfirmedAppointment | null
  onNewBooking: () => void
}

export function AppointmentReceiptModal({
  isOpen,
  onClose,
  appointment,
  onNewBooking,
}: AppointmentReceiptModalProps) {
  if (!appointment) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-700 text-white">
            <CheckCircle2 className="size-7" />
          </div>
          <DialogTitle className="mt-3 text-xl font-bold text-slate-900">
            ¡Turno Confirmado Exitosamente!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Presente este código o comprobante al ingresar a la mesa de entradas del centro de salud.
          </DialogDescription>
        </DialogHeader>

        {/* Printable Ticket Receipt */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Código de Turno</span>
              <p className="text-lg font-mono font-bold text-sky-800">{appointment.bookingCode}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="size-3.5 text-emerald-700" />
              <span>Confirmado</span>
            </span>
          </div>

          {/* QR representation */}
          <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-4">
            <div className="flex flex-col items-center gap-1.5">
              <QrCode className="size-24 text-slate-900" />
              <span className="text-[10px] font-mono text-slate-500">ESU-VERIF-{appointment.bookingCode}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Building2 className="size-3.5 text-slate-400" />
              <span className="font-semibold">{appointment.center.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-slate-400" />
              <span>{appointment.doctor.name} ({appointment.specialty.name})</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Calendar className="size-3.5 text-emerald-700" />
              <span>{appointment.date}</span>
              <Clock className="ml-2 size-3.5 text-emerald-700" />
              <span>{appointment.slot.time} hs</span>
            </div>
            <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600">
              <p>Paciente: <span className="font-semibold text-slate-900">{appointment.patient.firstName} {appointment.patient.lastName}</span></p>
              <p>DNI: <span className="font-semibold text-slate-900">{appointment.patient.dni}</span> · Cobertura: <span className="font-semibold text-slate-900">{appointment.patient.healthInsurance}</span></p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="cursor-pointer gap-1.5 text-xs font-semibold"
          >
            <Printer className="size-3.5" />
            <span>Imprimir / PDF</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onNewBooking}
            className="cursor-pointer gap-1.5 bg-sky-700 text-xs font-semibold text-white hover:bg-sky-800"
          >
            <RotateCcw className="size-3.5" />
            <span>Reservar Otro Turno</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
