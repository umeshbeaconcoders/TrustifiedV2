import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import messaging, { type FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useRegisterDeviceToken } from '../api/hooks/push';
import { useAuthStore } from '../stores/auth';
import { navigate } from '../navigation/navigationRef';

/**
 * Push notification registration + deep-link wiring (Phase 5 / Task 5.1).
 *
 * - Requests notification permission (iOS: `messaging().requestPermission()`
 *   shows the native prompt; Android 13+ additionally needs the runtime
 *   `POST_NOTIFICATIONS` permission, requested here via
 *   `react-native-permissions` since it's already a project dependency).
 * - On grant (and on every `onTokenRefresh`), registers the FCM token via
 *   `useRegisterDeviceToken()` (POST /account/device-token).
 * - Only runs while authenticated — `useAuthStore` is the sync mirror of the
 *   session (see src/stores/auth.ts). Logout-time token removal is handled
 *   separately in ProfileScreen/SettingsMenuScreen via `useRemoveDeviceToken()`
 *   at the point logout is triggered, not here.
 * - Wires foreground messages, notification-tap-from-background
 *   (`onNotificationOpenedApp`), and notification-tap-from-killed-state
 *   (`getInitialNotification`) to a small defensive deep-link mapper using
 *   the module-level `navigationRef`.
 *
 * The background/quit-state `setBackgroundMessageHandler` MUST be registered
 * outside the React tree — that lives in index.js, not here (RNFB requirement).
 */

async function ensureAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  // POST_NOTIFICATIONS only exists/matters on API 33+ (Android 13). On older
  // Android versions notification permission is granted at install time, so
  // there's nothing to request.
  if (Number(Platform.Version) < 33) return true;

  const permission = PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
  const status = await check(permission);
  if (status === RESULTS.GRANTED) return true;
  const result = await request(permission);
  return result === RESULTS.GRANTED;
}

type NotificationData = FirebaseMessagingTypes.RemoteMessage['data'];

/**
 * Best-effort deep link from a notification's `data` payload. Defensive by
 * design — there's no live payload spec yet, so unrecognized shapes just no-op
 * instead of throwing/crashing a cold app launch.
 */
function navigateForNotification(data: NotificationData) {
  if (!data) return;

  const slug = data.product_slug ?? data.slug;
  const certificateNumber = data.certificate_number ?? data.certificate_id;

  if (data.type === 'certificate' || certificateNumber) {
    navigate('Verify', { certificateNumber: certificateNumber ? String(certificateNumber) : undefined });
    return;
  }
  if ((data.type === 'product' || data.type === 'review' || data.review_id) && slug) {
    navigate('ProductDetail', { slug: String(slug) });
    return;
  }
  // Unrecognized payload shape (or a product/review reference with no slug
  // we can resolve client-side) — intentionally no-op.
}

export function usePushNotifications() {
  const user = useAuthStore((s) => s.user);
  const registerDeviceToken = useRegisterDeviceToken();
  const hasRegisteredRef = useRef(false);

  // Registration + token-refresh — only while logged in.
  useEffect(() => {
    if (!user) {
      hasRegisteredRef.current = false;
      return;
    }

    let cancelled = false;
    const deviceType: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';

    async function register() {
      try {
        const authStatus = await messaging().requestPermission();
        const permitted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!permitted) return;

        await ensureAndroidNotificationPermission();

        const token = await messaging().getToken();
        if (!cancelled && token) {
          registerDeviceToken.mutate({ token, device_type: deviceType });
          hasRegisteredRef.current = true;
        }
      } catch {
        // Push registration is best-effort — never block app usage on it.
      }
    }

    void register();

    const unsubscribeTokenRefresh = messaging().onTokenRefresh((token) => {
      if (hasRegisteredRef.current) {
        registerDeviceToken.mutate({ token, device_type: deviceType });
      }
    });

    return () => {
      cancelled = true;
      unsubscribeTokenRefresh();
    };
    // registerDeviceToken (a useMutation result) is intentionally omitted —
    // it's a new object identity every render and isn't meant to retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Foreground/background/killed-state message + tap handling — independent
  // of auth state so a tap can still deep-link right after a fresh install.
  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      // No local-notification library is wired up, so a foreground push
      // doesn't produce a system banner here — this is just an observability
      // hook a future toast/in-app-banner could plug into.
      // eslint-disable-next-line no-console
      console.log('[push] foreground message received', remoteMessage.messageId);
    });

    const unsubscribeOnOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      navigateForNotification(remoteMessage.data);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) navigateForNotification(remoteMessage.data);
      })
      .catch(() => {
        // Ignore — killed-state deep link is a nice-to-have, not critical path.
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpen();
    };
  }, []);
}
