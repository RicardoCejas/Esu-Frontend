import { useState, useEffect } from 'react';
import { turnosService } from '@/api/turnosService';
import type { EstadoTurno, Turno } from '@/types';

const ESTADOS_ACTIVOS: EstadoTurno[] = ['CONFIRMADO', 'EN_ESPERA', 'PENDIENTE'];

export const useProximoTurno = (pacienteId?: string, habilitado = false): Turno | null => {
  const [proximoTurno, setProximoTurno] = useState<Turno | null>(null);

  useEffect(() => {
    if (!pacienteId || !habilitado) return;

    let isCurrent = true;
    turnosService.getByPaciente(pacienteId).then((turnos) => {
      if (!isCurrent) return;
      setProximoTurno(turnos.find((t) => ESTADOS_ACTIVOS.includes(t.estado)) || null);
    });

    return () => {
      isCurrent = false;
    };
  }, [pacienteId, habilitado]);

  return habilitado ? proximoTurno : null;
};
