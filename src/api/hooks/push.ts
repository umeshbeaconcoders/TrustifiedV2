/**
 * New hooks (not present on web) for the mobile-only push-token registration
 * endpoints added in Phase 5 / Task 5.0:
 *   POST   /account/device-token   { token, device_type }
 *   DELETE /account/device-token
 * See backend/routes/api/auth.php + AccountController::updateDeviceToken/
 * removeDeviceToken (backend/app/Http/Controllers/Api/V1/Auth/AccountController.php).
 */
import { useMutation } from '@tanstack/react-query';
import { api } from '../client';
import type { Envelope } from '../types';

export type DeviceType = 'ios' | 'android' | 'web';

export function useRegisterDeviceToken() {
  return useMutation({
    mutationFn: (body: { token: string; device_type: DeviceType }) =>
      api.post<Envelope<{ message: string }>>('/account/device-token', body),
  });
}

export function useRemoveDeviceToken() {
  return useMutation({
    mutationFn: () => api.delete<Envelope<{ message: string }>>('/account/device-token'),
  });
}
