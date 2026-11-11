import { useState, useEffect, useMemo, useCallback } from 'react';
import { turnosService } from '@/api/turnosService';
import { centrosService } from '@/api/centrosService';
import { audioSpeechService } from '@/lib/audioSpeechService';
import { buildFloorOptions } from '@/lib/centroUtils';
import type { Turno, CentroSalud } from '@/types';

export function useSalasEsperaKanban(centroId?: string | number) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [filtroPlanta, setFiltroPlanta] = useState<string>('TODOS');
  const [loading, setLoading] = useState(true);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState<string>('102');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const activeCentroId = centroId ? String(centroId) : undefined;
      const turnosPromise = activeCentroId
        ? turnosService.getTurnosKanbanCentro(activeCentroId)
        : turnosService.getAll();

      const [turnosData, centrosData] = await Promise.all([
        turnosPromise.catch(() => [] as Turno[]),
        centrosService.getAll().catch(() => [] as CentroSalud[]),
      ]);

      setTurnos(turnosData ?? []);
      setCentros(centrosData ?? []);
    } catch (err: unknown) {
      console.error('Error al cargar datos del tablero Kanban:', err);
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      const matchPlanta =
        filtroPlanta === 'TODOS' ||
        filtroPlanta === 'TODAS' ||
        (t.planta ?? '').toLowerCase() === filtroPlanta.toLowerCase();
      return matchPlanta;
    });
  }, [turnos, filtroPlanta]);

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

  const sobreturnosHoy = useMemo(() => {
    return turnosFiltrados.filter((t) => t.esSobreturno && t.estado !== 'CANCELADO');
  }, [turnosFiltrados]);

  const handleMoverAEnEspera = async (turno: Turno) => {
    try {
      const updated = await turnosService.checkIn(turno.id);
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
      }
    } catch (err: unknown) {
      console.error('Error al mover a espera:', err);
    }
  };

  const handleLlamarAConsultorio = async (turno: Turno) => {
    try {
      audioSpeechService.anunciarLlamado(
        turno.pacienteNombre,
        turno.consultorioNumero || consultorioSeleccionado
      );
      const updated = await turnosService.llamarPaciente(
        turno.id,
        turno.consultorioNumero || consultorioSeleccionado
      );
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
      }
    } catch (err: unknown) {
      console.error('Error al llamar a consultorio:', err);
    }
  };

  const handleFinalizar = async (turno: Turno) => {
    try {
      const updated = await turnosService.updateEstado(turno.id, 'COMPLETADO');
      if (updated) {
        setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
      }
    } catch (err: unknown) {
      console.error('Error al finalizar turno:', err);
    }
  };

  const handleSobreturnoCreado = (nuevo: Turno) => {
    setTurnos((prev) => [nuevo, ...prev]);
  };

  const activeCentro = useMemo(
    () => (centroId ? centros.find((c) => String(c.id) === String(centroId)) : centros[0]),
    [centroId, centros]
  );

  const floorOptions = useMemo(
    () => buildFloorOptions(activeCentro?.cantidadPlantas),
    [activeCentro?.cantidadPlantas]
  );

  return {
    turnos,
    centros,
    floorOptions,
    filtroPlanta,
    setFiltroPlanta,
    loading,
    consultorioSeleccionado,
    setConsultorioSeleccionado,
    porLlegar,
    enEspera,
    enConsulta,
    atendidos,
    countSobreturnos: sobreturnosHoy.length,
    handleMoverAEnEspera,
    handleLlamarAConsultorio,
    handleFinalizar,
    handleSobreturnoCreado,
    recargar: cargarDatos,
  };
}
