import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { turnosService } from '@/api/turnosService';
import { profesionalesService } from '@/api/profesionalesService';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { getFechaLocalHoy } from '@/lib/dateUtils';
import type { Turno, Profesional } from '@/types';

export function useRecepcionBoard(centroId?: string | number) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Reactive filters
  const [busqueda, setBusqueda] = useState('');
  const [filtroProfesional, setFiltroProfesional] = useState<string>('TODOS');
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>('TODOS');
  const [verTodosLosDias, setVerTodosLosDias] = useState(false);
  const [alerta, setAlerta] = useState<string | null>(null);

  const alertaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarAlerta = useCallback((mensaje: string) => {
    if (alertaTimeoutRef.current) clearTimeout(alertaTimeoutRef.current);
    setAlerta(mensaje);
    alertaTimeoutRef.current = setTimeout(() => {
      setAlerta(null);
      alertaTimeoutRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (alertaTimeoutRef.current) clearTimeout(alertaTimeoutRef.current);
    };
  }, []);

  const recargar = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    const fetchBoardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const activeCentroId = centroId ? String(centroId) : undefined;
        const turnosPromise = activeCentroId
          ? verTodosLosDias
            ? turnosService.getTurnosCentro(activeCentroId)
            : turnosService.getTurnosHoyCentro(activeCentroId)
          : turnosService.getAll();

        const profsPromise = activeCentroId
          ? profesionalesService.getByCentro(activeCentroId).catch(() => profesionalesService.getAll())
          : profesionalesService.getAll();

        const consultoriosPromise = activeCentroId
          ? centrosService.getConsultorios(activeCentroId).catch(() => [] as ConsultorioItem[])
          : Promise.resolve([] as ConsultorioItem[]);

        const [turnosData, profsData, consData] = await Promise.all([
          turnosPromise.catch((err) => {
            console.error('Error al cargar turnos del centro:', err);
            return [] as Turno[];
          }),
          profsPromise.catch(() => [] as Profesional[]),
          consultoriosPromise,
        ]);

        if (!isSubscribed) return;
        setTurnos(turnosData ?? []);
        setProfesionales(profsData ?? []);
        setConsultorios(consData ?? []);
      } catch (err: unknown) {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : 'Error al sincronizar datos de mostrador';
        setError(msg);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    void fetchBoardData();

    return () => {
      isSubscribed = false;
    };
  }, [centroId, verTodosLosDias, reloadTrigger]);

  const handleCheckIn = useCallback(async (turno: Turno) => {
    try {
      const updated = await turnosService.checkIn(turno.id);
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
        mostrarAlerta(`Check-In exitoso: ${turno.pacienteNombre} ingresó a Sala de Espera.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo realizar el check-in';
      mostrarAlerta(msg);
    }
  }, [mostrarAlerta]);

  const handleMarcarAusente = useCallback(async (turno: Turno) => {
    try {
      const updated = await turnosService.marcarAusente(turno.id);
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
        mostrarAlerta(`Turno marcado como Ausente para ${turno.pacienteNombre}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo marcar como ausente';
      mostrarAlerta(msg);
    }
  }, [mostrarAlerta]);

  const handleLlamarPaciente = useCallback(async (turno: Turno) => {
    try {
      const consultorio = turno.consultorioNumero || '1';
      const updated = await turnosService.llamarPaciente(turno.id, consultorio);
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
        mostrarAlerta(`Llamando a ${turno.pacienteNombre} a Consultorio ${consultorio}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo llamar al paciente';
      mostrarAlerta(msg);
    }
  }, [mostrarAlerta]);

  const consultoriosDisponibles = useMemo(() => {
    const set = new Set<string>();
    consultorios.forEach((c) => {
      if (c.numero) set.add(c.numero);
    });
    turnos.forEach((t) => {
      if (t.consultorioNumero) set.add(t.consultorioNumero);
    });
    return Array.from(set).sort();
  }, [consultorios, turnos]);

  const hoyStr = getFechaLocalHoy();
  const turnosHoy = useMemo(() => {
    return turnos.filter((t) => !t.fecha || t.fecha === hoyStr);
  }, [turnos, hoyStr]);

  const mostrandoTodosLosDias = verTodosLosDias || (turnosHoy.length === 0 && turnos.length > 0);

  const turnosBase = useMemo(() => {
    return mostrandoTodosLosDias ? turnos : turnosHoy;
  }, [mostrandoTodosLosDias, turnos, turnosHoy]);

  const turnosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return turnosBase.filter((t) => {
      const matchBusqueda =
        !q ||
        (t.pacienteDni ?? '').toLowerCase().includes(q) ||
        (t.pacienteNombre ?? '').toLowerCase().includes(q) ||
        (t.codigoVerificacion ?? '').toLowerCase().includes(q) ||
        (t.centroSaludNombre ?? '').toLowerCase().includes(q) ||
        (t.profesionalNombre ?? '').toLowerCase().includes(q) ||
        (t.especialidadNombre ?? '').toLowerCase().includes(q) ||
        (t.consultorioNumero ?? '').toLowerCase().includes(q) ||
        (t.consultorioNumero ? `consultorio ${t.consultorioNumero}`.toLowerCase().includes(q) : false) ||
        (t.id ?? '').toLowerCase().includes(q);

      const matchProf = filtroProfesional === 'TODOS' || t.profesionalId === filtroProfesional;
      const matchConsultorio = filtroConsultorio === 'TODOS' || t.consultorioNumero === filtroConsultorio;

      return matchBusqueda && matchProf && matchConsultorio;
    });
  }, [turnosBase, busqueda, filtroProfesional, filtroConsultorio]);

  const limpiarFiltros = useCallback(() => {
    setBusqueda('');
    setFiltroProfesional('TODOS');
    setFiltroConsultorio('TODOS');
  }, []);

  const kpis = useMemo(() => ({
    total: turnosHoy.length,
    enSalaDeEspera: turnosHoy.filter((t) => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA').length,
    enConsulta: turnosHoy.filter((t) => t.estado === 'ATENDIENDO').length,
    atendidosHoy: turnosHoy.filter((t) => t.estado === 'COMPLETADO').length,
  }), [turnosHoy]);

  return {
    turnos,
    setTurnos,
    profesionales,
    consultorios,
    loading,
    error,
    busqueda,
    setBusqueda,
    filtroProfesional,
    setFiltroProfesional,
    filtroConsultorio,
    setFiltroConsultorio,
    verTodosLosDias,
    setVerTodosLosDias,
    mostrandoTodosLosDias,
    turnosHoyCount: turnosHoy.length,
    totalTurnosCount: turnos.length,
    consultoriosDisponibles,
    turnosFiltrados,
    limpiarFiltros,
    kpis,
    alerta,
    mostrarAlerta,
    handleCheckIn,
    handleMarcarAusente,
    handleLlamarPaciente,
    recargar,
  };
}
