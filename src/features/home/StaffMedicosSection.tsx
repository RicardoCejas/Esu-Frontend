import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Profesional, CentroSalud, Especialidad } from '@/types';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Building2,
  Stethoscope,
  Baby,
  HeartPulse,
  Bone,
  Sparkles,
  Eye,
  Sun,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

// Mapeo de fotos ilustrativas de alta calidad para cada médico del sistema
const DOCTOR_PHOTOS: Record<string, string> = {
  p1: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400', // Dra. Laura Fernández
  p2: 'https://images.unsplash.com/photo-1594824813583-0599f6920f01?auto=format&fit=crop&q=80&w=400&h=400', // Dra. Mariana Gómez
  p2_2: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400', // Dr. Esteban Quiroga
  p3: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400', // Dr. Fernando López
  p3_2: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400&h=400', // Dr. Gonzalo Benítez
  p4: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400&h=400', // Dra. Romina Soria
  p4_2: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400&h=400', // Dra. Florencia Medina
  p5: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400&h=400', // Dr. Matías Albarracín
  p5_2: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400&h=400', // Dr. Claudio Guzmán
  p6: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400', // Dr. Gabriel Rossi
  p6_2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400', // Dra. Silvina Castro
  p7: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400&h=400', // Dra. Andrea Montiel
  p7_2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400', // Dr. Rodrigo Sosa
};

const getDoctorSpecialtyStyle = (nombre: string) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('pediatr')) {
    return {
      Icon: Baby,
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      borderAccent: 'border-amber-500',
      avatarBg: 'bg-amber-100 text-amber-700',
    };
  }
  if (lower.includes('cardio')) {
    return {
      Icon: HeartPulse,
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      borderAccent: 'border-rose-500',
      avatarBg: 'bg-rose-100 text-rose-700',
    };
  }
  if (lower.includes('trauma') || lower.includes('ortop')) {
    return {
      Icon: Bone,
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      borderAccent: 'border-blue-500',
      avatarBg: 'bg-blue-100 text-blue-700',
    };
  }
  if (lower.includes('gineco') || lower.includes('obstetr')) {
    return {
      Icon: Sparkles,
      badge: 'bg-pink-50 text-pink-700 border-pink-200',
      borderAccent: 'border-pink-500',
      avatarBg: 'bg-pink-100 text-pink-700',
    };
  }
  if (lower.includes('oftalmo')) {
    return {
      Icon: Eye,
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderAccent: 'border-emerald-500',
      avatarBg: 'bg-emerald-100 text-emerald-700',
    };
  }
  if (lower.includes('derma')) {
    return {
      Icon: Sun,
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      borderAccent: 'border-orange-500',
      avatarBg: 'bg-orange-100 text-orange-700',
    };
  }
  return {
    Icon: Stethoscope,
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    borderAccent: 'border-teal-500',
    avatarBg: 'bg-teal-100 text-teal-700',
  };
};

interface StaffMedicosSectionProps {
  profesionales: Profesional[];
  centros: CentroSalud[];
  especialidades: Especialidad[];
  onSelectCentro: (centro: CentroSalud) => void;
}

export const StaffMedicosSection: React.FC<StaffMedicosSectionProps> = ({
  profesionales,
  centros,
  especialidades,
  onSelectCentro,
}) => {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado de profesionales
  const filteredDoctors = profesionales.filter((doctor) => {
    const matchesSpecialty =
      selectedSpecialtyId === 'all' || doctor.especialidadId === selectedSpecialtyId;
    const matchesSearch =
      doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.especialidadNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <section id="staff-medico" className="py-16 sm:py-24 bg-gradient-to-b from-background via-teal-950/[0.02] to-background border-t border-teal-100/60 scroll-mt-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-800 shadow-xs mb-3">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Profesionales Matriculados • Cruz del Eje</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
              Nuestro Cuerpo Médico
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Conocé a los especialistas y médicos de cabecera que atienden en el Hospital Provincial Aurelio Crespo, Clínicas Privadas y Dispensarios de nuestra ciudad.
            </p>
          </div>

          {/* Quick Search Doctor Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar médico por nombre o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 shadow-xs"
            />
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedSpecialtyId('all')}
            className={`cursor-pointer shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
              selectedSpecialtyId === 'all'
                ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-teal-700/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50/50'
            }`}
          >
            <span>Todos los Especialistas ({profesionales.length})</span>
          </button>

          {especialidades.map((esp) => {
            const isSelected = selectedSpecialtyId === esp.id;
            const count = profesionales.filter((p) => p.especialidadId === esp.id).length;
            if (count === 0) return null;

            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => setSelectedSpecialtyId(esp.id)}
                className={`cursor-pointer shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-teal-700/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50/50'
                }`}
              >
                <span>{esp.nombre} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-teal-200 bg-white/60 p-12 text-center text-xs text-slate-500 space-y-3">
            <Stethoscope className="mx-auto h-10 w-10 text-teal-600/50" />
            <p className="text-sm font-semibold text-slate-800">
              No se encontraron profesionales que coincidan con la búsqueda.
            </p>
            <p>Intente modificar el filtro de especialidad o limpiar el campo de búsqueda.</p>
            <button
              onClick={() => {
                setSelectedSpecialtyId('all');
                setSearchTerm('');
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition"
            >
              Ver todos los médicos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((med) => {
              const photoUrl = med.foto || DOCTOR_PHOTOS[med.id] || DOCTOR_PHOTOS['p1'];
              const style = getDoctorSpecialtyStyle(med.especialidadNombre);
              const SpecialtyIcon = style.Icon;
              const centrosDelMedico = centros.filter((c) => med.centrosSaludIds.includes(c.id));

              return (
                <div
                  key={med.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-teal-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    {/* Top: Doctor Photo & Status */}
                    <div className="relative mb-4 flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={photoUrl}
                          alt={`Dr. ${med.nombre} ${med.apellido}`}
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-teal-100 shadow-md group-hover:border-teal-400 transition-all"
                          onError={(e) => {
                            // Fallback a iniciales si la imagen falla
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-avatar');
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }}
                        />
                        <div className="fallback-avatar hidden h-20 w-20 rounded-2xl bg-teal-100 border-2 border-teal-200 items-center justify-center font-extrabold text-teal-800 text-lg shadow-md">
                          {med.nombre.charAt(0)}{med.apellido.charAt(0)}
                        </div>
                        {/* Live active dot */}
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-xs">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mb-1">
                          ✓ En Cartilla Activa
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 font-heading leading-tight truncate">
                          Dr(a). {med.nombre} {med.apellido}
                        </h3>
                        <p className="font-mono text-[11px] font-bold text-teal-700 mt-0.5">
                          {med.matricula}
                        </p>
                      </div>
                    </div>

                    {/* Specialty Pill */}
                    <div className="mb-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${style.badge}`}>
                        <SpecialtyIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{med.especialidadNombre}</span>
                      </span>
                    </div>

                    {/* Health Centers where they work */}
                    <div className="space-y-2 mb-4">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-teal-600" />
                        <span>Atiende en ({centrosDelMedico.length}):</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {centrosDelMedico.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => onSelectCentro(c)}
                            className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-teal-100 bg-teal-50/70 px-2 py-1 text-[11px] font-medium text-teal-900 hover:border-teal-400 hover:bg-teal-100 transition"
                            title="Ver detalles de la sede"
                          >
                            <MapPin className="h-2.5 w-2.5 text-teal-600 shrink-0" />
                            <span className="truncate max-w-[140px]">{c.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Attention Days */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3 mb-4">
                      <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">
                        <strong>Días:</strong> {med.diasAtencion.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Book Appointment */}
                  <div className="pt-2">
                    <Link
                      to="/turnero"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 py-2.5 px-3 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-800 hover:scale-[1.02] transition-all"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Sacar Turno con {med.nombre}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Institutional Assurance Banner */}
        <div className="mt-12 rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-white font-heading">
                ¿Sos profesional médico en Cruz del Eje y querés sumar tu agenda a Luvia?
              </h4>
              <p className="text-xs sm:text-sm text-teal-100/80 mt-1">
                Integramos tu consultorio particular o clínica privada sin costo al padrón unificado de salud.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/turnero"
              className="rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs px-6 py-3 transition shadow-md"
            >
              Explorar Turnero Online
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
