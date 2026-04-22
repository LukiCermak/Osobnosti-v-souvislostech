import type { ContentBundleVersion } from '@/types/content';

const FALLBACK_CONTENT_VERSION = '0.0.0';

export function normalizeContentVersion(value: Partial<ContentBundleVersion> | null | undefined): ContentBundleVersion {
  return {
    version: normalizeVersionString(value?.version),
    createdAt: value?.createdAt ?? new Date(0).toISOString(),
    sourceDigest: value?.sourceDigest ?? 'unknown'
  };
}

export function normalizeVersionString(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized && /^\d+\.\d+\.\d+$/.test(normalized) ? normalized : FALLBACK_CONTENT_VERSION;
}

export function compareContentVersions(left: string, right: string): number {
  const a = toVersionParts(normalizeVersionString(left));
  const b = toVersionParts(normalizeVersionString(right));

  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) {
      return a[index] - b[index];
    }
  }

  return 0;
}

export function isContentVersionNewer(candidate: string, baseline: string): boolean {
  return compareContentVersions(candidate, baseline) > 0;
}

function toVersionParts(version: string): [number, number, number] {
  const [major, minor, patch] = version.split('.').map((item) => Number.parseInt(item, 10));
  return [major, minor, patch];
}
