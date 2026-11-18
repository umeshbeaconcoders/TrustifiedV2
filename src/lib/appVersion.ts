/**
 * Installed-app version helpers for the launch-time "update available" check.
 */

/**
 * Compares dotted numeric versions ("1.14.20" vs "1.9"). Missing parts count as 0 and any
 * non-numeric suffix ("-beta") is ignored. Returns <0 when `a` is older than `b`, 0 when equal,
 * >0 when newer.
 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .trim()
      .split('.')
      .map((part) => {
        const n = parseInt(part, 10);
        return Number.isNaN(n) ? 0 : n;
      });

  const left = parse(a);
  const right = parse(b);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

let cachedVersion: string | null | undefined;

/**
 * The installed app's version string (Android versionName / iOS CFBundleShortVersionString).
 *
 * `react-native-device-info` is required lazily so a JS bundle delivered over CodePush to a binary
 * that predates the native module degrades to "unknown" (no popup) instead of crashing on launch.
 */
export function getInstalledVersion(): string | null {
  if (cachedVersion !== undefined) return cachedVersion;
  try {
    const DeviceInfo = require('react-native-device-info');
    const version = (DeviceInfo.default ?? DeviceInfo).getVersion?.();
    cachedVersion = typeof version === 'string' && version.trim() !== '' ? version.trim() : null;
  } catch {
    cachedVersion = null;
  }
  return cachedVersion;
}
