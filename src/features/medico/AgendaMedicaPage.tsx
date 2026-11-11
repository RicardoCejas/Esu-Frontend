import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { turnosService } from '@/api/turnosService';
import { profesionalesService } from '@/api/profesionalesService';
import { centrosService } from '@/api/centrosService';
import type { Turno, EstadoTurno, BloqueoAgenda, CentroSalud } from '@/types';
import {
  Stethoscope,
  Calendar,
  CalendarOff,
  Flame,
  Plus,
  Lock,
  Building2,
  MapPin,
  DoorClosed
} from 'lucide-react';
import { ConfigurarGrillaHorariaModal } from './components/ConfigurarGrillaHorariaModal';
import { BloquearAgendaModal } from './components/BloquearAgendaModal';
import { ModalCrearSobreturno } from './components/ModalCrearSobreturno';
import { getFechaLocalHoy } from '@/lib/dateUtils';

export const AgendaMedicaPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profesionalId = user?.profesionalId || '';
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoAgenda[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroCentroId, setFiltroCentroId] = useState<string>('TODOS');

  // Modales
  const [isModalGrillaOpen, setIsModalGrillaOpen] = useState(false);
  const [isModalBloqueoOpen, setIsModalBloqueoOpen] = useState(false);
  const [isModalSobreturnoOpen, setIsModalSobreturnoOpen] = useState(false);

  const hoyStr = getFechaLocalHoy();

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [turnosData, bloqueosData, centrosData] = await Promise.all([
        turnosService.getMiAgenda({
          centroSaludId: filtroCentroId !== 'TODOS' ? filtroCentroId : undefined,
        }),
        profesionalId ? profesionalesService.getBloqueos(profesionalId) : Promise.resolve([]),
        centrosService.getAll()
      ]);

      setTurnos(turnosData);
      setBloqueos(bloqueosData);
      setCentros(centrosData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user, filtroCentroId]);

  // Obtener los centros de salud donde presta servicios el profesional
  const centrosDelProfesional = centros.filter((c) => {
    const enUser = user?.centroSaludId === c.id;
    const enTurnos = turnos.some((t) => t.centroSaludId === c.id);
    return enUser || enTurnos || c.id === 'c1' || c.id === 'c2';
  });

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoTurno) => {
    await turnosService.updateEstado(id, nuevoEstado);
    setTurnos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t))
    );
  };

  const handleIniciarAtencion = (turno: Turno) => {
    handleCambiarEstado(turno.id, 'ATENDIENDO');
    navigate(
      `/dashboard/medico/atencion?pacienteId=${turno.pacienteId}&turnoId=${turno.id}&pacienteNombre=${encodeURIComponent(
        turno.pacienteNombre
      )}&pacienteDni=${turno.pacienteDni}`
    );
  };

  const getEstadoBadge = (turno: Turno) => {
    if (turno.estado === 'CANCELADO_POR_MEDICO') {
      return (
        <span className="rounded-md bg-slate-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
          Cancelado por Bloqueo
        </span>
      );
    }

    switch (turno.estado) {
      case 'CONFIRMADO':
        return <span className="rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white">Confirmado</span>;
      case 'EN_ESPERA':
      case 'EN_SALA_DE_ESPERA':
        return <span className="rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white">En espera</span>;
      case 'ATENDIENDO':
        return <span className="rounded-md bg-sky-700 px-2.5 py-1 text-[11px] font-bold text-white">En consulta</span>;
      case 'COMPLETADO':
        return <span className="rounded-md bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-white">Atendido</span>;
      case 'CANCELADO':
        return <span className="rounded-md bg-rose-700 px-2.5 py-1 text-[11px] font-bold text-white">Cancelado</span>;
      default:
        return null;
    }
  };

  const ESTADO_LABELS: Record<string, string> = {
    TODOS: 'Todos',
    EN_ESPERA: 'En espera',
    CONFIRMADO: 'Confirmado',
    ATENDIENDO: 'Atendiendo',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado',
  };

  const turnosFiltrados = turnos.filter((t) => {
    // 1. Filtro por centro
    if (filtroCentroId !== 'TODOS' && t.centroSaludId !== filtroCentroId) {
      return false;
    }
    // 2. Filtro por estado
    if (filtroEstado === 'TODOS') return true;
    if (filtroEstado === 'EN_ESPERA') {
      return t.estado === 'EN_ESPERA' || t.estado === 'EN_SALA_DE_ESPERA';
    }
    if (filtroEstado === 'CANCELADO') {
      return t.estado === 'CANCELADO' || t.estado === 'CANCELADO_POR_MEDICO';
    }
    return t.estado === filtroEstado;
  });

  const countEnEspera = turnos.filter(
    (t) => t.estado === 'EN_ESPERA' || t.estado === 'EN_SALA_DE_ESPERA'
  ).length;
  const countAtendidos = turnos.filter((t) => t.estado === 'COMPLETADO').length;

  const sobreturnosHoy = turnos.filter(
    (t) => t.esSobreturno && t.fecha === hoyStr && t.estado !== 'CANCELADO'
  );
  const countSobreturnos = sobreturnosHoy.length;

  const bloqueosActivos = bloqueos.filter((b) => b.fechaFin >= hoyStr);

  const getCentroBadgeColor = (centroId?: string) => {
    switch (centroId) {
      case 'c1':
      case '1':
        return 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300';
      case 'c2':
      case '2':
        return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'c3':
      case '3':
        return 'border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      default:
        return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Médico con Sedes Dinámicas y KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Agenda Médica y Gestión por Sede
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {user?.nombre || 'Dr. Carlos'} {user?.apellido || 'Bustos'}
            </span>
            <span>•</span>
            <span className="tabular-nums">{user?.matricula || 'MP-34982'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              {centrosDelProfesional.length > 1
                ? `${centrosDelProfesional.length} Centros Asignados`
                : user?.centroSaludNombre || 'Hospital Regional Aurelio Crespo'}
            </span>
          </div>
        </div>

        {/* Acciones y KPIs de Disponibilidad */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
              countSobreturnos >= 3
                ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                : 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
            }`}
            title="Cupo máximo: 3 sobreturnos por médico al día"
          >
            <Flame className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Sobreturnos:</span>
            <span className="tabular-nums text-xs font-black">{countSobreturnos}/3</span>
          </div>

          <div className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
            <span className="tabular-nums">{countEnEspera}</span> en espera
          </div>

          <div className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
            <span className="tabular-nums">{countAtendidos}</span> atendidos hoy
          </div>
        </div>
      </div>

      {/* Selector de Sede de Trabajo (Fase 2: Gestión Multicentro) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Sede de Atención Activa</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Seleccione una sede específica o consulte la visión general consolidada
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltroCentroId('TODOS')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer shadow-xs ${
              filtroCentroId === 'TODOS'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Todas las Sedes</span>
            <span className="rounded-full bg-white/20 dark:bg-black/20 px-2 py-0.5 text-[10px] tabular-nums">
              {turnos.length}
            </span>
          </button>

          {centrosDelProfesional.map((c) => {
            const countTurnosCentro = turnos.filter((t) => t.centroSaludId === c.id).length;
            const isSelected = filtroCentroId === c.id;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFiltroCentroId(c.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-sky-700 text-white dark:bg-sky-800'
                    : 'border border-border bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate max-w-[220px]">{c.nombre}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-foreground font-semibold">
                  {countTurnosCentro}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botonera de Acciones de Agenda */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalGrillaOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span>Configurar Grilla Horaria por Sede</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalBloqueoOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 hover:bg-accent px-3.5 py-2 text-xs font-bold text-foreground transition cursor-pointer"
          >
            <CalendarOff className="h-4 w-4 text-amber-600" />
            <span>Bloquear Agenda</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsModalSobreturnoOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Agregar Sobreturno</span>
        </button>
      </div>

      {/* Bloqueos Activos */}
      {bloqueosActivos.length > 0 && (
        <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600" />
              Períodos Bloqueados en Agenda Médica
            </span>
            <span className="text-[11px] text-muted-foreground">
              Inhabilita generación de turnos online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {bloqueosActivos.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-dashed border-slate-400/80 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 p-3 flex items-start justify-between shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 text-white dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">
                      BLOQUEADO
                    </span>
                    <span className="tabular-nums text-xs font-bold text-foreground">
                      {b.fechaInicio} al {b.fechaFin}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Motivo: <span className="text-foreground">{b.motivo}</span>
                  </p>
                </div>
                {b.turnosAfectados && b.turnosAfectados > 0 ? (
                  <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                    {b.turnosAfectados} reprogramados
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Filtros por Estado */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {['TODOS', 'EN_ESPERA', 'CONFIRMADO', 'ATENDIENDO', 'COMPLETADO', 'CANCELADO'].map((st) => (
          <button
            key={st}
            onClick={() => setFiltroEstado(st)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              filtroEstado === st
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'bg-card border border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {ESTADO_LABELS[st] ?? st}
          </button>
        ))}
      </div>

      {/* Lista de Turnos con Identificación Rigurosa de Sede y Consultorio */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No hay turnos registrados para la sede y criterios seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {turnosFiltrados.map((turno) => {
            const isSobreturno = turno.esSobreturno;
            const isBloqueadoOCancelado =
              turno.estado === 'CANCELADO' || turno.estado === 'CANCELADO_POR_MEDICO';

            return (
              <div
                key={turno.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4.5 shadow-2xs transition-all ${
                  isBloqueadoOCancelado
                    ? 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 opacity-75'
                    : isSobreturno
                    ? 'border-l-4 border-l-amber-500 border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                    : turno.estado === 'EN_ESPERA' || turno.estado === 'EN_SALA_DE_ESPERA'
                    ? 'border-amber-500 bg-card'
                    : turno.estado === 'ATENDIENDO'
                    ? 'border-sky-500 bg-card'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Hora y Día */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`flex h-12 w-20 shrink-0 items-center justify-center rounded-xl border tabular-nums font-bold text-sm ${
                        isSobreturno
                          ? 'border-amber-400 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                          : isBloqueadoOCancelado
                          ? 'border-slate-300 bg-slate-200 text-slate-600 line-through'
                          : 'border-border bg-muted/30 text-foreground'
                      }`}
                    >
                      {turno.hora}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold mt-1">
                      {turno.fecha}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Paciente y Badges de Sede */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-foreground">
                        {turno.pacienteNombre}
                      </span>
                      <span className="tabular-nums text-xs text-muted-foreground">
                        DNI: {turno.pacienteDni}
                      </span>

                      {/* Identificación Explícita de Sede / Centro Médico */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold shadow-2xs ${getCentroBadgeColor(
                          turno.centroSaludId
                        )}`}
                      >
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span>{turno.centroSaludNombre || 'Hospital Regional Aurelio Crespo'}</span>
                      </span>

                      {/* Identificación de Consultorio / Planta */}
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
                        <DoorClosed className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{turno.consultorioNumero ? `Consultorio ${turno.consultorioNumero}` : 'Consultorio 101'}</span>
                      </span>

                      {/* Badge Sobreturno */}
                      {isSobreturno && (
                        <span className="rounded-md bg-amber-500 text-white font-black px-2 py-0.5 text-[10px] tracking-wide shadow-2xs flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          Sobreturno
                        </span>
                      )}

                      {turno.obraSocial && (
                        <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-white">
                          {turno.obraSocial}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Motivo:</span>{' '}
                      {turno.motivoConsulta || 'Consulta general y chequeo de salud'}
                    </p>

                    {turno.justificativoCancelacion && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium italic">
                        Nota: {turno.justificativoCancelacion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado y Botones de Atención */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {getEstadoBadge(turno)}

                  {turno.estado === 'CONFIRMADO' && (
                    <button
                      onClick={() => handleCambiarEstado(turno.id, 'EN_ESPERA')}
                      className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shadow-xs"
                    >
                      Marcar en Espera
                    </button>
                  )}

                  {(turno.estado === 'EN_ESPERA' ||
                    turno.estado === 'EN_SALA_DE_ESPERA' ||
                    turno.estado === 'CONFIRMADO' ||
                    turno.estado === 'ATENDIENDO') && (
                    <button
                      onClick={() => handleIniciarAtencion(turno)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
                    >
                      <Stethoscope className="h-4 w-4" />
                      <span>{turno.estado === 'ATENDIENDO' ? 'Continuar Atención' : 'Llamar y Atender'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <ConfigurarGrillaHorariaModal
        isOpen={isModalGrillaOpen}
        onClose={() => setIsModalGrillaOpen(false)}
        profesionalId={profesionalId}
        profesionalNombre={`${user?.nombre || 'Dr. Carlos'} ${user?.apellido || 'Bustos'}`}
        onSaved={cargarDatos}
      />

      <BloquearAgendaModal
        isOpen={isModalBloqueoOpen}
        onClose={() => setIsModalBloqueoOpen(false)}
        profesionalId={profesionalId}
        profesionalNombre={`${user?.nombre || 'Dr. Carlos'} ${user?.apellido || 'Bustos'}`}
        turnosActuales={turnos}
        onBloqueoCreado={cargarDatos}
      />

      <ModalCrearSobreturno
        isOpen={isModalSobreturnoOpen}
        onClose={() => setIsModalSobreturnoOpen(false)}
        profesionalId={profesionalId}
        centroSaludId={filtroCentroId !== 'TODOS' ? filtroCentroId : (user?.centroSaludId || 'c1')}
        fecha={hoyStr}
        sobreturnosHoyCount={countSobreturnos}
        onSobreturnoCreado={() => {
          cargarDatos();
        }}
      />
    </div>
  );
};
