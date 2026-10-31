import React, { useState, useMemo } from 'react'
import {
  User,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Search,
  X,
  LayoutGrid,
  List,
  Check,
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
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PRESENCIAL' | 'VIRTUAL'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === 'ALL' || doc.consultationType === typeFilter
      return matchesSearch && matchesType
    })
  }, [doctors, searchTerm, typeFilter])

  return (
    <section className="space-y-6 pb-20 sm:pb-16">
      {/* Context Banner: Selected Specialty & Institution */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Stethoscope className="size-6" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Especialidad e Institución
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">{selectedSpecialty.name}</h3>
            <span className="text-sm text-slate-500">{selectedCenter.name} • {selectedCenter.address}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToSpecialty}
          className="h-10 cursor-pointer gap-2 px-4 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <ChevronLeft className="size-4" />
          <span>Cambiar Especialidad</span>
        </Button>
      </div>

      {/* Controls Bar: Search, Filters & View Toggle */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            3. Seleccione el Profesional Médico
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'profesional disponible' : 'profesionales disponibles'} para esta especialidad
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
          {/* Instant Search Bar */}
          <div className="relative min-w-[260px] sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 pr-9 text-sm sm:text-base rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-slate-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'Todos', value: 'ALL' },
              { label: 'Presencial', value: 'PRESENCIAL' },
              { label: 'Telemedicina', value: 'VIRTUAL' },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTypeFilter(f.value as 'ALL' | 'PRESENCIAL' | 'VIRTUAL')}
                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  typeFilter === f.value
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista en Tarjetas"
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Vista en Directorio"
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List Mode */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => {
            const isSelected = selectedDoctor?.id === doctor.id

            return (
              <Card
                key={doctor.id}
                className={`group rounded-2xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer bg-white text-left ${
                  isSelected
                    ? 'border-[#005a87] ring-4 ring-[#005a87]/15 shadow-xl bg-sky-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onSelectDoctor(doctor)}
              >
                <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7 space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        {/* Minimalist Corporate Avatar */}
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl font-bold border transition-colors ${
                          isSelected ? 'bg-[#005a87] text-white border-[#005a87]' : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-[#005a87] group-hover:text-white'
                        }`}>
                          {doctor.name
                            .split(' ')
                            .slice(1, 3)
                            .map((n) => n[0])
                            .join('') || <User className="size-6" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base sm:text-lg font-heading leading-snug">
                            {doctor.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {doctor.licenseNumber}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-[#005a87] text-white">
                                <Check className="size-3" /> Seleccionado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                        {doctor.consultationType === 'PRESENCIAL' ? 'Presencial' : 'Telemedicina'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm sm:text-base text-slate-600 border-t border-slate-100 pt-3">
                      <p>
                        <span className="font-semibold text-slate-800">Días de atención: </span>
                        <span>{doctor.availableDays.join(', ')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-4">
                    <Button
                      type="button"
                      aria-label={`Ver horarios de ${doctor.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectDoctor(doctor)
                      }}
                      size="sm"
                      className={`h-10 cursor-pointer gap-1.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-[#005a87] text-white hover:bg-[#00486c]'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="size-4" />
                          <span>Continuar a Horarios</span>
                        </>
                      ) : (
                        <>
                          <span>Elegir Profesional</span>
                          <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* High-Density Directory List Mode */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredDoctors.map((doctor) => {
            const isSelected = selectedDoctor?.id === doctor.id

            return (
              <div
                key={doctor.id}
                onClick={() => onSelectDoctor(doctor)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  isSelected ? 'bg-sky-50/40 ring-2 ring-[#005a87]' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-bold border transition-colors ${
                    isSelected ? 'bg-[#005a87] text-white border-[#005a87]' : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-[#005a87] group-hover:text-white'
                  }`}>
                    {doctor.name
                      .split(' ')
                      .slice(1, 3)
                      .map((n) => n[0])
                      .join('') || <User className="size-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base sm:text-lg text-slate-900 font-heading">
                        {doctor.name}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {doctor.licenseNumber}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                        {doctor.consultationType === 'PRESENCIAL' ? 'Presencial' : 'Telemedicina'}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-[#005a87] text-white">
                          <Check className="size-3" /> Seleccionado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Atiende: {doctor.availableDays.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-15 sm:pl-0">
                  <Button
                    type="button"
                    aria-label={`Ver horarios de ${doctor.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectDoctor(doctor)
                    }}
                    size="sm"
                    className={`h-10 px-4 text-xs sm:text-sm font-bold rounded-xl ${
                      isSelected
                        ? 'bg-[#005a87] text-white hover:bg-[#00486c]'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isSelected ? 'Continuar' : 'Elegir'}</span>
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filteredDoctors.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white">
          <User className="mx-auto size-8 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">
            No se registran médicos con agenda abierta para los filtros seleccionados.
          </p>
        </div>
      )}

      {/* Persistent Bottom Action Bar for Step 3 */}
      {selectedDoctor ? (
        <div className="sticky bottom-2 sm:bottom-4 z-20 mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl border-2 border-[#005a87] bg-white p-3.5 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <Button
              type="button"
              onClick={onBackToSpecialty}
              className="h-11 px-4 sm:px-5 rounded-xl bg-white hover:bg-slate-100 text-[#005a87] border-2 border-[#005a87] font-extrabold gap-1.5 shrink-0 cursor-pointer text-xs sm:text-sm shadow-xs transition-all hover:scale-102"
              title="Volver hacia atrás y cambiar especialidad"
            >
              <ChevronLeft className="size-4.5 text-[#005a87]" />
              <span>Volver atrás</span>
            </Button>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#005a87]">Profesional Seleccionado</span>
              <h4 className="text-sm sm:text-lg font-bold text-slate-900 truncate">{selectedDoctor.name}</h4>
              <p className="text-xs sm:text-sm text-slate-500 truncate">Matrícula {selectedDoctor.licenseNumber} · {selectedSpecialty.name}</p>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={onProceed}
            className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl bg-[#005a87] hover:bg-[#00486c] text-white font-bold text-xs sm:text-base shadow-md gap-2 shrink-0 cursor-pointer"
          >
            <span>Siguiente: Seleccionar Fecha y Horario</span>
            <ChevronRight className="size-4 sm:size-5" />
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex justify-start">
          <Button
            type="button"
            onClick={onBackToSpecialty}
            className="h-11 px-5 rounded-xl bg-white border-2 border-[#005a87] text-[#005a87] hover:bg-[#005a87] hover:text-white font-extrabold gap-2 shadow-xs cursor-pointer text-xs sm:text-sm transition-all hover:scale-102"
          >
            <ChevronLeft className="size-4.5" />
            <span>Volver a Especialidades</span>
          </Button>
        </div>
      )}
    </section>
  )
}
