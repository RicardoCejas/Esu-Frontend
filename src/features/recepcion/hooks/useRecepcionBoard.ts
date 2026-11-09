import { useState, useEffect, useMemo, useCallback } from 'react';
import { turnosService } from '@/api/turnosService';
import { profesionalesService } from '@/api/profesionalesService';
import { centrosService } from '@/api/centrosService';
import { pacientesService } from '@/api/pacientesService';
import { useDebounce } from '@/lib/useDebounce';
import { getFechaLocalHoy } from '@/lib/dateUtils';
import type { Turno, CentroSalud, Profesional, User } from '@/types';

export function useRecepcionBoard(centroId?: string | number) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros reactivos
  const [busqueda, setBusqueda] = useState('');
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const [filtroProfesional, setFiltroProfesional] = useState<string>('TODOS');
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>('TODOS');
  const [alerta, setAlerta] = useState<string | null>(null);

  const mostrarAlerta = useCallback((mensaje: string) => {
    setAlerta(mensaje);
    setTimeout(() => setAlerta(null), 4000);
  }, []);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeCentroId = centroId ? String(centroId) : undefined;
      const turnosPromise = activeCentroId
        ? turnosService.getTurnosHoyCentro(activeCentroId)
        : turnosService.getAll();

      const profsPromise = activeCentroId
        ? profesionalesService.getByCentro(activeCentroId).catch(() => profesionalesService.getAll())
        : profesionalesService.getAll();

      const [turnosData, centrosData, profsData, pacsData] = await Promise.all([
        turnosPromise.catch((err) => {
          console.error('Error al cargar turnos del centro:', err);
          return [] as Turno[];
        }),
        centrosService.getAll().catch(() => [] as CentroSalud[]),
        profsPromise.catch(() => [] as Profesional[]),
        pacientesService.getAll().catch(() => [] as User[]),
      ]);

      setTurnos(turnosData ?? []);
      setCentros(centrosData ?? []);
      setProfesionales(profsData ?? []);
      setPacientes(pacsData ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar datos de mostrador';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCheckIn = async (turno: Turno) => {
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
  };

  const consultoriosDisponibles = useMemo(() => {
    const set = new Set<string>();
    turnos.forEach((t) => {
      if (t.consultorioNumero) set.add(t.consultorioNumero);
    });
    return Array.from(set).sort();
  }, [turnos]);

  const hoyStr = getFechaLocalHoy();
  const turnosHoy = useMemo(() => {
    return turnos.filter((t) => !t.fecha || t.fecha === hoyStr);
  }, [turnos, hoyStr]);

  const turnosFiltrados = useMemo(() => {
    return turnosHoy.filter((t) => {
      const matchBusqueda =
        !debouncedBusqueda ||
        (t.pacienteDni ?? '').includes(debouncedBusqueda) ||
        (t.pacienteNombre ?? '').toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
        (t.codigoVerificacion ? t.codigoVerificacion.toLowerCase().includes(debouncedBusqueda.toLowerCase()) : false) ||
        t.id.includes(debouncedBusqueda);

      const matchProf = filtroProfesional === 'TODOS' || t.profesionalId === filtroProfesional;
      const matchConsultorio = filtroConsultorio === 'TODOS' || t.consultorioNumero === filtroConsultorio;

      return matchBusqueda && matchProf && matchConsultorio;
    });
  }, [turnosHoy, debouncedBusqueda, filtroProfesional, filtroConsultorio]);

  const kpis = useMemo(() => ({
    total: turnosHoy.length,
    enSalaDeEspera: turnosHoy.filter((t) => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA').length,
    enConsulta: turnosHoy.filter((t) => t.estado === 'ATENDIENDO').length,
    atendidosHoy: turnosHoy.filter((t) => t.estado === 'COMPLETADO').length,
  }), [turnosHoy]);

  return {
    turnos,
    setTurnos,
    centros,
    profesionales,
    pacientes,
    setPacientes,
    loading,
    error,
    busqueda,
    setBusqueda,
    filtroProfesional,
    setFiltroProfesional,
    filtroConsultorio,
    setFiltroConsultorio,
    consultoriosDisponibles,
    turnosFiltrados,
    kpis,
    alerta,
    mostrarAlerta,
    handleCheckIn,
    recargar: cargarDatos,
  };
}
