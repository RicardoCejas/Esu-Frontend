import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { profesionalesService } from '@/api/profesionalesService';
import { turnosService } from '@/api/turnosService';
import type { BloqueoAgenda, DisponibilidadProfesional, Turno } from '@/types';

function extractSlotHHmm(raw: string): string {
  const clean = String(raw ?? '').trim();
  if (clean.includes('T')) {
    return clean.split('T')[1]?.slice(0, 5) ?? clean.slice(0, 5);
  }
  return clean.slice(0, 5);
}

/**
 * Coordinates loading appointment metadata, real doctor availability and blockers,
 * and submitting appointment rescheduling without static fake slots.
 */
export function useReagendarTurno(turnoId?: string) {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const hoy = new Date().toLocaleDateString('en-CA');

  const [turno, setTurno] = useState<Turno | null>(null);
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadProfesional[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoAgenda[]>([]);

  const [nuevaFecha, setNuevaFecha] = useState(hoy);
  const [nuevaHora, setNuevaHora] = useState('');
  const [horaManual, setHoraManual] = useState('');
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadTurno = useCallback(async () => {
    if (!turnoId) {
      setLoading(false);
      setLoadError('Identificador de turno inválido.');
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const data = await turnosService.getById(turnoId);
      if (!data) {
        setTurno(null);
        setLoadError('No se encontró el turno solicitado.');
        return;
      }

      setTurno(data);
      setNuevaFecha(data.fecha || hoy);

      const [dispList, blockList] = await Promise.all([
        profesionalesService.getDisponibilidad(data.profesionalId).catch(() => [] as DisponibilidadProfesional[]),
        profesionalesService.getBloqueos(data.profesionalId).catch(() => [] as BloqueoAgenda[]),
      ]);
      setDisponibilidades(dispList);
      setBloqueos(blockList);
    } catch (err) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar el turno a reagendar.'));
    } finally {
      setLoading(false);
    }
  }, [turnoId, hoy]);

  useEffect(() => {
    void loadTurno();
  }, [loadTurno]);

  useEffect(() => {
    if (!turno?.profesionalId || !nuevaFecha) {
      setSlotsDisponibles([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    turnosService
      .getDisponibles(turno.profesionalId, nuevaFecha)
      .then((raw) => {
        if (cancelled) return;
        const normalized = Array.from(new Set(raw.map(extractSlotHHmm).filter(Boolean)));
        setSlotsDisponibles(normalized);
        setNuevaHora((prev) => (normalized.includes(prev) ? prev : normalized[0] ?? ''));
      })
      .catch(() => {
        if (cancelled) return;
        setSlotsDisponibles([]);
        setNuevaHora('');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [turno?.profesionalId, nuevaFecha]);

  const handleConfirm = async (): Promise<boolean> => {
    if (!turno) return false;
    const chosenHora = (nuevaHora || horaManual).trim();
    if (!nuevaFecha) {
      setSubmitError('Seleccioná una nueva fecha para la reprogramación.');
      return false;
    }
    if (!/^\d{2}:\d{2}$/.test(chosenHora)) {
      setSubmitError('Seleccioná un horario disponible o ingresá una hora válida (HH:mm).');
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const nuevaFechaHoraIso = `${nuevaFecha}T${chosenHora}:00`;
      await turnosService.reprogramarTurno(turno.id, nuevaFechaHoraIso);
      success(`Turno de ${turno.pacienteNombre} reagendado para el ${nuevaFecha} a las ${chosenHora} hs.`);
      navigate('/dashboard/recepcion/turnos');
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo reagendar el turno.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    hoy,
    turno,
    disponibilidades,
    bloqueos,
    nuevaFecha,
    setNuevaFecha,
    nuevaHora,
    setNuevaHora,
    horaManual,
    setHoraManual,
    slotsDisponibles,
    loadingSlots,
    loading,
    saving,
    loadError,
    submitError,
    loadTurno,
    handleConfirm,
  };
}
