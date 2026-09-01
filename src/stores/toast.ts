/**
 * Minimal toast queue store, RN counterpart of web's `sonner`
 * (`public-react/src/vendor/ui/index.ts` re-exports `Toaster`/`toast`).
 * No native toast dependency is installed, so this is a small zustand
 * queue rendered by <ToastHost/> (mounted once in App.tsx) — same
 * `toast.success(...)`/`toast.error(...)` call shape as web for parity.
 */
import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, variant: ToastVariant) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant) =>
    set((s) => ({ toasts: [...s.toasts, { id: nextId++, message, variant }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  error: (message: string) => useToastStore.getState().push(message, 'error'),
  info: (message: string) => useToastStore.getState().push(message, 'info'),
};
