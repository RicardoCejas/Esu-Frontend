import { useState } from 'react'
import {
  CheckCircle2,
  QrCode,
  Printer,
  RotateCcw,
  Building2,
  User,
  Calendar,
  Clock,
  Download,
  MessageCircle,
  Check
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
  const [guardado, setGuardado] = useState(false)

  if (!appointment) return null

  const handlePrint = () => {
    window.print()
  }

  const handleGuardarComprobante = () => {
    // Generar archivo de comprobante descargable
    const contenido = `
========================================
   LUVIA · TU SALUD, UNIFICADA
       CRUZ DEL EJE - CÓRDOBA
========================================
COMPROBANTE OFICIAL DE TURNO MÉDICO

CÓDIGO DE TURNO: ${appointment.bookingCode}
ESTADO: CONFIRMADO

PACIENTE: ${appointment.patient.firstName} ${appointment.patient.lastName}
DNI: ${appointment.patient.dni}
COBERTURA: ${appointment.patient.healthInsurance || 'Particular'}

CENTRO DE SALUD: ${appointment.center.name}
DIRECCIÓN: ${appointment.center.address}
PROFESIONAL: ${appointment.doctor.name}
ESPECIALIDAD: ${appointment.specialty.name}

FECHA: ${appointment.date}
HORA: ${appointment.slot.time} hs

CÓDIGO DE VALIDACIÓN QR: LUVIA-VERIF-${appointment.bookingCode}
----------------------------------------
Presente este comprobante en mesa de entradas al llegar.
Guardia Hospital Aurelio Crespo: 107 / (03549) 422111
========================================
    `.trim()

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Comprobante_Turno_${appointment.bookingCode}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setGuardado(true)
    setTimeout(() => setGuardado(false), 3500)
  }

  const handleCompartirWhatsapp = () => {
    const texto = encodeURIComponent(
      `🏥 *Turno Confirmado en Luvia Cruz del Eje*\n\n` +
      `📅 *Fecha:* ${appointment.date}\n` +
      `⏰ *Hora:* ${appointment.slot.time} hs\n` +
      `👨‍⚕️ *Médico:* ${appointment.doctor.name} (${appointment.specialty.name})\n` +
      `🏢 *Lugar:* ${appointment.center.name} (${appointment.center.address})\n` +
      `🎫 *Código:* ${appointment.bookingCode}\n\n` +
      `_Presente el código en recepción al llegar._`
    )
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-3xl border-teal-500/30 bg-card shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          {/* Icono de Éxito con Aura Verde */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 animate-bounce">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <DialogTitle className="text-2xl font-extrabold text-foreground font-heading">
            ¡Turno Confirmado Exitosamente!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            Presente este código o comprobante al ingresar a la mesa de entradas del centro de salud.
          </DialogDescription>
        </DialogHeader>

        {/* Notificación de guardado */}
        {guardado && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-700 font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>¡Comprobante descargado en tu dispositivo!</span>
          </div>
        )}

        {/* Ticket Digital Premium */}
        <div className="space-y-4 rounded-3xl border-2 border-teal-500/30 bg-gradient-to-b from-teal-50/60 to-white p-5 shadow-md">
          {/* Cabecera del Ticket */}
          <div className="flex items-center justify-between border-b border-teal-200 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700">
                Código de Turno Oficial
              </span>
              <p className="text-2xl font-mono font-extrabold text-teal-950 tracking-tight">
                {appointment.bookingCode}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Confirmado</span>
            </span>
          </div>

          {/* Código QR Ilustrado */}
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-teal-300 bg-white p-4 shadow-inner">
            <div className="flex flex-col items-center gap-2">
              <QrCode className="h-24 w-24 text-slate-800" />
              <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                LUVIA-VERIF-{appointment.bookingCode}
              </span>
            </div>
          </div>

          {/* Datos del Turno y Paciente */}
          <div className="space-y-2.5 text-xs text-slate-700 bg-white/80 p-3.5 rounded-2xl border border-teal-100">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">{appointment.center.name}</span>
                <span className="text-[11px] text-muted-foreground">{appointment.center.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600 shrink-0" />
              <span className="font-semibold text-foreground">
                {appointment.doctor.name} <span className="text-teal-700 font-normal">({appointment.specialty.name})</span>
              </span>
            </div>

            <div className="flex items-center gap-3 font-bold text-teal-900 bg-teal-50 p-2 rounded-xl">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal-600" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-600" />
                <span>{appointment.slot.time} hs</span>
              </div>
            </div>

            <div className="border-t border-slate-200/80 pt-2 text-[11px] text-muted-foreground flex justify-between">
              <div>
                Paciente: <strong className="text-foreground">{appointment.patient.firstName} {appointment.patient.lastName}</strong>
              </div>
              <div>
                DNI: <strong className="font-mono text-foreground">{appointment.patient.dni}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN PRINCIPAL LLAMATIVO DE GUARDAR */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleGuardarComprobante}
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-teal-500/30 hover:scale-[1.02] hover:shadow-teal-500/50 transition-all cursor-pointer"
          >
            <Download className="h-5 w-5 animate-pulse" />
            <span>GUARDAR COMPROBANTE DE TURNO</span>
          </button>

          {/* Botones Secundarios */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCompartirWhatsapp}
              className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 rounded-full border border-input bg-card py-2.5 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
            >
              <Printer className="h-4 w-4 text-teal-600" />
              <span>Imprimir / PDF</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNewBooking}
            className="flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold text-muted-foreground hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Sacar otro turno</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
