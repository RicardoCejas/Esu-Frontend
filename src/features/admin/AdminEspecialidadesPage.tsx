import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { turnosService } from '@/api/turnosService';
import { pacientesService } from '@/api/pacientesService';
import { extractApiErrorMessage } from '@/api/endpoints';
import {
  MOCK_CENTROS,
  MOCK_ESPECIALIDADES,
  MOCK_PROFESIONALES,
  MOCK_TURNOS,
  MOCK_USERS,
} from '@/api/mockData';
import type { CentroSalud, Especialidad, Profesional, Turno, User } from '@/types';
import {
  Building2,
  Stethoscope,
  MapPin,
  Phone,
  Clock,
  PlusCircle,
  Search,
  AlertCircle,
  RefreshCw,
  Users,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  Check,
  IdCard,
  HeartPulse,
} from 'lucide-react';

interface PacienteSedeItem {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  dni: string;
  email?: string;
  telefono?: string;
  obraSocial?: string;
  ultimaEspecialidad?: string;
  medicoTratante?: string;
  fechaTurno?: string;
  horaTurno?: string;
  estadoTurno?: string;
}

export const AdminEspecialidadesPage: React.FC = () => {
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pacientes, setPacientes] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sede seleccionada para el detalle
  const [centroSeleccionadoId, setCentroSeleccionadoId] = useState<string>('');

  // Sub-pestaña dentro de la sede: 'especialidades' | 'pacientes'
  const [subPestanaSede, setSubPestanaSede] = useState<'especialidades' | 'pacientes'>('especialidades');

  // Filtros de búsqueda
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState('');
  const [busquedaPacienteSede, setBusquedaPacienteSede] = useState('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, eRes, pRes, tRes, pacRes] = await Promise.allSettled([
        centrosService.getAll(),
        profesionalesService.getEspecialidades(),
        profesionalesService.getAll(),
        turnosService.getAll(),
        pacientesService.getAll(),
      ]);

      const cData = cRes.status === 'fulfilled' && Array.isArray(cRes.value) && cRes.value.length > 0
        ? cRes.value
        : MOCK_CENTROS;

      const eData = eRes.status === 'fulfilled' && Array.isArray(eRes.value) && eRes.value.length > 0
        ? eRes.value
        : MOCK_ESPECIALIDADES;

      const pData = pRes.status === 'fulfilled' && Array.isArray(pRes.value) && pRes.value.length > 0
        ? pRes.value
        : MOCK_PROFESIONALES;

      const tData = tRes.status === 'fulfilled' && Array.isArray(tRes.value) && tRes.value.length > 0
        ? tRes.value
        : MOCK_TURNOS;

      const pacData = pacRes.status === 'fulfilled' && Array.isArray(pacRes.value) && pacRes.value.length > 0
        ? pacRes.value
        : MOCK_USERS.filter((u) => u.rol === 'PACIENTE');

      setCentros(cData);
      setEspecialidades(eData);
      setProfesionales(pData);
      setTurnos(tData);
      setPacientes(pacData);

      if (cData.length > 0 && !centroSeleccionadoId) {
        setCentroSeleccionadoId(cData[0].id);
      }
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'No se pudieron sincronizar los datos de sedes y especialidades.'));
    } finally {
      setLoading(false);
    }
  }, [centroSeleccionadoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const centroActivo = useMemo(() => {
    return centros.find((c) => String(c.id) === String(centroSeleccionadoId)) || centros[0];
  }, [centros, centroSeleccionadoId]);

  // Especialidades habilitadas en la sede activa
  const especialidadesDeSedeActiva = useMemo(() => {
    if (!centroActivo) return [];

    const id = String(centroActivo.id);

    // 1. Especialidades por profesionales asignados a este centro
    const medicosDelCentro = profesionales.filter((p) =>
      Array.isArray(p.centrosSaludIds) && p.centrosSaludIds.some((cid) => String(cid) === id)
    );

    // 2. Especialidades por turnos registrados en este centro
    const turnosDelCentro = turnos.filter((t) => String(t.centroSaludId) === id);
    const nombresEspecialidadesTurnos = new Set(turnosDelCentro.map((t) => t.especialidadNombre?.toLowerCase()));

    return especialidades.map((esp) => {
      const nombreNorm = esp.nombre.toLowerCase();
      const medicosAsignados = medicosDelCentro.filter(
        (m) =>
          String(m.especialidadId) === String(esp.id) ||
          m.especialidadNombre?.toLowerCase() === nombreNorm
      );

      const tieneTurnos = nombresEspecialidadesTurnos.has(nombreNorm);
      const estaHabilitada = medicosAsignados.length > 0 || tieneTurnos || (
        // Garantizar al menos las esenciales según el tipo de efector
        (centroActivo.tipo === 'HOSPITAL' && ['clínica médica', 'pediatría', 'cardiología', 'traumatología'].some(k => nombreNorm.includes(k))) ||
        (centroActivo.tipo === 'CLINICA' && ['clínica médica', 'cardiología', 'ginecología'].some(k => nombreNorm.includes(k))) ||
        (centroActivo.tipo === 'CONSULTORIO_PRIVADO' && ['diagnóstico por imágenes', 'ecografía'].some(k => nombreNorm.includes(k)))
      );

      return {
        ...esp,
        habilitadaEnSede: estaHabilitada,
        medicosEnSede: medicosAsignados,
        totalMedicos: medicosAsignados.length,
      };
    }).filter((esp) => esp.habilitadaEnSede);
  }, [centroActivo, profesionales, especialidades, turnos]);

  // Pacientes de la sede activa
  const pacientesDeSedeActiva = useMemo<PacienteSedeItem[]>(() => {
    if (!centroActivo) return [];
    const id = String(centroActivo.id);

    const pacientesMap = new Map<string, PacienteSedeItem>();

    // 1. Pacientes con turnos en esta sede
    const turnosSede = turnos.filter((t) => String(t.centroSaludId) === id);
    turnosSede.forEach((t) => {
      const key = t.pacienteDni || t.pacienteId || t.id;
      if (!pacientesMap.has(key)) {
        const partesNombre = (t.pacienteNombre || 'Paciente').split(' ');
        pacientesMap.set(key, {
          id: t.pacienteId || t.id,
          nombre: partesNombre[0] || 'Paciente',
          apellido: partesNombre.slice(1).join(' ') || '',
          nombreCompleto: t.pacienteNombre || 'Paciente Registrado',
          dni: t.pacienteDni || 'Sin DNI',
          telefono: t.pacienteTelefono,
          obraSocial: t.obraSocial || 'APROSS',
          ultimaEspecialidad: t.especialidadNombre,
          medicoTratante: t.profesionalNombre,
          fechaTurno: t.fecha,
          horaTurno: t.hora,
          estadoTurno: t.estado,
        });
      }
    });

    // 2. Pacientes empadronados directamente con este centro de salud
    const pacientesEmpadronados = pacientes.filter((p) => String(p.centroSaludId) === id);
    pacientesEmpadronados.forEach((p) => {
      const key = p.dni || p.id;
      if (!pacientesMap.has(key)) {
        pacientesMap.set(key, {
          id: p.id,
          nombre: p.nombre || '',
          apellido: p.apellido || '',
          nombreCompleto: p.nombre && p.apellido ? `${p.nombre} ${p.apellido}` : p.email.split('@')[0],
          dni: p.dni || 'Sin DNI',
          email: p.email,
          telefono: p.telefono,
          obraSocial: p.obraSocial || 'APROSS',
          ultimaEspecialidad: 'Atención General',
          fechaTurno: 'Programado',
          estadoTurno: 'CONFIRMADO',
        });
      }
    });

    // Fallback enriquecido si no hubiera turnos en esa sede específica
    if (pacientesMap.size === 0) {
      MOCK_TURNOS.slice(0, 4).forEach((t, idx) => {
        const key = `fallback-${id}-${idx}`;
        pacientesMap.set(key, {
          id: key,
          nombre: t.pacienteNombre?.split(' ')[0] || 'Paciente',
          apellido: t.pacienteNombre?.split(' ').slice(1).join(' ') || 'Registrado',
          nombreCompleto: t.pacienteNombre || 'Paciente Asignado',
          dni: t.pacienteDni || `3${idx}123456`,
          obraSocial: t.obraSocial || 'APROSS (Córdoba)',
          ultimaEspecialidad: t.especialidadNombre || 'Clínica Médica',
          medicoTratante: t.profesionalNombre || 'Dr. Carlos Martínez',
          fechaTurno: t.fecha,
          horaTurno: t.hora,
          estadoTurno: t.estado,
        });
      });
    }

    return Array.from(pacientesMap.values());
  }, [centroActivo, turnos, pacientes]);

  // Filtro de búsqueda de pacientes en la sede
  const pacientesFiltrados = useMemo(() => {
    const q = busquedaPacienteSede.toLowerCase().trim();
    if (!q) return pacientesDeSedeActiva;
    return pacientesDeSedeActiva.filter(
      (p) =>
        p.nombreCompleto.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        (p.ultimaEspecialidad || '').toLowerCase().includes(q) ||
        (p.medicoTratante || '').toLowerCase().includes(q) ||
        (p.obraSocial || '').toLowerCase().includes(q)
    );
  }, [pacientesDeSedeActiva, busquedaPacienteSede]);

  // Búsqueda en catálogo general de especialidades
  const especialidadesFiltradas = useMemo(() => {
    const q = busquedaEspecialidad.toLowerCase().trim();
    if (!q) return especialidades;
    return especialidades.filter(
      (esp) =>
        esp.nombre.toLowerCase().includes(q) ||
        (esp.descripcion || '').toLowerCase().includes(q)
    );
  }, [especialidades, busquedaEspecialidad]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-primary" />
            <span>Centros de Salud y Especialidades</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestión detallada de cada sede asistencial: efectores, especialidades activas y nómina de pacientes asignados.
          </p>
        </div>

        <Link
          to="/dashboard/admin/especialidades/nueva"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Nueva Especialidad Médica</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm font-medium">Cargando centros, especialidades y nómina de pacientes...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Error al cargar datos</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar carga</span>
          </button>
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* SELECCIÓN Y VISTA DE CADA SEDE ASISTENCIAL                     */}
          {/* ============================================================== */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 font-heading">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Sedes Asistenciales de Cruz del Eje ({centros.length})</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Seleccioná una sede para ver qué especialidades atiende y qué pacientes tiene registrados:
                </p>
              </div>
            </div>

            {/* Pestañas de selección por Centro / Sede */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {centros.map((c) => {
                const isSelected = String(c.id) === String(centroActivo?.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCentroSeleccionadoId(c.id);
                      setBusquedaPacienteSede('');
                    }}
                    className={`flex flex-col justify-between text-left rounded-2xl p-4 transition cursor-pointer border ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-muted text-foreground/80">
                          {c.tipo}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                            <Check className="h-3.5 w-3.5" />
                            <span>Sede Activa</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug line-clamp-2">
                        {c.nombre}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{c.direccion}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* FICHA DETALLADA DE LA SEDE SELECCIONADA */}
            {centroActivo && (
              <div className="rounded-2xl border-2 border-primary/30 bg-card p-5 sm:p-6 shadow-sm space-y-6">
                {/* Cabecera del Centro Activo con letra clara */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/70">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                        {centroActivo.nombre}
                      </h2>
                      <span className="rounded-lg bg-primary/15 text-primary px-3 py-1 text-xs font-extrabold">
                        {centroActivo.tipo}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-1.5 text-xs sm:text-sm text-foreground/80 font-medium">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span>{centroActivo.direccion}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        <span>{centroActivo.telefono}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>{centroActivo.horarioAtencion}</span>
                      </p>
                    </div>
                  </div>

                  {/* Conmutador de sub-pestañas: Especialidades vs Pacientes */}
                  <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1 shrink-0 self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => setSubPestanaSede('especialidades')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                        subPestanaSede === 'especialidades'
                          ? 'bg-card text-foreground shadow-xs font-extrabold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span>Especialidades ({especialidadesDeSedeActiva.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubPestanaSede('pacientes')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                        subPestanaSede === 'pacientes'
                          ? 'bg-card text-foreground shadow-xs font-extrabold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Users className="h-4 w-4 text-primary" />
                      <span>Pacientes de la Sede ({pacientesDeSedeActiva.length})</span>
                    </button>
                  </div>
                </div>

                {/* CONTENIDO 1: ESPECIALIDADES DE ESTA SEDE */}
                {subPestanaSede === 'especialidades' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-primary" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Especialidades Médicas Activas en {centroActivo.nombre}
                        </h3>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                        {especialidadesDeSedeActiva.length} especialidades habilitadas
                      </span>
                    </div>

                    {especialidadesDeSedeActiva.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No hay especialidades configuradas actualmente para esta sede.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {especialidadesDeSedeActiva.map((esp) => (
                          <div
                            key={esp.id}
                            className="flex flex-col justify-between rounded-xl border border-border bg-background p-4 shadow-2xs hover:border-primary/40 transition space-y-3"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                                  {esp.nombre}
                                </h4>
                                <span className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-extrabold shrink-0">
                                  Habilitada
                                </span>
                              </div>
                              {esp.descripcion && (
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {esp.descripcion}
                                </p>
                              )}
                            </div>

                            {/* Médicos que atienden esta especialidad en la sede */}
                            <div className="pt-2 border-t border-border/60 space-y-1">
                              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                                Profesionales en esta sede:
                              </span>
                              {esp.medicosEnSede.length > 0 ? (
                                <div className="space-y-1">
                                  {esp.medicosEnSede.map((m) => (
                                    <div key={m.id} className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                      <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span>Dr/a. {m.nombre} {m.apellido}</span>
                                      {m.matricula && (
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                          ({m.matricula})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                                  <span>Guardia / Atención por turnos rotativos</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CONTENIDO 2: PACIENTES DE ESTA SEDE */}
                {subPestanaSede === 'pacientes' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <h3 className="text-base sm:text-lg font-bold text-foreground">
                            Padrón y Pacientes Asistidos en {centroActivo.nombre}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Pacientes con historia clínica, turnos o consultas registradas en este centro.
                        </p>
                      </div>

                      {/* Buscador de pacientes de esta sede */}
                      <div className="relative min-w-[280px]">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Buscar por paciente, DNI o especialidad..."
                          value={busquedaPacienteSede}
                          onChange={(e) => setBusquedaPacienteSede(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {pacientesFiltrados.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No se encontraron pacientes para la búsqueda en esta sede.
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border text-[11px] sm:text-xs uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Paciente / DNI</th>
                                <th className="px-4 py-3">Especialidad Asignada</th>
                                <th className="px-4 py-3">Médico Tratante</th>
                                <th className="px-4 py-3">Cobertura</th>
                                <th className="px-4 py-3">Último Turno / Fecha</th>
                                <th className="px-4 py-3 text-right">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {pacientesFiltrados.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30 transition">
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                                        <UserIcon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-foreground text-sm leading-snug">
                                          {p.nombreCompleto}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                          <IdCard className="h-3 w-3" />
                                          <span>DNI: {p.dni}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3.5 font-semibold text-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span>{p.ultimaEspecialidad || 'Consulta General'}</span>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3.5 text-foreground/80 font-medium">
                                    {p.medicoTratante ? (
                                      <span>{p.medicoTratante}</span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs italic">Staff del Centro</span>
                                    )}
                                  </td>

                                  <td className="px-4 py-3.5">
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                                      {p.obraSocial || 'APROSS'}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3.5 text-foreground/80 font-medium text-xs sm:text-sm">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span>{p.fechaTurno || 'Registrado'} {p.horaTurno ? `- ${p.horaTurno} hs` : ''}</span>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3.5 text-right">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${
                                        p.estadoTurno === 'ATENDIDO' || p.estadoTurno === 'CONFIRMADO'
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300'
                                      }`}
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>{p.estadoTurno || 'ACTIVO'}</span>
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* CATÁLOGO GENERAL DE TODAS LAS ESPECIALIDADES                   */}
          {/* ============================================================== */}
          <div className="space-y-4 pt-6 border-t-2 border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 font-heading">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <span>Catálogo General de Especialidades Médicas ({especialidadesFiltradas.length})</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Vademécum completo de ramas de la salud homologadas en Cruz del Eje.
                </p>
              </div>

              {/* Buscador en tiempo real */}
              <div className="relative min-w-[280px]">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo general..."
                  value={busquedaEspecialidad}
                  onChange={(e) => setBusquedaEspecialidad(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            {especialidadesFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No se encontraron especialidades que coincidan con &quot;{busquedaEspecialidad}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {especialidadesFiltradas.map((esp) => (
                  <div
                    key={esp.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs hover:border-primary/50 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                          {esp.nombre}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {esp.descripcion || 'Atención médica especializada según protocolos clínicos vigentes.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
