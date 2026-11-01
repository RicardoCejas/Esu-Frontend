import { useQuery } from '@tanstack/react-query';
import { profesionalesService } from '@/api/profesionalesService';
import type { Profesional } from '@/types';

export const PROFESIONALES_QUERY_KEY = ['profesionales'] as const;

export function useProfesionalesQuery() {
  return useQuery<Profesional[], Error>({
    queryKey: PROFESIONALES_QUERY_KEY,
    queryFn: () => profesionalesService.getAll(),
  });
}

export function useProfesionalByIdQuery(id?: string) {
  return useQuery<Profesional | undefined, Error>({
    queryKey: ['profesionales', id],
    queryFn: () => (id ? profesionalesService.getById(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
  });
}

export function useProfesionalesByEspecialidadQuery(especialidadId?: string) {
  return useQuery<Profesional[], Error>({
    queryKey: ['profesionales', 'especialidad', especialidadId],
    queryFn: () => (especialidadId ? profesionalesService.getByEspecialidad(especialidadId) : Promise.resolve([])),
    enabled: Boolean(especialidadId),
  });
}
