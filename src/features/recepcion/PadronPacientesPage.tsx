import React, { useState, useEffect } from 'react';
import { pacientesService } from '@/api/pacientesService';
import type { User } from '@/types';
import { Search, UserPlus, Phone, Mail, X } from 'lucide-react';

export const PadronPacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    pacientesService.getAll().then(setPacientes);
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const creado = await pacientesService.createPaciente(nuevoPaciente);
    setPacientes([creado, ...pacientes]);
    setModalNuevo(false);
    setNuevoPaciente({ nombre: '', apellido: '', dni: '', email: '', telefono: '' });
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.dni.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Padrón Asistencial de Pacientes</h1>
          <p className="text-xs text-muted-foreground">
            Búsqueda, registro y consulta del padrón unificado de salud de Cruz del Eje.
          </p>
        </div>

        <button
          onClick={() => setModalNuevo(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Nuevo Paciente</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Apellido o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Lista / Grid de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pacientesFiltrados.map((paciente) => (
          <div
            key={paciente.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 hover:border-primary/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  {paciente.nombre} {paciente.apellido}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  DNI: {paciente.dni}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{paciente.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{paciente.telefono || 'Sin teléfono registrado'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nuevo Paciente */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Registrar Paciente en Padrón</h3>
              <button
                onClick={() => setModalNuevo(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nuevoPaciente.nombre}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Apellido</label>
                  <input
                    type="text"
                    required
                    value={nuevoPaciente.apellido}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellido: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">DNI</label>
                <input
                  type="text"
                  required
                  value={nuevoPaciente.dni}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, dni: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={nuevoPaciente.email}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Teléfono</label>
                <input
                  type="tel"
                  value={nuevoPaciente.telefono}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="flex-1 rounded-xl border border-input py-2 font-semibold hover:bg-accent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
