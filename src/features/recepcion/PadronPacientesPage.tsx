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
    pacientesService.getAll().then(setPacientes).catch(() => {});
  }, []);

  // Bloqueo de scroll cuando el modal está abierto
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>Filiación y cobertura médica para otorgamiento de turnos. Datos protegidos bajo Ley 25.326 y 26.529.</span>
          </div>
        </div>

        <Link
          to="/dashboard/recepcion/pacientes/nuevo"
          className="min-h-[40px] inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span>Registrar Nuevo Paciente</span>
        </Link>
      </div>

      {/* Contenedor Unificado: Barra de Búsqueda + Tabla */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {/* Toolbar de búsqueda y conteo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 border-b border-border bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              aria-label="Buscar por nombre, apellido o DNI"
              placeholder="Buscar por Nombre, Apellido o número de DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium self-end sm:self-auto">
            <Users className="h-3.5 w-3.5" />
            <span>{pacientesFiltrados.length} {pacientesFiltrados.length === 1 ? 'paciente' : 'pacientes'} en padrón</span>
          </div>
        </div>

        {/* Tabla Médica Asistencial */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Listado de pacientes empadronados">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="p-3.5">DNI</th>
                <th scope="col" className="p-3.5">Paciente</th>
                <th scope="col" className="p-3.5">Contacto</th>
                <th scope="col" className="p-3.5">Cobertura</th>
                <th scope="col" className="p-3.5 text-center">Estado</th>
                <th scope="col" className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No se encontraron pacientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((pac) => (
                  <tr key={pac.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-foreground">{pac.dni}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">
                        {pac.nombre} {pac.apellido}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">{pac.email}</div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
                        <span>{pac.telefono}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-foreground">{pac.obraSocial || 'Particular'}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-block rounded-md bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        ACTIVO
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setPacienteSeleccionado(pac)}
                        aria-label={`Ver ficha de ${pac.nombre} ${pac.apellido}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <span>Ver Ficha</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Accesible de Ficha de Paciente */}
      {pacienteSeleccionado && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-paciente-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 id="modal-paciente-title" className="text-base font-bold text-foreground">
                  Ficha de Empadronamiento
                </h3>
                <p className="text-xs text-muted-foreground font-mono">DNI: {pacienteSeleccionado.dni}</p>
              </div>
              <button
                type="button"
                onClick={() => setPacienteSeleccionado(null)}
                aria-label="Cerrar modal de ficha de paciente"
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted transition cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Nombre Completo
                </span>
                <p className="font-medium text-foreground">
                  {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Cobertura / Obra Social
                </span>
                <p className="font-medium text-foreground">
                  {pacienteSeleccionado.obraSocial || 'Sin cobertura declarada'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  N° Afiliado
                </span>
                <p className="font-mono font-medium text-foreground">
                  {pacienteSeleccionado.nroAfiliado || '—'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Teléfono de Contacto
                </span>
                <p className="font-mono font-medium text-foreground">{pacienteSeleccionado.telefono}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Correo Electrónico
                </span>
                <p className="font-mono font-medium text-foreground">{pacienteSeleccionado.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setPacienteSeleccionado(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
