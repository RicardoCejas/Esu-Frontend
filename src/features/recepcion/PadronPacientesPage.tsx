import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pacientesService } from '@/api/pacientesService';
import type { User } from '@/types';
import {
  Search,
  UserPlus,
  Phone,
  Lock,
  X,
  Eye,
  Users,
} from 'lucide-react';

export const PadronPacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<User | null>(null);

  useEffect(() => {
    pacientesService.getAll().then(setPacientes);
  }, []);

  // Bloquear scroll al abrir modal (Regla 7.2 SSOT)
  useEffect(() => {
    if (pacienteSeleccionado) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [pacienteSeleccionado]);

  const term = busqueda.trim().toLowerCase();
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(term) ||
      p.apellido.toLowerCase().includes(term) ||
      p.dni.includes(term)
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
          className="min-h-[40px] inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span>Registrar Nuevo Paciente</span>
        </Link>
      </div>

      {/* Banner Informativo de Confidencialidad */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="font-bold text-foreground text-sm block">
              Protección de Datos Personales y Confidencialidad
            </span>
            <p className="text-muted-foreground text-xs leading-relaxed">
              El personal de recepción accede exclusivamente a datos de filiación, contacto y cobertura social para otorgar turnos. Por secreto médico legal (Ley 25.326 y 26.529), las <strong>historias clínicas y recetas</strong> son confidenciales e inaccesibles desde este módulo.
            </p>
          </div>
        </div>
      </div>

      {/* Buscador de Padrón */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            aria-label="Buscar por nombre, apellido o DNI"
            placeholder="Buscar por Nombre, Apellido o número de DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tabla Médica Asistencial */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Listado de pacientes empadronados">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="p-4">DNI</th>
                <th scope="col" className="p-4">Paciente</th>
                <th scope="col" className="p-4">Contacto</th>
                <th scope="col" className="p-4">Cobertura</th>
                <th scope="col" className="p-4 text-center">Estado</th>
                <th scope="col" className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pacientesFiltrados.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-muted/30 transition">
                  <td className="p-4 font-mono font-bold text-foreground text-sm">
                    {paciente.dni}
                  </td>
                  <td className="p-4 font-semibold text-foreground">
                    <div>{paciente.nombre} {paciente.apellido}</div>
                    <div className="text-[11px] text-muted-foreground font-normal">{paciente.email}</div>
                  </td>
                  <td className="p-4 text-muted-foreground font-mono">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                      <span>{paciente.telefono || '3549-420000'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">
                      {paciente.obraSocial || 'APROSS / Particular'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center rounded-md bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                      ACTIVO
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setPacienteSeleccionado(paciente)}
                      className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border border-input bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>Ver Ficha</span>
                    </button>
                  </td>
                </tr>
              ))}

              {pacientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30 text-muted-foreground" aria-hidden="true" />
                    <p className="font-semibold text-foreground text-sm">No se encontraron pacientes registrados</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verificá los términos ingresados o registrá un nuevo paciente en el padrón.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ficha Administrativa */}
      {pacienteSeleccionado && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <h2 id="modal-title" className="text-lg font-bold text-foreground font-heading">
                  {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  DNI: <strong>{pacienteSeleccionado.dni}</strong> • Padrón Cruz del Eje
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar ficha"
                onClick={() => setPacienteSeleccionado(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                  Datos de Contacto y Residencia
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                    <strong className="text-foreground">Cruz del Eje, Córdoba</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Cobertura / Obra Social:</span>
                    <strong className="text-foreground">APROSS • Plan Integral</strong>
                  </div>
                </div>
              </div>

              {/* Protección de Historia Clínica */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-foreground flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5">
                  <span className="font-bold">Privacidad Clínica Garantizada</span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Las evoluciones médicas, antecedentes y recetas son de acceso exclusivo en el consultorio del médico tratante y no son visibles por personal de recepción.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPacienteSeleccionado(null)}
                  className="min-h-[40px] rounded-xl bg-primary text-primary-foreground px-5 py-2 text-xs font-bold hover:bg-primary/90 transition shadow-xs cursor-pointer"
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
