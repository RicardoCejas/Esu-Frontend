import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { profesionalesService } from '@/api/profesionalesService';
import { MOCK_PROFESIONALES } from '@/api/mockData';
import type { Profesional } from '@/types';
import {
  Stethoscope,
  PlusCircle,
  Building2,
  Calendar,
  Clock,
  Search,
  BadgeCheck,
  UserCheck
} from 'lucide-react';

export const MedicosCentroPage: React.FC = () => {
  const { user } = useAuth();
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const centroId = user?.centroSaludId || 'c1';
  const centroNombre = user?.centroSaludNombre || 'Hospital Regional Aurelio Crespo';

  useEffect(() => {
    profesionalesService.getAll().then((data) => {
      // Filtrar médicos de este centro de salud (o todos si no tiene filtro específico)
      const filtrados = data.filter((p) =>
        p.centrosSaludIds ? p.centrosSaludIds.includes(centroId) : true
      );
      setProfesionales(filtrados.length > 0 ? filtrados : MOCK_PROFESIONALES);
      setLoading(false);
    });
  }, [centroId]);

  const medicosFiltrados = profesionales.filter((p) => {
    const texto = `${p.nombre} ${p.apellido} ${p.especialidadNombre} ${p.matricula}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span>Plantel Médico del Centro de Salud</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestión y alta de profesionales médicos pertenecientes a <strong>{centroNombre}</strong>.
          </p>
        </div>

        <Link
          to="/dashboard/recepcion/medicos/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Agregar Médico / Crear Cuenta</span>
        </Link>
      </div>

      {/* Banner de Sede Activa */}
      <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-xs shadow-xs">
        <Building2 className="h-5 w-5 text-sky-700 shrink-0" />
        <div>
          <span className="font-bold text-sky-900">Institución Activa: {centroNombre}</span>
          <p className="text-muted-foreground text-[11px] mt-0.5">
            Los médicos registrados en este apartado quedan automáticamente vinculados a este centro de salud para la asignación de turnos y atención ambulatoria.
          </p>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar profesional por nombre, especialidad o matrícula MP..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grid de Médicos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
        </div>
      ) : medicosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3">
          <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-bold text-sm text-foreground">No se encontraron profesionales</h3>
          <p className="text-xs text-muted-foreground">
            Podés dar de alta un nuevo médico para incorporarlo a este centro de salud.
          </p>
          <Link
            to="/dashboard/recepcion/medicos/nuevo"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Agregar Médico Ahora</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicosFiltrados.map((med) => (
            <div
              key={med.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 font-bold text-sm">
                      {med.nombre.charAt(0)}{med.apellido.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        Dr. {med.nombre} {med.apellido}
                      </h3>
                      <p className="text-xs font-bold text-sky-700 dark:text-sky-400">
                        {med.especialidadNombre || 'Medicina General'}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    <UserCheck className="h-3 w-3" /> Activo
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <p className="flex items-center gap-2">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Matrícula: <strong className="text-foreground font-mono">{med.matricula}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{centroNombre}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Atención: {med.diasAtencion?.join(', ') || 'Lunes a Viernes'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Duración consulta: {med.duracionTurnoMin || 20} min</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
