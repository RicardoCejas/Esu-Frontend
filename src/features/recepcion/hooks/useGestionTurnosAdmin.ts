import { useState, useEffect, useCallback, useMemo } from 'react';
import { turnosService } from '@/api/turnosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Turno } from '@/types';

export interface UseGestionTurnosAdminReturn {
  turnos: Turno[];
  turnosFiltrados: Turno[];
  isLoading: boolean;
  loadError: string | null;
  isProcessing: boolean;
  busqueda: string;
  setBusqueda: (val: string) => void;
  filtroEstado: string;
  setFiltroEstado: (val: string) => void;
  fechaDesde: string;
  setFechaDesde: (val: string) => void;
  fechaHasta: string;
  setFechaHasta: (val: string) => void;
  turnoAReagendar: Turno | null;
  setTurnoAReagendar: (t: Turno | null) => void;
  nuevaFecha: string;
  setNuevaFecha: (val: string) => void;
  nuevaHora: string;
  setNuevaHora: (val: string) => void;
  turnoACancelar: Turno | null;
  setTurnoACancelar: (t: Turno | null) => void;
  cargarTurnos: () => Promise<void>;
  limpiarFiltros: () => void;
  handleConfirmarCancelacion: () => Promise<void>;
  handleConfirmarReagendamiento: (e: React.FormEvent) => Promise<void>;
  esRecepcionista: boolean;
  centroSaludNombre?: string;
}

export function useGestionTurnosAdmin(): UseGestionTurnosAdminReturn {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Modals state
  const [turnoAReagendar, setTurnoAReagendar] = useState<Turno | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);

  const esRecepcionista = user?.rol === 'RECEPCIONISTA';
  const centroSaludId = user?.centroSaludId;
  const centroSaludNombre = user?.centroSaludNombre;

  const cargarTurnos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      let data: Turno[] = [];
      if (esRecepcionista && centroSaludId) {
        data = await turnosService.getTurnosHoyCentro(centroSaludId);
      } else {
        data = await turnosService.getAll();
      }
      setTurnos(data);
    } catch (err: unknown) {
      setLoadError(
        extractApiErrorMessage(err, 'No se pudieron cargar los turnos del sistema.')
      );
    } finally {
      setIsLoading(false);
    }
  }, [esRecepcionista, centroSaludId]);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  const handleConfirmarCancelacion = async () => {
    if (!turnoACancelar) return;
    setIsProcessing(true);
    try {
      await turnosService.cancelarTurno(turnoACancelar.id);
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === turnoACancelar.id ? { ...t, estado: 'CANCELADO' } : t
        )
      );
      success('Turno cancelado exitosamente.');
      setTurnoACancelar(null);
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo cancelar el turno.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmarReagendamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnoAReagendar || !nuevaFecha || !nuevaHora) return;

    setIsProcessing(true);
    try {
      const nuevaFechaHoraIso = `${nuevaFecha}T${nuevaHora}:00`;
      await turnosService.reprogramarTurno(turnoAReagendar.id, nuevaFechaHoraIso);
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === turnoAReagendar.id
            ? { ...t, fecha: nuevaFecha, hora: nuevaHora, estado: 'CONFIRMADO' }
            : t
        )
      );
      success('Turno reprogramado exitosamente.');
      setTurnoAReagendar(null);
      setNuevaFecha('');
      setNuevaHora('');
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo reprogramar el turno.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('TODOS');
    setFechaDesde('');
    setFechaHasta('');
  };

  const turnosFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    return turnos.filter((t) => {
      // Institutional isolation check for receptionists
      if (
        esRecepcionista &&
        centroSaludId &&
        t.centroSaludId &&
        String(t.centroSaludId) !== String(centroSaludId)
      ) {
        return false;
      }

      const matchTexto =
        !term ||
        (t.pacienteNombre ?? '').toLowerCase().includes(term) ||
        (t.profesionalNombre ?? '').toLowerCase().includes(term) ||
        (t.centroSaludNombre ?? '').toLowerCase().includes(term) ||
        (t.codigoVerificacion ? t.codigoVerificacion.toLowerCase().includes(term) : false) ||
        (t.id ?? '').includes(term);

      const matchEstado = filtroEstado === 'TODOS' || t.estado === filtroEstado;
      const matchFechaDesde = !fechaDesde || (t.fecha ?? '') >= fechaDesde;
      const matchFechaHasta = !fechaHasta || (t.fecha ?? '') <= fechaHasta;

      return matchTexto && matchEstado && matchFechaDesde && matchFechaHasta;
    });
  }, [turnos, busqueda, filtroEstado, fechaDesde, fechaHasta, esRecepcionista, centroSaludId]);

  return {
    turnos,
    turnosFiltrados,
    isLoading,
    loadError,
    isProcessing,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    turnoAReagendar,
    setTurnoAReagendar,
    nuevaFecha,
    setNuevaFecha,
    nuevaHora,
    setNuevaHora,
    turnoACancelar,
    setTurnoACancelar,
    cargarTurnos,
    limpiarFiltros,
    handleConfirmarCancelacion,
    handleConfirmarReagendamiento,
    esRecepcionista,
    centroSaludNombre,
  };
}
