import React, { useState, useMemo, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Search,
  X,
  Check,
  Calendar,
  Building2,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { HealthCenter, MedicalSpecialty, MedicalDoctor } from '../types'

interface Step3DoctorSelectionProps {
  selectedCenter: HealthCenter
  selectedSpecialty: MedicalSpecialty
  doctors: MedicalDoctor[]
  selectedDoctor: MedicalDoctor | null
  onSelectDoctor: (doctor: MedicalDoctor) => void
  onBackToSpecialty: () => void
  onProceed?: () => void
}

// Detección de género profesional para asignar el ícono correspondiente
function isFemaleDoctor(name: string): boolean {
  const lower = name.toLowerCase()
  return (
    lower.startsWith('dra.') ||
    lower.startsWith('dra ') ||
    lower.includes('maría') ||
    lower.includes('maria') ||
    lower.includes('silvina') ||
    lower.includes('beatriz') ||
    lower.includes('marcela') ||
    lower.includes('gabriela') ||
    lower.includes('romina') ||
    lower.includes('patricia') ||
    lower.includes('carolina') ||
    lower.includes('mariana') ||
    lower.includes('lic. romina') ||
    lower.includes('lic. mariana')
  )
}

// Ícono vectorial para Doctora (médica mujer con estetoscopio)
const DoctorFemaleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Cabeza y cabello femenino */}
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M8.5 7a3.5 3.5 0 0 1 7 0v2.5c0 1.5-.5 2.5-1.5 3" />
    <path d="M8.5 9.5c0 1.5.5 2.5 1.5 3" />
    {/* Hombros y bata con estetoscopio */}
    <path d="M5.5 21v-2a4.5 4.5 0 0 1 4.5-4.5h4a4.5 4.5 0 0 1 4.5 4.5v2" />
    <path d="M10 15v2a2 2 0 0 0 4 0v-2" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" />
  </svg>
)

// Ícono vectorial para Doctor (médico varón con estetoscopio)
const DoctorMaleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Cabeza y cabello corto masculino */}
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M8.8 6.5C9.5 5 10.5 4.5 12 4.5s2.5.5 3.2 2" />
    {/* Hombros y bata con estetoscopio */}
    <path d="M5.5 21v-2a4.5 4.5 0 0 1 4.5-4.5h4a4.5 4.5 0 0 1 4.5 4.5v2" />
    <path d="M10 15v2a2 2 0 0 0 4 0v-2" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" />
  </svg>
)

export const Step3DoctorSelection: React.FC<Step3DoctorSelectionProps> = ({
  selectedCenter,
  selectedSpecialty,
  doctors,
  selectedDoctor,
  onSelectDoctor,
  onBackToSpecialty,
  onProceed,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [modalDoctor, setModalDoctor] = useState<MedicalDoctor | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Búsqueda exclusivamente por nombre de médico (sin matrícula)
  const filteredDoctors = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return doctors
    return doctors.filter((doc) => doc.name.toLowerCase().includes(q))
  }, [doctors, searchTerm])

  // Cierre de modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  // Al hacer clic en un médico: se selecciona y abre el Pop-Up de confirmación
  const handleCardClick = (doctor: MedicalDoctor) => {
    onSelectDoctor(doctor)
    setModalDoctor(doctor)
    setIsModalOpen(true)
  }

  // Confirmar desde el Pop-up y avanzar a la selección de fechas y horarios
  const handleConfirmModal = () => {
    setIsModalOpen(false)
    if (onProceed) {
      onProceed()
    }
  }

  const modalIsFemale = modalDoctor ? isFemaleDoctor(modalDoctor.name) : false

  return (
    <section className="space-y-4 sm:space-y-6 pb-12 sm:pb-16">
      {/* 1. Context Banner: Especialidad e Institución seleccionadas */}
      <div className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-sky-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />
        
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#00a896] text-white shadow-md shadow-[#00a896]/25">
            <Stethoscope className="size-6 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#005a87]">
              Especialidad e Institución
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading truncate">
              {selectedSpecialty.name}
            </h3>
            <span className="text-xs sm:text-sm text-slate-500 truncate block">
              {selectedCenter.name} • {selectedCenter.address}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToSpecialty}
          className="h-9 sm:h-10 cursor-pointer gap-1.5 px-4 text-xs sm:text-sm font-bold rounded-xl border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white transition-all self-start sm:self-auto shrink-0 shadow-2xs"
        >
          <ChevronLeft className="size-4" />
          <span>Cambiar Especialidad</span>
        </Button>
      </div>

      {/* 2. Barra de Controles: Título, Contador y Buscador sólo por nombre de médico */}
      <div className="flex flex-col gap-4 rounded-2xl sm:rounded-3xl border border-sky-100 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

        {/* Título y contador con acento azul vertical */}
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-10 sm:h-11 bg-[#005a87] rounded-full shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 font-heading leading-tight">
              3. Seleccione el Profesional Médico
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              {filteredDoctors.length}{' '}
              {filteredDoctors.length === 1
                ? 'profesional disponible para esta especialidad'
                : 'profesionales disponibles para esta especialidad'}
            </p>
          </div>
        </div>

        {/* Buscador únicamente por nombre de médico (sin matrícula ni filtros innecesarios) */}
        <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre de médico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 sm:h-11 pl-10 pr-9 text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-[#005a87] focus:border-[#00a896]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Cuadrícula de Tarjetas de Médicos más compactas y minimalistas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredDoctors.map((doctor) => {
          const isSelected = selectedDoctor?.id === doctor.id
          const isFemale = isFemaleDoctor(doctor.name)

          return (
            <Card
              key={doctor.id}
              onClick={() => handleCardClick(doctor)}
              className={`group relative rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white text-left overflow-hidden ${
                isSelected
                  ? 'border-[#005a87] bg-sky-50/50 ring-2 ring-[#005a87]/25 shadow-md -translate-y-0.5'
                  : 'border-slate-200/90 shadow-2xs hover:border-[#005a87]/80 hover:shadow-md hover:bg-slate-50/40 hover:-translate-y-0.5'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3.5">
                {/* Cabecera de la tarjeta: Ícono de Doctor/a y Nombre */}
                <div className="flex items-center gap-3">
                  {/* Ícono de médico femenino o masculino según corresponda */}
                  <div
                    className={`flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#005a87] text-white shadow-xs'
                        : 'bg-sky-50 text-[#005a87] border border-sky-100 group-hover:scale-105 group-hover:bg-[#005a87] group-hover:text-white'
                    }`}
                  >
                    {isFemale ? (
                      <DoctorFemaleIcon className="size-6 sm:size-7" />
                    ) : (
                      <DoctorMaleIcon className="size-6 sm:size-7" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-[#005a87] transition-colors line-clamp-1">
                      {doctor.name}
                    </h3>
                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {selectedSpecialty.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#005a87] text-white shadow-xs">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Días de atención presencial */}
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                  <Calendar className="size-3.5 text-[#005a87] shrink-0" />
                  <p className="truncate">
                    <span className="font-semibold text-slate-700">Días de atención: </span>
                    <span>{doctor.availableDays.join(', ')}</span>
                  </p>
                </div>

                {/* Botón de acción */}
                <div className="flex items-center justify-end pt-1">
                  <Button
                    type="button"
                    aria-label={`Elegir ${doctor.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(doctor)
                    }}
                    size="sm"
                    className={`h-9 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#005a87] to-[#00a896] text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-[#005a87] hover:bg-[#005a87] hover:text-white hover:border-[#005a87]'
                    }`}
                  >
                    <span>{isSelected ? 'Ver Fechas y Horarios' : 'Elegir Profesional'}</span>
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Estado vacío cuando no hay médicos que coincidan con la búsqueda */}
      {filteredDoctors.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white shadow-2xs">
          <Stethoscope className="mx-auto size-9 text-slate-300 mb-2" />
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            No se encontraron profesionales médicos que coincidan con la búsqueda.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="mt-3 rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
          >
            Limpiar búsqueda
          </Button>
        </div>
      )}

      {/* 4. Pop-up Modal Elaborado para Confirmar Médico y Avanzar a Fechas y Horarios */}
      {isModalOpen && modalDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Franja superior con degradado */}
            <div className="h-2 w-full bg-gradient-to-r from-[#005a87] via-[#0284c7] to-[#00a896]" />

            {/* Botón cerrar X */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="size-5" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Encabezado del Pop-up con ícono de doctor/a */}
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#005a87] to-[#0284c7] text-white shadow-lg shadow-[#005a87]/25">
                  {modalIsFemale ? (
                    <DoctorFemaleIcon className="size-8 stroke-[1.8]" />
                  ) : (
                    <DoctorMaleIcon className="size-8 stroke-[1.8]" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#005a87] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/60">
                    <Sparkles className="size-3" /> Profesional Médico Seleccionado
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-heading mt-1">
                    {modalDoctor.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {selectedSpecialty.name}
                  </p>
                </div>
              </div>

              {/* Ficha de Detalles de Atención */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2.5 font-semibold text-slate-900">
                  <Building2 className="size-4 text-[#00a896] shrink-0" />
                  <span className="truncate">{selectedCenter.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <MapPin className="size-4 text-[#005a87] shrink-0" />
                  <span className="truncate">{selectedCenter.address}, Cruz del Eje</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 pt-2 border-t border-sky-100/70">
                  <Calendar className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Días de atención:</strong> {modalDoctor.availableDays.join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Clock className="size-4 text-sky-600 shrink-0" />
                  <span>Consulta presencial en consultorios externos (turnos cada 20-30 min)</span>
                </div>
              </div>

              {/* Botones de acción del Pop-up */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm cursor-pointer"
                >
                  Elegir otro médico
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmModal}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-[#005a87] to-[#00a896] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#005a87]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                >
                  <Calendar className="size-4" />
                  <span>Siguiente: Fechas y Horarios</span>
                  <ChevronRight className="size-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón inferior Volver a Especialidades */}
      <div className="mt-8 flex justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToSpecialty}
          className="h-10 px-4 rounded-xl border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white font-bold gap-1.5 cursor-pointer text-xs sm:text-sm shadow-2xs"
        >
          <ChevronLeft className="size-4" />
          <span>Volver a Especialidades</span>
        </Button>
      </div>
    </section>
  )
}
