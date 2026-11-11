import { useState } from 'react';
import { turnosService } from '@/api/turnosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import {
  MOTIVOS_CANCELACION_MOSTRADOR,
  validarMotivoCancelacion,
  type MotivoCancelacionOpcion,
} from '@/lib/cancelacionTurno';

export {
  MOTIVOS_CANCELACION_MOSTRADOR,
  validarMotivoCancelacion,
  type MotivoCancelacionOpcion,
};

export interface UseCancelacionTurnoProps {
  turnoId?: string;
  onCancelado?: (turnoId: string, motivoFinal: string) => void;
  onClose?: () => void;
}

export function useCancelacionTurno({
  turnoId,
  onCancelado,
  onClose,
}: UseCancelacionTurnoProps = {}) {
  const { success, error: toastError } = useToast();
  const [motivo, setMotivo] = useState<string>(
    MOTIVOS_CANCELACION_MOSTRADOR[0]?.label ?? 'Desistimiento voluntario del paciente'
  );
  const [observacion, setObservacion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutarCancelacion = async (overrideTurnoId?: string): Promise<boolean> => {
    const targetId = overrideTurnoId ?? turnoId;
    if (!targetId) {
      setError('Identificador de turno no válido.');
      return false;
    }

    const validacion = validarMotivoCancelacion(motivo, observacion);
    if (!validacion.valido) {
      setError(validacion.error ?? 'Datos de cancelación inválidos.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await turnosService.cancelarConJustificativo(targetId, validacion.motivoFinal);
      success('Turno cancelado con justificativo auditable.');
      onCancelado?.(targetId, validacion.motivoFinal);
      onClose?.();
      return true;
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'No se pudo registrar la cancelación.');
      setError(msg);
      toastError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMotivo(MOTIVOS_CANCELACION_MOSTRADOR[0]?.label ?? 'Desistimiento voluntario del paciente');
    setObservacion('');
    setError(null);
  };

  return {
    motivo,
    setMotivo,
    observacion,
    setObservacion,
    isSubmitting,
    error,
    setError,
    ejecutarCancelacion,
    resetForm,
    caracteresRestantes: 255 - observacion.trim().length,
    esLongitudExcedida: observacion.trim().length > 255,
  };
}
