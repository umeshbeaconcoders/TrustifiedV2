import { useCallback, useState } from 'react';

/**
 * Wires up a `RefreshControl`: pass the `refetch` functions from every
 * react-query hook the screen uses, get back `{refreshing, onRefresh}` to
 * spread onto `<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />`.
 * Failures are swallowed (react-query already surfaces them via each query's
 * own error state) so a flaky one refetch doesn't leave the spinner stuck.
 */
export function usePullToRefresh(refetchFns: Array<() => Promise<unknown> | unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.allSettled(refetchFns.map((fn) => fn())).finally(() => setRefreshing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refetchFns);

  return { refreshing, onRefresh };
}
