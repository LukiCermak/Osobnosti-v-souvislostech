import type { UserProfileRow } from '@/types/database';
import { openDatabase } from '@/db/database';
import { createDefaultUserProfile, normalizeUserProfileRow } from '@/db/tables/userProfileTable';

const DEFAULT_USER_ID = 'default-user';

export const userProfileRepository = {
  async getOrCreateDefault(): Promise<UserProfileRow> {
    const database = await openDatabase();
    const existing = await database.userProfiles.get(DEFAULT_USER_ID);

    if (existing) {
      return existing;
    }

    const created = createDefaultUserProfile(new Date().toISOString());
    await database.userProfiles.add(created);
    return created;
  },

  async getById(id: string = DEFAULT_USER_ID): Promise<UserProfileRow | undefined> {
    const database = await openDatabase();
    return database.userProfiles.get(id);
  },

  async save(row: UserProfileRow): Promise<UserProfileRow> {
    const database = await openDatabase();
    const normalized = normalizeUserProfileRow(row);
    await database.userProfiles.put(normalized);
    return normalized;
  },

  async touchLastActive(id: string = DEFAULT_USER_ID, at: string = new Date().toISOString()): Promise<void> {
    const profile = await this.getOrCreateDefault();
    await this.save({
      ...profile,
      id,
      lastActiveAt: at
    });
  },

  async updatePreferences(input: {
    id?: string;
    preferredDisciplineIds?: string[];
    preferredDailyIntensity?: UserProfileRow['preferredDailyIntensity'];
    pseudonym?: string;
    isFirstRun?: boolean;
  }): Promise<UserProfileRow> {
    const current = (await this.getById(input.id)) ?? (await this.getOrCreateDefault());

    return this.save({
      ...current,
      id: input.id ?? current.id,
      pseudonym: input.pseudonym ?? current.pseudonym,
      preferredDisciplineIds: input.preferredDisciplineIds ?? current.preferredDisciplineIds,
      preferredDailyIntensity: input.preferredDailyIntensity ?? current.preferredDailyIntensity,
      isFirstRun: input.isFirstRun ?? current.isFirstRun,
      lastActiveAt: new Date().toISOString()
    });
  },

  async markOnboardingComplete(id: string = DEFAULT_USER_ID): Promise<UserProfileRow> {
    return this.updatePreferences({ id, isFirstRun: false });
  },

  async clearAll(): Promise<void> {
    const database = await openDatabase();
    await database.userProfiles.clear();
  }
};
