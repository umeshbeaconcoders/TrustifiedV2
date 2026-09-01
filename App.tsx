/**
 * Trustified mobile app root. Wires up: TanStack Query, React Navigation
 * (with a module-level ref for push-notification deep links), gesture
 * handler + safe-area providers, session hydration, and a top-level error
 * boundary (Phase 6).
 */
import 'react-native-gesture-handler';
import './src/theme/global.css';
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastHost } from './src/components/ToastHost';
import { AuthHydrator } from './src/navigation/AuthHydrator';
import { navigationRef } from './src/navigation/navigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import { usePushNotifications } from './src/push/usePushNotifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sensible default; individual hooks in src/api/hooks/* override this
      // per query-type (see staleTime tuning notes there).
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function PushNotificationsBridge() {
  // Registers device token on mount/login/token-refresh and wires
  // foreground/background/killed-state notification-tap deep linking.
  // See src/push/usePushNotifications.ts (Phase 5 / Task 5.1).
  usePushNotifications();
  return null;
}

export default function App() {
  const scheme = useColorScheme();

  useEffect(() => {
    // react-native-bootsplash would be hidden here once the first frame is
    // ready — native bootsplash config itself lives in ios/Android (Phase 7).
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthHydrator>
            <NavigationContainer ref={navigationRef}>
              <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
              <ErrorBoundary label="Root navigator">
                <RootNavigator />
              </ErrorBoundary>
              <PushNotificationsBridge />
              <ToastHost />
            </NavigationContainer>
          </AuthHydrator>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
