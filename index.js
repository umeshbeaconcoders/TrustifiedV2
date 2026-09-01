/**
 * @format
 */
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Background/quit-state FCM handler MUST be registered outside of any React
// component lifecycle, as early as possible in the JS bundle (per
// @react-native-firebase/messaging docs) — see Phase 5 (Task 5.1) of
// REACT_NATIVE_INSTRUCTIONS.md. This fires when a data/notification message
// arrives while the app is backgrounded or fully killed.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // eslint-disable-next-line no-console
  console.log('[push] background message handled', remoteMessage.messageId);
  // Intentionally no navigation here — background handlers run in a headless
  // JS context with no mounted navigator. Deep-linking on tap is handled in
  // src/push/messaging.ts via getInitialNotification()/onNotificationOpenedApp().
});

AppRegistry.registerComponent(appName, () => App);
