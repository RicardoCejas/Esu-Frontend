import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { turnosService } from '@/api/turnosService';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { audioSpeechService } from '@/lib/audioSpeechService';
import { buildFloorOptions } from '@/lib/centroUtils';
import type { Turno, CentroSalud, Profesional } from '@/types';

export function useSalasEsperaKanban(centroId?: string | number) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centro, setCentro] = useState<CentroSalud | null>(null);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroPlanta, setFiltroPlanta] = useState<string>('TODOS');
  const [filtroProfesional, setFiltroProfesional] = useState<string>('TODOS');
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>('TODOS');
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState<string>('');
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
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const activeCentroId = String(centroId || "1");
        const [turnosData, centroData, consData, profsData] = await Promise.all([
          activeCentroId
            ? turnosService.getTurnosKanbanCentro(activeCentroId).catch(() => [] as Turno[])
            : turnosService.getAll().catch(() => [] as Turno[]),
          activeCentroId
            ? centrosService.getById(activeCentroId).catch(() => undefined)
            : Promise.resolve(undefined),
          activeCentroId
            ? centrosService.getConsultorios(activeCentroId).catch(() => [] as ConsultorioItem[])
            : Promise.resolve([] as ConsultorioItem[]),
          activeCentroId
            ? profesionalesService.getByCentro(activeCentroId).catch(() => [] as Profesional[])
            : profesionalesService.getAll().catch(() => [] as Profesional[]),
        ]);

        if (!isSubscribed) return;
        setTurnos(turnosData ?? []);
        setCentro(centroData ?? null);
        setConsultorios(consData ?? []);
        setProfesionales(profsData ?? []);

        if (consData && consData.length > 0) {
          setConsultorioSeleccionado((prev) => prev || consData[0]?.numero || '');
        }
      } catch (err: unknown) {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : 'Error al sincronizar tablero Kanban';
        setError(msg);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    void cargarDatos();

    return () => {
      isSubscribed = false;
    };
  }, [centroId, reloadTrigger]);

  const floorOptions = useMemo(() => {
    const fromConfig = buildFloorOptions(centro?.cantidadPlantas);
    const set = new Set<string>(fromConfig);
    consultorios.forEach((c) => {
      if (c.planta) set.add(c.planta);
    });
    return Array.from(set);
  }, [centro?.cantidadPlantas, consultorios]);

  const turnosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return turnos.filter((t) => {
      const matchPlanta =
        filtroPlanta === 'TODOS' ||
        filtroPlanta === 'TODAS' ||
        (t.planta ?? '').toLowerCase() === filtroPlanta.toLowerCase();

      const matchProf = filtroProfesional === 'TODOS' || String(t.profesionalId) === filtroProfesional;
      const matchCons = filtroConsultorio === 'TODOS' || t.consultorioNumero === filtroConsultorio;

      const matchBusqueda =
        !q ||
        (t.pacienteNombre ?? '').toLowerCase().includes(q) ||
        (t.pacienteDni ?? '').toLowerCase().includes(q) ||
        (t.profesionalNombre ?? '').toLowerCase().includes(q) ||
        (t.consultorioNumero ?? '').toLowerCase().includes(q);

      return matchPlanta && matchProf && matchCons && matchBusqueda;
    });
  }, [turnos, filtroPlanta, filtroProfesional, filtroConsultorio, busqueda]);

  const porLlegar = useMemo(() => {
    return turnosFiltrados.filter((t) => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO');
  }, [turnosFiltrados]);

  const enEspera = useMemo(() => {
    return turnosFiltrados.filter((t) => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA');
  }, [turnosFiltrados]);

  const enConsulta = useMemo(() => {
    return turnosFiltrados.filter((t) => t.estado === 'ATENDIENDO');
  }, [turnosFiltrados]);

  const atendidos = useMemo(() => {
    return turnosFiltrados.filter((t) => t.estado === 'COMPLETADO');
  }, [turnosFiltrados]);

  const countSobreturnos = useMemo(() => {
    return turnos.filter((t) => {
      if (!t.esSobreturno || t.estado === 'CANCELADO' || t.estado === 'CANCELADO_POR_MEDICO') return false;
      if (filtroProfesional !== 'TODOS') return String(t.profesionalId) === filtroProfesional;
      return true;
    }).length;
  }, [turnos, filtroProfesional]);

  const handleMoverAEnEspera = useCallback(async (turno: Turno) => {
    try {
      const updated = await turnosService.checkIn(turno.id);
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
        mostrarAlerta(`Check-in de ${turno.pacienteNombre} completado.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar ingreso';
      mostrarAlerta(msg);
    }
  }, [mostrarAlerta]);

  const handleLlamarAConsultorio = useCallback(async (turno: Turno, destino?: string) => {
    try {
      const destinoFinal = destino || turno.consultorioNumero || consultorioSeleccionado || '1';
      audioSpeechService.anunciarLlamado(turno.pacienteNombre, destinoFinal);
      const updated = await turnosService.llamarPaciente(turno.id, destinoFinal);
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
        mostrarAlerta(`Llamando a ${turno.pacienteNombre} a Consultorio ${destinoFinal}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al llamar a consultorio';
      mostrarAlerta(msg);
    }
  }, [consultorioSeleccionado, mostrarAlerta]);

  const handleFinalizar = useCallback(async (turno: Turno) => {
    try {
      const updated = await turnosService.finalizarAtencion(turno.id);
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
        mostrarAlerta(`Atención finalizada para ${turno.pacienteNombre}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al finalizar atención';
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
      const msg = err instanceof Error ? err.message : 'No se pudo marcar ausente';
      mostrarAlerta(msg);
    }
  }, [mostrarAlerta]);

  return {
    turnos,
    setTurnos,
    centro,
    consultorios,
    profesionales,
    floorOptions,
    filtroPlanta,
    setFiltroPlanta,
    filtroProfesional,
    setFiltroProfesional,
    filtroConsultorio,
    setFiltroConsultorio,
    consultorioSeleccionado,
    setConsultorioSeleccionado,
    busqueda,
    setBusqueda,
    loading,
    error,
    alerta,
    porLlegar,
    enEspera,
    enConsulta,
    atendidos,
    countSobreturnos,
    handleMoverAEnEspera,
    handleLlamarAConsultorio,
    handleFinalizar,
    handleMarcarAusente,
    recargar,
  };
}
