import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client tuned for mobile speed (instant back/tab switches,
 * persistent in-memory session cache across 30 minutes).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60_000,
      gcTime: 30 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
