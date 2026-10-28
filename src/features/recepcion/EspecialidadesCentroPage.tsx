import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profesionalesService } from '@/api/profesionalesService';
import { MOCK_ESPECIALIDADES } from '@/api/mockData';
import type { Especialidad } from '@/types';
import {
  Layers,
  PlusCircle,
  Building2,
  Search,
  CheckCircle2,
  X,
  Save,
  Stethoscope
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const EspecialidadesCentroPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario de nueva especialidad
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const centroNombre = user?.centroSaludNombre || 'Hospital Regional Aurelio Crespo';

  useEffect(() => {
    profesionalesService.getEspecialidades().then((data) => {
      setEspecialidades(data.length > 0 ? data : MOCK_ESPECIALIDADES);
    });
  }, []);

  const handleCrearEspecialidad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const nuevaEsp: Especialidad = {
      id: `esp-${Date.now()}`,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || 'Atención especializada en centro de salud.',
    };

    setEspecialidades((prev) => [nuevaEsp, ...prev]);
    MOCK_ESPECIALIDADES.unshift(nuevaEsp);
    success(`Especialidad "${nombre}" agregada a ${centroNombre}`);
    setNombre('');
    setDescripcion('');
    setModalOpen(false);
  };

  const filtradas = especialidades.filter((esp) =>
    esp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (esp.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
            <Layers className="h-6 w-6 text-primary" />
            <span>Especialidades Médicas del Centro</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestión y habilitación de especialidades médicas activas en <strong>{centroNombre}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Agregar Especialidad al Centro</span>
        </button>
      </div>

      {/* Banner del Centro */}
      <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-xs shadow-xs">
        <Building2 className="h-5 w-5 text-sky-700 shrink-0" />
        <div>
          <span className="font-bold text-sky-900">Institución: {centroNombre}</span>
          <p className="text-muted-foreground text-[11px] mt-0.5">
            Las especialidades activas son las que los pacientes podrán seleccionar al reservar turnos en esta institución.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar especialidad por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grid de Especialidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtradas.map((esp) => (
          <div
            key={esp.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  <CheckCircle2 className="h-3 w-3" /> Habilitada
                </span>
              </div>

              <h3 className="font-bold text-sm text-foreground">{esp.nombre}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {esp.descripcion || 'Atención y consulta ambulatoria especializada.'}
              </p>
            </div>

            <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Sede: {centroNombre.split('•')[0]}</span>
              <span className="text-primary font-bold">Turnos Activos</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Agregar Especialidad */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground font-heading">
                    Agregar Especialidad Médica
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Para habilitar en {centroNombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCrearEspecialidad} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nombre de la Especialidad *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Oftalmología, Cardiología, Pediatría"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Descripción del Servicio</label>
                <textarea
                  rows={3}
                  placeholder="Alcance de la consulta, diagnósticos y estudios que se realizan..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-input py-2 text-xs font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Habilitar Especialidad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
