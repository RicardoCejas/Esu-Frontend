import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { turnosService } from '@/api/turnosService';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { pacientesService } from '@/api/pacientesService';
import { useDebounce } from '@/lib/useDebounce';
import type { Turno, CentroSalud, Profesional, User } from '@/types';
import {
  Clock,
  UserCheck,
  Search,
  Activity,
  UserPlus,
  CalendarPlus,
  Building2,
  Stethoscope,
  Sparkles,
  Layers,
  MonitorPlay,
  RotateCcw,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { ModalAltaRapidaPaciente } from './components/ModalAltaRapidaPaciente';
import { ModalVerificarCoberturaCopago } from './components/ModalVerificarCoberturaCopago';
import { ModalTurnoMostrador } from './components/ModalTurnoMostrador';
import { ModalCancelarMostrador } from './components/ModalCancelarMostrador';

export const RecepcionPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros reactivos de cabecera
  const [busqueda, setBusqueda] = useState('');
  const debouncedBusqueda = useDebounce(busqueda, 300); // 300ms Debounce según criterio DoD HU-53
  const [filtroCentro, setFiltroCentro] = useState<string>('TODOS');
  const [filtroProfesional, setFiltroProfesional] = useState<string>('TODOS');
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>('TODOS');

  // Modales HU-54
  const [isModalAltaOpen, setIsModalAltaOpen] = useState(false);
  const [isModalTurnoMostradorOpen, setIsModalTurnoMostradorOpen] = useState(false);
  const [turnoParaCopago, setTurnoParaCopago] = useState<Turno | null>(null);
  const [turnoParaCancelar, setTurnoParaCancelar] = useState<Turno | null>(null);

  // Mensaje temporal toast / alerta
  const [alerta, setAlerta] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      turnosService.getAll(),
      centrosService.getAll(),
      profesionalesService.getAll(),
      pacientesService.getAll(),
    ]).then(([turnosData, centrosData, profsData, pacsData]) => {
      setTurnos(turnosData);
      setCentros(centrosData);
      setProfesionales(profsData);
      setPacientes(pacsData);
      setLoading(false);
    });
  }, []);

  const mostrarAlerta = (mensaje: string) => {
    setAlerta(mensaje);
    setTimeout(() => setAlerta(null), 4000);
  };

  // HU-53: Check-in Presencial Inmediato a EN_SALA_DE_ESPERA
  const handleCheckIn = async (turno: Turno) => {
    const updated = await turnosService.checkIn(turno.id);
    if (updated) {
      setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
      mostrarAlerta(`Check-In exitoso: Paciente ${turno.pacienteNombre} ingresó a Sala de Espera.`);
    }
  };

  // Listado de consultorios únicos derivados de los turnos actuales
  const consultoriosDisponibles = useMemo(() => {
    const set = new Set<string>();
    turnos.forEach((t) => {
      if (t.consultorioNumero) set.add(t.consultorioNumero);
    });
    return Array.from(set).sort();
  }, [turnos]);

  // Filtrado reactivo con Debounce 300ms y filtros de sede/profesional/consultorio
  const hoyStr = new Date().toISOString().split('T')[0];
  const turnosHoy = useMemo(() => {
    return turnos.filter((t) => t.fecha === hoyStr);
  }, [turnos, hoyStr]);

  const turnosFiltrados = useMemo(() => {
    return turnosHoy.filter((t) => {
      const matchBusqueda =
        !debouncedBusqueda ||
        t.pacienteDni.includes(debouncedBusqueda) ||
        t.pacienteNombre.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
        t.codigoVerificacion.toLowerCase().includes(debouncedBusqueda.toLowerCase());

      const matchCentro = filtroCentro === 'TODOS' || t.centroSaludId === filtroCentro;
      const matchProf = filtroProfesional === 'TODOS' || t.profesionalId === filtroProfesional;
      const matchConsultorio = filtroConsultorio === 'TODOS' || t.consultorioNumero === filtroConsultorio;

      return matchBusqueda && matchCentro && matchProf && matchConsultorio;
    });
  }, [turnosHoy, debouncedBusqueda, filtroCentro, filtroProfesional, filtroConsultorio]);

  // Contadores para métricas operativas
  const enSalaDeEspera = turnosHoy.filter((t) => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA');
  const enConsulta = turnosHoy.filter((t) => t.estado === 'ATENDIENDO');
  const atendidosHoy = turnosHoy.filter((t) => t.estado === 'COMPLETADO');

  return (
    <div className="space-y-6">
      {/* Alerta de notificación flotante */}
      {alerta && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{alerta}</span>
        </div>
      )}

      {/* Header Recepción (Daily Board) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Panel de Recepción (Daily Board)
            </h1>
            <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold">
              Hoy: {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Admisión presencial, acreditación en ventanilla y control de salas de espera.
          </p>
        </div>

        {/* Acciones Rápidas (HU-54 y Enlaces HU-55) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsModalAltaOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition"
          >
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            <span>Alta Rápida Paciente</span>
          </button>

          <button
            onClick={() => setIsModalTurnoMostradorOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>Turno de Mostrador</span>
          </button>

          <Link
            to="/dashboard/recepcion/kanban"
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-600 transition"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Tablero Kanban</span>
          </Link>

          <Link
            to="/pantalla-turnos"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 px-3 py-2 text-xs font-semibold text-primary transition"
          >
            <MonitorPlay className="h-3.5 w-3.5" />
            <span>Pantalla TV / Tótem</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas de Sala de Hoy */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Turnos Hoy</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{turnosHoy.length}</div>
          <p className="text-[11px] text-muted-foreground">Programados para esta fecha</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold">En Sala de Espera</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{enSalaDeEspera.length}</div>
          <p className="text-[11px] text-amber-600/80">Acreditados listos para llamado</p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold">En Consultorio</span>
            <Activity className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{enConsulta.length}</div>
          <p className="text-[11px] text-blue-600/80">Atención médica en curso</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">Atendidos / Salida</span>
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{atendidosHoy.length}</div>
          <p className="text-[11px] text-emerald-600/80">Consultas completadas hoy</p>
        </div>
      </div>

      {/* Barra de Filtros y Buscador Reactivo (Debounce 300ms) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Buscador reactivo */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar DNI o Paciente (300ms)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          {/* Filtro Sede */}
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={filtroCentro}
              onChange={(e) => setFiltroCentro(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todas las Sedes</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Médico */}
          <div className="relative">
            <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={filtroProfesional}
              onChange={(e) => setFiltroProfesional(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todos los Médicos</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido} ({p.especialidadNombre.split('/')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Consultorio Físico */}
          <div>
            <select
              value={filtroConsultorio}
              onChange={(e) => setFiltroConsultorio(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todos los Consultorios</option>
              {consultoriosDisponibles.map((c) => (
                <option key={c} value={c}>
                  Consultorio {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grilla Diaria de Turnos */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-foreground">No se encontraron turnos para los filtros seleccionados</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Intente modificar la búsqueda por DNI o restablezca los filtros de profesional y sede.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Hora</th>
                  <th className="p-3.5">Paciente / DNI</th>
                  <th className="p-3.5">Cobertura & Copago</th>
                  <th className="p-3.5">Médico / Especialidad</th>
                  <th className="p-3.5">Consultorio / Sede</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acciones de Ventanilla</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {turnosFiltrados.map((t) => {
                  const esEnEspera = t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA';
                  const esAtendiendo = t.estado === 'ATENDIENDO';
                  const esCompletado = t.estado === 'COMPLETADO';
                  const esCancelado = t.estado === 'CANCELADO';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-muted/30 transition ${
                        t.esPrimeraVez ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Hora */}
                      <td className="p-3.5 font-bold font-mono text-sm text-foreground">
                        {t.hora} hs
                        {t.horaCheckIn && (
                          <div className="text-[10px] text-muted-foreground font-normal">
                            Check-in: {t.horaCheckIn}
                          </div>
                        )}
                      </td>

                      {/* Paciente y Badge Primera Vez */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <span>{t.pacienteNombre}</span>
                          {t.esPrimeraVez && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-700 px-2 py-0.5 text-[10px] font-bold border border-amber-500/30">
                              <Sparkles className="h-2.5 w-2.5" /> 1ª Vez
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          DNI: {t.pacienteDni} • Tel: {t.pacienteTelefono}
                        </div>
                      </td>

                      {/* Cobertura & Copago */}
                      <td className="p-3.5">
                        <div className="font-medium text-foreground">{t.obraSocial || 'Particular'}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          {t.copagoMonto !== undefined ? (
                            <span className="text-emerald-600 font-semibold">
                              Copago: ${t.copagoMonto} {t.numeroBono && `(${t.numeroBono})`}
                            </span>
                          ) : (
                            <span className="text-amber-600">Copago pendiente</span>
                          )}
                        </div>
                      </td>

                      {/* Médico */}
                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{t.profesionalNombre}</div>
                        <div className="text-[11px] text-muted-foreground">{t.especialidadNombre}</div>
                      </td>

                      {/* Consultorio y Sede */}
                      <td className="p-3.5">
                        <div className="font-medium text-foreground">
                          Consultorio {t.consultorioNumero || 'S/N'} {t.planta && `(${t.planta})`}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {t.centroSaludNombre}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            esEnEspera
                              ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30 animate-pulse'
                              : esAtendiendo
                              ? 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
                              : esCompletado
                              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                              : esCancelado
                              ? 'bg-destructive/15 text-destructive border border-destructive/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {t.estado === 'EN_SALA_DE_ESPERA'
                            ? 'EN SALA DE ESPERA'
                            : t.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón rápido Check-In presencial (HU-53) */}
                          {!esEnEspera && !esAtendiendo && !esCompletado && !esCancelado && (
                            <button
                              onClick={() => handleCheckIn(t)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition"
                              title="Marcar llegada presencial y pasar a EN_SALA_DE_ESPERA"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Presente</span>
                            </button>
                          )}

                          {/* Modal de Copago / Cobertura (HU-54) */}
                          <button
                            onClick={() => setTurnoParaCopago(t)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground px-2 py-1.5 text-xs font-medium transition"
                            title="Verificar carnet y cobrar copago"
                          >
                            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Copago</span>
                          </button>

                          {/* Cancelar con justificativo (HU-54) */}
                          {!esCompletado && !esCancelado && (
                            <button
                              onClick={() => setTurnoParaCancelar(t)}
                              className="inline-flex items-center gap-1 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive px-2 py-1.5 text-xs font-medium transition"
                              title="Cancelar con justificativo"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales HU-54 */}
      <ModalAltaRapidaPaciente
        isOpen={isModalAltaOpen}
        onClose={() => setIsModalAltaOpen(false)}
        onPacienteCreado={(nuevo) => {
          setPacientes((prev) => [nuevo, ...prev]);
          mostrarAlerta(`Paciente ${nuevo.nombre} ${nuevo.apellido} (DNI ${nuevo.dni}) registrado con éxito.`);
        }}
      />

      <ModalVerificarCoberturaCopago
        turno={turnoParaCopago}
        isOpen={!!turnoParaCopago}
        onClose={() => setTurnoParaCopago(null)}
        onCopagoRegistrado={(actualizado) => {
          setTurnos((prev) => prev.map((t) => (t.id === actualizado.id ? actualizado : t)));
          mostrarAlerta(`Copago registrado para ${actualizado.pacienteNombre}.`);
        }}
      />

      <ModalTurnoMostrador
        isOpen={isModalTurnoMostradorOpen}
        onClose={() => setIsModalTurnoMostradorOpen(false)}
        pacientes={pacientes}
        centros={centros}
        profesionales={profesionales}
        onTurnoCreado={(nuevo) => {
          setTurnos((prev) => [nuevo, ...prev]);
          mostrarAlerta(`Turno de mostrador generado para ${nuevo.pacienteNombre} a las ${nuevo.hora} hs.`);
        }}
      />

      <ModalCancelarMostrador
        turno={turnoParaCancelar}
        isOpen={!!turnoParaCancelar}
        onClose={() => setTurnoParaCancelar(null)}
        onCancelado={(id, motivo) => {
          setTurnos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, estado: 'CANCELADO', justificativoCancelacion: motivo } : t))
          );
          mostrarAlerta(`Turno cancelado en mostrador. Motivo registrado.`);
        }}
      />
    </div>
  );
};
