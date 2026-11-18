import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import { APP_VERSION_STALE_MS, useAppVersion } from '../api';
import { compareVersions, getInstalledVersion } from '../lib/appVersion';
import { UpdateAppModal } from './UpdateAppModal';

const platform = Platform.OS === 'ios' ? 'ios' : 'android';

/**
 * Launch-time update check. Asks the API for the store version of this platform (one tiny, cached
 * request — refreshed at most once an hour, also when the app returns from the background) and, if
 * the installed version is older, shows the update popup linking to the store.
 *
 * Fails open: no installed version, no store link, no network or any error just means no popup.
 * "Maybe later" hides the popup for that store version until the next app launch; forced updates
 * cannot be dismissed.
 */
export function AppUpdateGate() {
  const { data, refetch, dataUpdatedAt } = useAppVersion(platform);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  // Coming back to the foreground after a while: re-check so a long-lived session still finds out.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - dataUpdatedAt > APP_VERSION_STALE_MS) void refetch();
    });
    return () => sub.remove();
  }, [dataUpdatedAt, refetch]);

  const installed = getInstalledVersion();
  const latest = data?.latest_version ?? null;
  const storeUrl = data?.store_url ?? null;
  const force = data?.force_update ?? false;

  const outdated = !!installed && !!latest && !!storeUrl && compareVersions(installed, latest) < 0;
  const visible = outdated && (force || dismissedFor !== latest);

  const onUpdate = useCallback(() => {
    if (storeUrl) void Linking.openURL(storeUrl).catch(() => {});
  }, [storeUrl]);

  const onLater = useCallback(() => setDismissedFor(latest), [latest]);

  if (!outdated || !installed || !latest) return null;

  return (
    <UpdateAppModal
      visible={visible}
      installedVersion={installed}
      latestVersion={latest}
      force={force}
      onUpdate={onUpdate}
      onLater={onLater}
    />
  );
}
