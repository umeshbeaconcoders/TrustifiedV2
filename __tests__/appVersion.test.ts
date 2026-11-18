import { describe, expect, it } from '@jest/globals';
import { compareVersions } from '../src/lib/appVersion';

describe('compareVersions', () => {
  it('orders dotted versions numerically', () => {
    expect(compareVersions('1.14.20', '1.14.21')).toBeLessThan(0);
    expect(compareVersions('1.9.0', '1.10.0')).toBeLessThan(0);
    expect(compareVersions('2.0.0', '1.99.99')).toBeGreaterThan(0);
  });

  it('treats equal and zero-padded versions as equal', () => {
    expect(compareVersions('1.0.16', '1.0.16')).toBe(0);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
  });

  it('ignores non-numeric suffixes and whitespace', () => {
    expect(compareVersions(' 1.2.3 ', '1.2.3')).toBe(0);
    expect(compareVersions('1.2.3-beta', '1.2.4')).toBeLessThan(0);
  });
});
