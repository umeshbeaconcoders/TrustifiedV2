import { NativeModules } from 'react-native';
import packageJson from '../../package.json';

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
 * Uses NativeModules.RNDeviceInfo if compiled into the native binary,
 * falling back safely to package.json version so the app never throws
 * "Requiring unknown module 'undefined'".
 */
export function getInstalledVersion(): string | null {
  if (cachedVersion !== undefined) return cachedVersion;
  try {
    const RNDeviceInfo = NativeModules.RNDeviceInfo;
    const nativeVersion = RNDeviceInfo?.appVersion;
    if (typeof nativeVersion === 'string' && nativeVersion.trim() !== '') {
      cachedVersion = nativeVersion.trim();
      return cachedVersion;
    }

    const fallback = (packageJson as any)?.version;
    if (typeof fallback === 'string' && fallback.trim() !== '') {
      cachedVersion = fallback.trim();
      return cachedVersion;
    }
  } catch {
    cachedVersion = null;
  }
  return cachedVersion ?? null;
}
