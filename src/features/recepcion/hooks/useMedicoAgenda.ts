import { useState, useEffect, useCallback } from 'react';
import { profesionalesService } from '@/api/profesionalesService';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import type { DisponibilidadRequest, BloqueoRequest } from '@/types';

export function useMedicoAgenda(
  medicoId: string | undefined,
  activeCentroId: string | undefined,
  onReload: () => Promise<void>
) {
  const { success, error: toastError } = useToast();

  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [isModalDispOpen, setIsModalDispOpen] = useState(false);
  const [isModalBloqueoOpen, setIsModalBloqueoOpen] = useState(false);
  const [dispToDelete, setDispToDelete] = useState<string | null>(null);
  const [bloqueoToDelete, setBloqueoToDelete] = useState<string | null>(null);

  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);
  const [isDeletingDisp, setIsDeletingDisp] = useState(false);
  const [isDeletingBloqueo, setIsDeletingBloqueo] = useState(false);

  useEffect(() => {
    if (!activeCentroId) return;
    centrosService.getConsultorios(activeCentroId)
      .then((data) => setConsultorios(data || []))
      .catch(() => setConsultorios([]));
  }, [activeCentroId]);

  const handleCrearDisponibilidad = useCallback(async (data: DisponibilidadRequest): Promise<boolean> => {
    if (!medicoId) return false;
    try {
      await profesionalesService.guardarDisponibilidad(data);
      success('Franja de atención configurada exitosamente.');
      await onReload();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo configurar la franja horaria.'));
      return false;
    }
  }, [medicoId, success, toastError, onReload]);

  const handleEliminarDisponibilidad = useCallback(async (dispId: string): Promise<boolean> => {
    setIsDeletingDisp(true);
    try {
      await profesionalesService.eliminarDisponibilidad(dispId);
      success('Franja horaria eliminada.');
      setDispToDelete(null);
      await onReload();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo eliminar la franja horaria.'));
      return false;
    } finally {
      setIsDeletingDisp(false);
    }
  }, [success, toastError, onReload]);

  const handleGenerarSlots = useCallback(async () => {
    if (!medicoId) return;
    setIsGeneratingSlots(true);
    try {
      const cantidad = await profesionalesService.generarSlots(medicoId);
      success(`Se generaron ${cantidad} cupos de turnos para los próximos 30 días.`);
      await onReload();
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudieron regenerar los slots de turnos.'));
    } finally {
      setIsGeneratingSlots(false);
    }
  }, [medicoId, success, toastError, onReload]);

  const handleCrearBloqueo = useCallback(async (data: BloqueoRequest): Promise<boolean> => {
    if (!medicoId) return false;
    try {
      await profesionalesService.bloquearAgenda(medicoId, {
        ...data,
        centroSaludId: activeCentroId,
      });
      success('Bloqueo de agenda registrado y turnos cancelados preventivamente.');
      await onReload();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo registrar el bloqueo de agenda.'));
      return false;
    }
  }, [medicoId, activeCentroId, success, toastError, onReload]);

  const handleEliminarBloqueo = useCallback(async (bloqueoId: string): Promise<boolean> => {
    setIsDeletingBloqueo(true);
    try {
      await profesionalesService.eliminarBloqueo(bloqueoId);
      success('Bloqueo de agenda eliminado.');
      setBloqueoToDelete(null);
      await onReload();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo eliminar el bloqueo de agenda.'));
      return false;
    } finally {
      setIsDeletingBloqueo(false);
    }
  }, [success, toastError, onReload]);

  return {
    consultorios,
    isModalDispOpen,
    setIsModalDispOpen,
    isModalBloqueoOpen,
    setIsModalBloqueoOpen,
    dispToDelete,
    setDispToDelete,
    bloqueoToDelete,
    setBloqueoToDelete,
    isGeneratingSlots,
    isDeletingDisp,
    isDeletingBloqueo,
    handleCrearDisponibilidad,
    handleEliminarDisponibilidad,
    handleGenerarSlots,
    handleCrearBloqueo,
    handleEliminarBloqueo,
  };
}
