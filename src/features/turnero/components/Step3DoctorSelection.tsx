import React, { useState, useMemo } from 'react'
import {
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Search,
  X,
  LayoutGrid,
  List,
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
}

export const Step3DoctorSelection: React.FC<Step3DoctorSelectionProps> = ({
  selectedCenter,
  selectedSpecialty,
  doctors,
  selectedDoctor,
  onSelectDoctor,
  onBackToSpecialty,
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
    <section className="space-y-4">
      {/* Context Banner: Selected Specialty & Institution */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Especialidad e Institución
            </span>
            <h3 className="text-sm font-bold text-slate-900 font-heading">{selectedSpecialty.name}</h3>
            <span className="text-xs text-slate-500">{selectedCenter.name} • {selectedCenter.address}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToSpecialty}
          className="h-8 cursor-pointer gap-1.5 px-3 text-xs font-semibold rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <ChevronLeft className="size-3.5" />
          <span>Cambiar Especialidad</span>
        </Button>
      </div>

      {/* Controls Bar for High Density: Search, Filters & View Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg font-heading">
            3. Seleccione el Profesional Médico
          </h2>
          <p className="text-xs text-slate-500">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'profesional disponible' : 'profesionales disponibles'} para esta especialidad
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Instant Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 pr-8 text-xs rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-slate-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {[
              { label: 'Todos', value: 'ALL' },
              { label: 'Presencial', value: 'PRESENCIAL' },
              { label: 'Telemedicina', value: 'VIRTUAL' },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTypeFilter(f.value as 'ALL' | 'PRESENCIAL' | 'VIRTUAL')}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  typeFilter === f.value
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 ml-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista en Tarjetas"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Vista en Directorio"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List Mode */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => {
            const isSelected = selectedDoctor?.id === doctor.id

            return (
              <Card
                key={doctor.id}
                className={`group rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer bg-white text-left ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onSelectDoctor(doctor)}
              >
                <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Minimalist Corporate Avatar */}
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          {doctor.name
                            .split(' ')
                            .slice(1, 3)
                            .map((n) => n[0])
                            .join('') || <User className="size-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm font-heading leading-tight truncate">
                            {doctor.name}
                          </h3>
                          <span className="inline-block mt-0.5 font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {doctor.licenseNumber}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {doctor.consultationType === 'PRESENCIAL' ? 'Presencial' : 'Telemedicina'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <p>
                        <span className="font-semibold text-slate-700">Días: </span>
                        <span>{doctor.availableDays.join(', ')}</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs pt-0.5 text-slate-600">
                        <Calendar className="size-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          Próximo cupo: {doctor.nextAvailableDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-3">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectDoctor(doctor)
                      }}
                      size="sm"
                      className={`h-8 cursor-pointer gap-1 px-3.5 text-xs font-semibold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{isSelected ? 'Seleccionado' : 'Ver Horarios'}</span>
                      <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
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
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  isSelected ? 'bg-slate-50 border-l-4 border-l-slate-900' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    {doctor.name
                      .split(' ')
                      .slice(1, 3)
                      .map((n) => n[0])
                      .join('') || <User className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 font-heading">
                        {doctor.name}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {doctor.licenseNumber}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {doctor.consultationType === 'PRESENCIAL' ? 'Presencial' : 'Telemedicina'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Atiende: {doctor.availableDays.join(', ')} •{' '}
                      <span className="font-semibold text-slate-700">Cupo: {doctor.nextAvailableDate}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-13 sm:pl-0">
                  <Button
                    type="button"
                    size="sm"
                    className={`h-8 px-3.5 text-xs font-semibold rounded-lg ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isSelected ? 'Seleccionado' : 'Elegir'}</span>
                    <ChevronRight className="size-3.5 ml-1" />
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
    </section>
  )
}
