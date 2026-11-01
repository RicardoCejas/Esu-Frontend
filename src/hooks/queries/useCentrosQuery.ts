import { useQuery } from '@tanstack/react-query';
import { centrosService } from '@/api/centrosService';
import type { CentroSalud } from '@/types';

export const CENTROS_QUERY_KEY = ['centros'] as const;

export function useCentrosQuery() {
  return useQuery<CentroSalud[], Error>({
    queryKey: CENTROS_QUERY_KEY,
    queryFn: () => centrosService.getAll(),
  });
}

export function useCentroByIdQuery(id?: string) {
  return useQuery<CentroSalud | undefined, Error>({
    queryKey: ['centros', id],
    queryFn: () => (id ? centrosService.getById(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
  });
}
