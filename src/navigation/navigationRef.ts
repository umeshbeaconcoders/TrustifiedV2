import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Module-level nav ref so code outside the component tree (push notification
 * tap handlers in src/push/messaging.ts, deep links) can navigate. See
 * Phase 5 / Task 5.1.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: RootStackParamList[RouteName] extends undefined
    ? [screen: RouteName]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
) {
  if (navigationRef.isReady()) {
    // @ts-expect-error — spread signature is safe here, React Navigation's own types are just verbose.
    navigationRef.navigate(...args);
  }
}
