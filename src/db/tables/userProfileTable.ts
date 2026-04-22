import type { UserProfileRow } from '@/types/database';

export const userProfileTable = {
  name: 'userProfiles',
  schema: '&id, lastActiveAt, isFirstRun, *preferredDisciplineIds'
} as const;

export function createDefaultUserProfile(nowIso: string): UserProfileRow {
  return {
    id: 'default-user',
    createdAt: nowIso,
    lastActiveAt: nowIso,
    preferredDisciplineIds: [],
    preferredDailyIntensity: 'standard',
    isFirstRun: true
  };
}

export function normalizeUserProfileRow(row: UserProfileRow): UserProfileRow {
  return {
    ...row,
    pseudonym: row.pseudonym?.trim() || undefined,
    preferredDisciplineIds: Array.from(new Set(row.preferredDisciplineIds)),
    lastActiveAt: row.lastActiveAt,
    createdAt: row.createdAt
  };
}
