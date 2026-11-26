/**
 * Trustified mobile app root. Wires up: TanStack Query, React Navigation
 * (with a module-level ref for push-notification deep links), gesture
 * handler + safe-area providers, session hydration, and a top-level error
 * boundary (Phase 6).
 */
import 'react-native-gesture-handler';
import './src/theme/global.css';
import React, { useEffect } from 'react';
import { StatusBar, Appearance, Linking } from 'react-native';
import { colorScheme } from 'nativewind';
import { enableFreeze } from 'react-native-screens';

// Enforce light mode synchronously before render
try {
  Appearance.setColorScheme('light');
  colorScheme.set('light');
} catch {}
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// Freezes off-screen stack screens — disabled to prevent NavigationContext loss on state changes
enableFreeze(false);
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';
import { AppUpdateGate } from './src/components/AppUpdateGate';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastHost } from './src/components/ToastHost';
import { AuthHydrator } from './src/navigation/AuthHydrator';
import { navigationRef } from './src/navigation/navigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AndroidSwipeBack } from './src/navigation/AndroidSwipeBack';
import { usePushNotifications } from './src/push/usePushNotifications';
import { tryOpenInternalLink } from './src/lib/openLink';

function PushNotificationsBridge() {
  // Registers device token on mount/login/token-refresh and wires
  // foreground/background/killed-state notification-tap deep linking.
  // See src/push/usePushNotifications.ts (Phase 5 / Task 5.1).
  usePushNotifications();
  return null;
}

function DeepLinkBridge() {
  const pendingUrlRef = React.useRef<string | null>(null);

  useEffect(() => {
    const flushPending = () => {
      const pending = pendingUrlRef.current;
      if (!pending || !navigationRef.isReady()) return;
      if (navigationRef.getCurrentRoute()?.name === 'Splash') return;
      pendingUrlRef.current = null;
      tryOpenInternalLink(navigationRef, pending);
    };

    const handleUrl = (url: string | null | undefined) => {
      if (!url) return;
      if (!navigationRef.isReady() || navigationRef.getCurrentRoute()?.name === 'Splash') {
        pendingUrlRef.current = url;
        return;
      }
      tryOpenInternalLink(navigationRef, url);
    };

    void Linking.getInitialURL()
      .then((url) => handleUrl(url))
      .catch(() => {});

    const linkSub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    const navSub = navigationRef.addListener('state', flushPending);

    return () => {
      linkSub.remove();
      navSub();
    };
  }, []);

  return null;
}

export default function App() {
  useEffect(() => {
    colorScheme.set('light');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <AuthHydrator>
            <NavigationContainer ref={navigationRef}>
              <AndroidSwipeBack>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <ErrorBoundary label="Root navigator">
                  <RootNavigator />
                </ErrorBoundary>
                <PushNotificationsBridge />
                <DeepLinkBridge />
                <ToastHost />
              </AndroidSwipeBack>
            </NavigationContainer>
          </AuthHydrator>
          <AppUpdateGate />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
