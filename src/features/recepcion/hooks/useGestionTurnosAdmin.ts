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
  turnoACancelar: Turno | null;
  setTurnoACancelar: (t: Turno | null) => void;
  cargarTurnos: () => Promise<void>;
  limpiarFiltros: () => void;
  handleTurnoCancelado: (id: string, motivo: string) => void;
  handleCheckIn: (t: Turno) => Promise<void>;
  handleMarcarAusente: (t: Turno) => Promise<void>;
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
        data = await turnosService.getTurnosCentro(centroSaludId, {
          desde: fechaDesde.trim() || undefined,
          hasta: fechaHasta.trim() || undefined,
          estado: filtroEstado !== 'TODOS' ? filtroEstado : undefined,
        });
      } else {
        data = await turnosService.getAll();
      }
      setTurnos(data);
    } catch (err: unknown) {
      setLoadError(extractApiErrorMessage(err, 'No se pudieron cargar los turnos del sistema.'));
    } finally {
      setIsLoading(false);
    }
  }, [esRecepcionista, centroSaludId, fechaDesde, fechaHasta, filtroEstado]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchInitial = async () => {
      try {
        let data: Turno[] = [];
        if (esRecepcionista && centroSaludId) {
          data = await turnosService.getTurnosCentro(centroSaludId, {
            desde: fechaDesde.trim() || undefined,
            hasta: fechaHasta.trim() || undefined,
            estado: filtroEstado !== 'TODOS' ? filtroEstado : undefined,
          });
        } else {
          data = await turnosService.getAll();
        }
        if (isSubscribed) {
          setTurnos(data);
          setLoadError(null);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          setLoadError(extractApiErrorMessage(err, 'No se pudieron cargar los turnos del sistema.'));
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    void fetchInitial();
    return () => {
      isSubscribed = false;
    };
  }, [esRecepcionista, centroSaludId, fechaDesde, fechaHasta, filtroEstado]);

  const handleCheckIn = async (turno: Turno) => {
    setIsProcessing(true);
    try {
      const updated = await turnosService.checkIn(turno.id);
      setTurnos((prev) =>
        prev.map((t) => (t.id === turno.id ? (updated ?? { ...t, estado: 'EN_ESPERA' }) : t))
      );
      success(`Paciente ${turno.pacienteNombre} ingresó a Sala de Espera.`);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo realizar el check-in del paciente.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarcarAusente = async (turno: Turno) => {
    setIsProcessing(true);
    try {
      const updated = await turnosService.marcarAusente(turno.id);
      setTurnos((prev) =>
        prev.map((t) => (t.id === turno.id ? (updated ?? { ...t, estado: 'AUSENTE' }) : t))
      );
      success(`Turno de ${turno.pacienteNombre} marcado como Ausente.`);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo marcar ausente el turno.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTurnoCancelado = (id: string, motivo: string) => {
    setTurnos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, estado: 'CANCELADO', justificativoCancelacion: motivo } : t
      )
    );
    setTurnoACancelar(null);
    success('Turno cancelado exitosamente.');
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
        (t.pacienteDni ?? '').includes(term) ||
        (t.profesionalNombre ?? '').toLowerCase().includes(term) ||
        (t.especialidadNombre ?? '').toLowerCase().includes(term) ||
        (t.centroSaludNombre ?? '').toLowerCase().includes(term) ||
        (t.codigoVerificacion ? t.codigoVerificacion.toLowerCase().includes(term) : false) ||
        (t.id ?? '').includes(term);

      const matchEstado =
        filtroEstado === 'TODOS' ||
        t.estado === filtroEstado ||
        (filtroEstado === 'EN_ESPERA' && (t.estado === 'EN_ESPERA' || t.estado === 'EN_SALA_DE_ESPERA')) ||
        (filtroEstado === 'CANCELADO' &&
          (t.estado === 'CANCELADO' || t.estado === 'CANCELADO_POR_MEDICO'));

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
    turnoACancelar,
    setTurnoACancelar,
    cargarTurnos,
    limpiarFiltros,
    handleTurnoCancelado,
    handleCheckIn,
    handleMarcarAusente,
    esRecepcionista,
    centroSaludNombre,
  };
}
