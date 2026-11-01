import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pacientesService } from '@/api/pacientesService';
import type { User } from '@/types';
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  Lock,
  UserCheck,
  CreditCard,
  X,
  Eye,
} from 'lucide-react';

export const PadronPacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<User | null>(null);

  useEffect(() => {
    pacientesService.getAll().then(setPacientes);
  }, []);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.dni.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Padrón Asistencial y Empadronamiento
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Registro administrativo de pacientes adscriptos a la red de salud de Cruz del Eje para gestión de turnos.
          </p>
        </div>

        <Link
          to="/dashboard/recepcion/pacientes/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Nuevo Paciente</span>
        </Link>
      </div>

      {/* Banner de Protección Legal de Datos Médicos (Ley 25.326 y 26.529) */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-xs text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-2xs mt-0.5">
            <Lock className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <span className="font-bold text-sky-950 text-sm">
              Protección de Datos Sensibles y Confidencialidad Asistencial
            </span>
            <p className="text-sky-800 text-xs leading-relaxed">
              El personal administrativo del centro de salud tiene acceso regulado únicamente a datos demográficos, contacto y cobertura social para asignación de turnos. Por resguardo del secreto médico legal (Ley 25.326 y 26.529), las <strong>historias clínicas, evoluciones, diagnósticos y prescripciones</strong> son confidenciales e inaccesibles desde este módulo.
            </p>
          </div>
        </div>
      </div>

      {/* Buscador de Padrón */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Apellido o número de DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Lista / Grid de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pacientesFiltrados.map((paciente) => (
          <div
            key={paciente.id}
            onClick={() => setPacienteSeleccionado(paciente)}
            className="group rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3.5 hover:border-primary/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                    {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground font-heading group-hover:text-primary transition-colors">
                      {paciente.nombre} {paciente.apellido}
                    </h3>
                    <span className="font-mono text-xs font-bold text-sky-700 block">
                      DNI: {paciente.dni}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  <UserCheck className="h-3 w-3" /> Padrón Activo
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-2.5 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">{paciente.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  <span>{paciente.telefono || '3549-420000'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  <span className="font-semibold text-slate-700">APROSS / Particular</span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ficha Administrativa</span>
              <Eye className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Ficha Administrativa de Paciente (Sin vulnerar historia clínica) */}
      {pacienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 font-bold text-base">
                  {pacienteSeleccionado.nombre.charAt(0)}{pacienteSeleccionado.apellido.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground font-heading">
                    {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    DNI: <strong>{pacienteSeleccionado.dni}</strong> • Padrón Cruz del Eje
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPacienteSeleccionado(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-950 block">
                  Datos de Contacto y Residencia
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Teléfono Principal:</span>
                    <strong className="text-foreground">{pacienteSeleccionado.telefono || '3549-420000'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Correo Electrónico:</span>
                    <strong className="text-foreground truncate block">{pacienteSeleccionado.email}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Localidad y Domicilio:</span>
                    <strong className="text-foreground">Sarmiento 340, Cruz del Eje</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Cobertura / Obra Social:</span>
                    <strong className="text-foreground">APROSS • Plan Integral</strong>
                  </div>
                </div>
              </div>

              {/* Protección de Historia Clínica */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Privacidad Clínica Garantizada</span>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Las evoluciones médicas, antecedentes y recetas son de acceso exclusivo en el consultorio del médico tratante y no son visibles por personal de recepción.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPacienteSeleccionado(null)}
                  className="rounded-xl bg-slate-800 text-white px-5 py-2 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
