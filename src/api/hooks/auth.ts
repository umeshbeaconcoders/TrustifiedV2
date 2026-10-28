/**
 * RN port of `frontend/packages/api-client/src/hooks/auth.ts` — same hook
 * names/params/query-keys. The one behavioral difference from web: token
 * persistence goes through `react-native-keychain` (async), not
 * `localStorage` (sync) — see setAuthToken in ../client.ts.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken, setAuthToken } from '../client';
import type {
  ChangePasswordRequest,
  Envelope,
  ForgotPasswordRequest,
  LoginRequest,
  OtpRequestRequest,
  OtpVerifyRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from '../types';

export interface LoginSuccess {
  status: string;
  user: User;
  token: string | null;
}

export interface Requires2fa {
  status: 'requires_2fa';
  challenge_token: string;
  expires_in: string;
}

/**
 * Per Task 2.2: admin/agent-role accounts without 2FA get blocked at login
 * with this status. Not expected for consumer accounts, but the same login
 * endpoint is shared, so we type + handle it defensively rather than crash.
 */
export interface Requires2faSetup {
  status: 'requires_2fa_setup';
  message?: string;
}

export type LoginResult = LoginSuccess | Requires2fa | Requires2faSetup;

export function isRequires2fa(result: LoginResult): result is Requires2fa {
  return result.status === 'requires_2fa';
}

export function isRequires2faSetup(result: LoginResult): result is Requires2faSetup {
  return result.status === 'requires_2fa_setup';
}

export function useMe(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => api.get<Envelope<User>>('/auth/me', undefined, signal),
    enabled: options.enabled ?? Boolean(getAuthToken()),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

function useAuthSuccess() {
  const queryClient = useQueryClient();
  const authStore = require('../../stores/auth').useAuthStore;
  return (user: User, token: string | null) => {
    if (token) void setAuthToken(token);
    queryClient.setQueryData(['auth', 'me'], { data: user });
    authStore.getState().setUser(user);
  };
}

export function useLogin() {
  const onSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: (body: LoginRequest) =>
      // device_name marks this as a mobile/token client in addition to the
      // X-Client header the base client already sends on every request.
      api.post<Envelope<LoginResult>>('/auth/login', {
        ...body,
        device_name: body.device_name ?? 'Trustified Mobile',
      }),
    onSuccess: (res) => {
      if (!isRequires2fa(res.data) && !isRequires2faSetup(res.data)) {
        onSuccess(res.data.user, res.data.token);
      }
    },
  });
}

export function useRegister() {
  const onSuccess = useAuthSuccess();
  const authStore = require('../../stores/auth').useAuthStore; // lazy import to avoid circular deps
  return useMutation({
    mutationFn: (body: RegisterRequest) =>
      api.post<Envelope<{ user: User; token: string | null }>>('/auth/register', body),
    onSuccess: (res) => {
      onSuccess(res.data.user, res.data.token);
      // Update Zustand auth store so the app knows the user is logged in immediately
      authStore.getState().setUser(res.data.user);
    },
  });
}


export function useOtpRequest() {
  return useMutation({
    mutationFn: (body: OtpRequestRequest) =>
      api.post<Envelope<{ message: string; expires_in: number }>>('/auth/otp/request', body),
  });
}

export function useOtpVerify() {
  const onSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: (body: OtpVerifyRequest) =>
      api.post<Envelope<{ user: User; token: string }>>('/auth/otp/verify', body),
    onSuccess: (res) => onSuccess(res.data.user, res.data.token),
  });
}

/** Verifies a phone's OTP as a standalone step before full registration —
 * unlike `useOtpVerify`, this never creates/logs in a user; it just marks
 * the phone verified so `POST /auth/register` will accept it. */
export function useOtpVerifyRegistration() {
  return useMutation({
    mutationFn: (body: { phone: string; otp: string }) =>
      api.post<Envelope<{ message: string; verified: boolean }>>('/auth/otp/verify-registration', body),
  });
}

export function useTwoFactorVerify() {
  const onSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: (body: { challenge_token: string; code: string }) =>
      api.post<Envelope<{ user: User; token: string }>>('/auth/2fa/verify', body),
    onSuccess: (res) => onSuccess(res.data.user, res.data.token),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: ForgotPasswordRequest) => api.post<Envelope<unknown>>('/auth/forgot-password', body),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: ResetPasswordRequest) => api.post<Envelope<unknown>>('/auth/reset-password', body),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const authStore = require('../../stores/auth').useAuthStore;
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) =>
      api.put<Envelope<User>>('/account/profile', body),
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], { data: res.data });
      authStore.getState().setUser(res.data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) =>
      api.put<Envelope<{ message: string }>>('/account/password', body),
  });
}

/** Don't let a slow/hung logout request keep the UI "logged in". */
const LOGOUT_REQUEST_TIMEOUT_MS = 2500;

/**
 * Signs out locally right away (token, store, caches), then revokes the server token in the
 * background — the user is never left waiting on (or stuck behind) the network.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const authStore = require('../../stores/auth').useAuthStore;
  return useMutation({
    mutationFn: () =>
      Promise.race([
        api.post<unknown>('/auth/logout').catch(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, LOGOUT_REQUEST_TIMEOUT_MS)),
      ]),
    onSettled: () => {
      void setAuthToken(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      authStore.getState().clear();
    },
  });
}

/** Mails a 6-digit code to the user's email (or to `email` when they have none / are adding one). */
export function useSendEmailCode() {
  return useMutation({
    mutationFn: (body: { email?: string } = {}) =>
      api.post<Envelope<{ message: string; email: string; expires_in: number }>>('/account/email/send-code', body),
  });
}

/** Confirms the emailed code; the email is saved + marked verified and the cached user refreshed. */
export function useVerifyEmailCode() {
  const queryClient = useQueryClient();
  const authStore = require('../../stores/auth').useAuthStore;
  return useMutation({
    mutationFn: (body: { code: string }) => api.post<Envelope<User>>('/account/email/verify', body),
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], { data: res.data });
      authStore.getState().setUser(res.data);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const authStore = require('../../stores/auth').useAuthStore;
  return useMutation({
    mutationFn: () => api.delete<Envelope<{ message: string }>>('/account'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['auth', 'me'] });
    },
    onSuccess: () => {
      void setAuthToken(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      authStore.getState().clear();
    },
  });
}
