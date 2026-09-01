import React, { useEffect } from 'react';
import { hydrateAuthToken, getAuthToken } from '../api/client';
import { useMe } from '../api/hooks/auth';
import { useAuthStore } from '../stores/auth';

/**
 * Mounted once near the root (see App.tsx). On app launch: reads the token
 * from react-native-keychain, then (if present) calls GET /auth/me to
 * hydrate the Zustand store; on 401 (handled by useMe's `retry: false` +
 * the effect below), clears the token and treats the user as logged out.
 * Matches Task 2.4's "Session persistence & guards" done-when.
 */
export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const [tokenHydrated, setTokenHydrated] = React.useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    void hydrateAuthToken().then(() => setTokenHydrated(true));
  }, []);

  const { data, isError, isFetched } = useMe({ enabled: tokenHydrated && Boolean(getAuthToken()) });

  useEffect(() => {
    if (!tokenHydrated) return;
    if (!getAuthToken()) {
      clear();
      return;
    }
    if (data?.data) {
      setUser(data.data);
    } else if (isError && isFetched) {
      // Token was invalid/expired — treat as logged out.
      clear();
    }
  }, [tokenHydrated, data, isError, isFetched, setUser, clear]);

  useEffect(() => {
    if (tokenHydrated && !getAuthToken()) setHydrated(true);
  }, [tokenHydrated, setHydrated]);

  return <>{children}</>;
}
