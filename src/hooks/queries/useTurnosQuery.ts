import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turnosService } from '@/api/turnosService';
import type { Turno, EstadoTurno } from '@/types';

export const TURNOS_QUERY_KEY = ['turnos'] as const;

export function useTurnosQuery() {
  return useQuery<Turno[], Error>({
    queryKey: TURNOS_QUERY_KEY,
    queryFn: () => turnosService.getAll(),
  });
}

export function useMisTurnosQuery(pacienteId?: string) {
  return useQuery<Turno[], Error>({
    queryKey: ['turnos', 'paciente', pacienteId],
    queryFn: () => (pacienteId ? turnosService.getByPaciente(pacienteId) : Promise.resolve([])),
    enabled: Boolean(pacienteId),
  });
}

export function useCancelarTurnoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (turnoId: string) => turnosService.cancelarTurno(turnoId),
    onSuccess: () => {
      // Invalida las queries para refrescar la lista automáticamente
      queryClient.invalidateQueries({ queryKey: TURNOS_QUERY_KEY });
    },
  });
}

export function useUpdateEstadoTurnoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoTurno }) =>
      turnosService.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TURNOS_QUERY_KEY });
    },
  });
}
