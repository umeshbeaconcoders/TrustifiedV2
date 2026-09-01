/**
 * RN port of `frontend/apps/web/src/stores/auth.ts`. Session mirror for
 * synchronous access (guards, tab bar, etc). The source of truth for the
 * user object is the React Query ["auth","me"] cache — <AuthHydrator> (see
 * src/navigation/AuthHydrator.tsx) keeps this store in sync and performs the
 * one-time keychain token hydration at app boot.
 */
import { create } from 'zustand';
import type { User } from '../api/types';

interface AuthState {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user, hydrated: true }),
  setHydrated: (hydrated) => set({ hydrated }),
  clear: () => set({ user: null, hydrated: true }),
}));

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.user !== null);
}
