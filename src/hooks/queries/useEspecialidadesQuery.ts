import { useQuery } from '@tanstack/react-query';
import { profesionalesService } from '@/api/profesionalesService';
import type { Especialidad } from '@/types';

export const ESPECIALIDADES_QUERY_KEY = ['especialidades'] as const;

export function useEspecialidadesQuery() {
  return useQuery<Especialidad[], Error>({
    queryKey: ESPECIALIDADES_QUERY_KEY,
    queryFn: () => profesionalesService.getEspecialidades(),
  });
}
