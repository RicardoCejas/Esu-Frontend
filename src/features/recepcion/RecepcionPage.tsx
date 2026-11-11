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
  Layers,
  MonitorPlay,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  X
} from 'lucide-react';
import { ModalAltaRapidaPaciente } from './components/ModalAltaRapidaPaciente';
import { ModalVerificarCoberturaCopago } from './components/ModalVerificarCoberturaCopago';
import { getFechaLocalHoy } from '@/lib/dateUtils';
import { ModalTurnoMostrador } from './components/ModalTurnoMostrador';
import { ModalCancelarMostrador } from './components/ModalCancelarMostrador';

export const RecepcionPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Búsquedas individuales reactivas por campo
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [busquedaCentro, setBusquedaCentro] = useState('');
  const [busquedaProfesional, setBusquedaProfesional] = useState('');
  const [busquedaConsultorio, setBusquedaConsultorio] = useState('');

  const debouncedPaciente = useDebounce(busquedaPaciente, 250);
  const debouncedCentro = useDebounce(busquedaCentro, 250);
  const debouncedProfesional = useDebounce(busquedaProfesional, 250);
  const debouncedConsultorio = useDebounce(busquedaConsultorio, 250);

  // Modales HU-54
  const [isModalAltaOpen, setIsModalAltaOpen] = useState(false);
  const [isModalTurnoMostradorOpen, setIsModalTurnoMostradorOpen] = useState(false);
  const [turnoParaCopago, setTurnoParaCopago] = useState<Turno | null>(null);
  const [turnoParaCancelar, setTurnoParaCancelar] = useState<Turno | null>(null);

  // Mensaje temporal toast / alerta
  const [alerta, setAlerta] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      turnosService.getAll().catch(() => []),
      centrosService.getAll().catch(() => []),
      profesionalesService.getAll().catch(() => []),
      pacientesService.getAll().catch(() => []),
    ])
      .then(([turnosData, centrosData, profsData, pacsData]) => {
        setTurnos(turnosData || []);
        setCentros(centrosData || []);
        setProfesionales(profsData || []);
        setPacientes(pacsData || []);
      })
      .catch((err) => {
        console.error('Error al cargar datos de recepción:', err);
      })
      .finally(() => {
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
  const hoyStr = getFechaLocalHoy();
  const turnosHoy = useMemo(() => {
    return turnos.filter((t) => t.fecha === hoyStr);
  }, [turnos, hoyStr]);

  const turnosFiltrados = useMemo(() => {
    const qPac = debouncedPaciente.toLowerCase().trim();
    const qCentro = debouncedCentro.toLowerCase().trim();
    const qProf = debouncedProfesional.toLowerCase().trim();
    const qCons = debouncedConsultorio.toLowerCase().trim();

    return turnosHoy.filter((t) => {
      const matchPaciente =
        !qPac ||
        (t.pacienteDni && t.pacienteDni.toLowerCase().includes(qPac)) ||
        (t.pacienteNombre && t.pacienteNombre.toLowerCase().includes(qPac)) ||
        (t.codigoVerificacion && t.codigoVerificacion.toLowerCase().includes(qPac)) ||
        (t.id && t.id.toLowerCase().includes(qPac));

      const matchCentro =
        !qCentro ||
        qCentro === 'todas las sedes' ||
        (t.centroSaludNombre && t.centroSaludNombre.toLowerCase().includes(qCentro)) ||
        (t.centroSaludId && t.centroSaludId.toLowerCase().includes(qCentro));

      const matchProf =
        !qProf ||
        qProf === 'todos los médicos' ||
        (t.profesionalNombre && t.profesionalNombre.toLowerCase().includes(qProf)) ||
        (t.especialidadNombre && t.especialidadNombre.toLowerCase().includes(qProf)) ||
        (t.profesionalId && t.profesionalId.toLowerCase().includes(qProf));

      const matchConsultorio =
        !qCons ||
        qCons === 'todos los consultorios' ||
        (t.consultorioNumero && t.consultorioNumero.toLowerCase().includes(qCons)) ||
        (t.consultorioNumero && ('consultorio ' + t.consultorioNumero).toLowerCase().includes(qCons));

      return matchPaciente && matchCentro && matchProf && matchConsultorio;
    });
  }, [turnosHoy, debouncedPaciente, debouncedCentro, debouncedProfesional, debouncedConsultorio]);

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
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 px-3 py-2 text-xs font-semibold text-white transition"
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

        <div className="rounded-2xl border border-border bg-muted/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">En Sala de Espera</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{enSalaDeEspera.length}</div>
          <p className="text-[11px] text-muted-foreground">Acreditados listos para llamado</p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">En Consultorio</span>
            <Activity className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{enConsulta.length}</div>
          <p className="text-[11px] text-muted-foreground">Atención médica en curso</p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Atendidos / Salida</span>
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{atendidosHoy.length}</div>
          <p className="text-[11px] text-muted-foreground">Consultas completadas hoy</p>
        </div>
      </div>

      {/* Barra de Búsquedas Individuales por Campo (Sedes, Médicos, Consultorios y Pacientes) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Búsquedas de Sala
            </span>
            {(busquedaPaciente || busquedaCentro || busquedaProfesional || busquedaConsultorio) && (
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold">
                Filtros activos
              </span>
            )}
          </div>
          {(busquedaPaciente || busquedaCentro || busquedaProfesional || busquedaConsultorio) && (
            <button
              type="button"
              onClick={() => {
                setBusquedaPaciente('');
                setBusquedaCentro('');
                setBusquedaProfesional('');
                setBusquedaConsultorio('');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpiar todas las búsquedas</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Búsqueda 1: Paciente / DNI */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar Paciente o DNI..."
              value={busquedaPaciente}
              onChange={(e) => setBusquedaPaciente(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-2xs"
            />
            {busquedaPaciente && (
              <button
                type="button"
                onClick={() => setBusquedaPaciente('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Limpiar búsqueda de paciente"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Búsqueda 2: Sede / Centro de Salud */}
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              list="lista-sedes-rec"
              placeholder="Buscar Sede..."
              value={busquedaCentro}
              onChange={(e) => setBusquedaCentro(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            />
            <datalist id="lista-sedes-rec">
              <option value="Todas las Sedes" />
              {centros.map((c) => (
                <option key={c.id} value={c.nombre} />
              ))}
            </datalist>
            {busquedaCentro && (
              <button
                type="button"
                onClick={() => setBusquedaCentro('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Limpiar búsqueda de sede"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Búsqueda 3: Médico o Especialidad */}
          <div className="relative">
            <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              list="lista-medicos-rec"
              placeholder="Buscar Médico / Especialidad..."
              value={busquedaProfesional}
              onChange={(e) => setBusquedaProfesional(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            />
            <datalist id="lista-medicos-rec">
              <option value="Todos los Médicos" />
              {profesionales.map((p) => (
                <option
                  key={p.id}
                  value={p.nombre + ' ' + p.apellido + ' (' + (p.especialidadNombre ? p.especialidadNombre.split('/')[0] : '') + ')'}
                />
              ))}
            </datalist>
            {busquedaProfesional && (
              <button
                type="button"
                onClick={() => setBusquedaProfesional('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Limpiar búsqueda de médico"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Búsqueda 4: Consultorio */}
          <div className="relative">
            <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              list="lista-consultorios-rec"
              placeholder="Buscar Consultorio..."
              value={busquedaConsultorio}
              onChange={(e) => setBusquedaConsultorio(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            />
            <datalist id="lista-consultorios-rec">
              <option value="Todos los Consultorios" />
              {consultoriosDisponibles.map((c) => (
                <option key={c} value={'Consultorio ' + c} />
              ))}
            </datalist>
            {busquedaConsultorio && (
              <button
                type="button"
                onClick={() => setBusquedaConsultorio('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Limpiar búsqueda de consultorio"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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
                      className="hover:bg-muted/30 transition"
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
                            <span className="inline-flex items-center rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              1ª Vez
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
                              ? 'bg-amber-600 text-white'
                              : esAtendiendo
                              ? 'bg-sky-700 text-white'
                              : esCompletado
                              ? 'bg-emerald-700 text-white'
                              : esCancelado
                              ? 'bg-destructive text-white'
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
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition"
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
