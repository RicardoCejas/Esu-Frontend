import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache en memoria
      gcTime: 1000 * 60 * 30, // 30 minutos de garbage collection
      retry: 1, // 1 reintento automático ante fallas de red
      refetchOnWindowFocus: false, // Evita refetches molestos al cambiar de pestaña
    },
    mutations: {
      retry: 0,
    },
  },
});
