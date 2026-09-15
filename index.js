/**
 * @format
 */
import { AppRegistry } from 'react-native';

// Polyfill: Prevent react-native-css-interop (NativeWind) property inspection from triggering throwing getters on NavigationStateContext
try {
  const safeProps = {
    getKey: { value: () => '', writable: true, configurable: true },
    setKey: { value: () => {}, writable: true, configurable: true },
    getState: { value: () => ({ routes: [] }), writable: true, configurable: true },
    setState: { value: () => {}, writable: true, configurable: true },
    getIsInitial: { value: () => true, writable: true, configurable: true },
  };

  const modulesToPatch = [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@react-navigation/core/lib/module/NavigationStateContext').default,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@react-navigation/core/lib/commonjs/NavigationStateContext').default,
  ];

  modulesToPatch.forEach((ctx) => {
    if (ctx) {
      if (ctx._currentValue) Object.defineProperties(ctx._currentValue, safeProps);
      if (ctx._currentValue2) Object.defineProperties(ctx._currentValue2, safeProps);
    }
  });
} catch {
  // Ignore
}
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Background/quit-state FCM handler MUST be registered outside of any React
// component lifecycle, as early as possible in the JS bundle (per
// @react-native-firebase/messaging docs) — see Phase 5 (Task 5.1) of
// REACT_NATIVE_INSTRUCTIONS.md. This fires when a data/notification message
// arrives while the app is backgrounded or fully killed.
try {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // eslint-disable-next-line no-console
    console.log('[push] background message handled', remoteMessage.messageId);
    // Intentionally no navigation here — background handlers run in a headless
    // JS context with no mounted navigator. Deep-linking on tap is handled in
    // src/push/messaging.ts via getInitialNotification()/onNotificationOpenedApp().
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[push] Firebase messaging background handler init skipped:', e);
}

AppRegistry.registerComponent(appName, () => App);
