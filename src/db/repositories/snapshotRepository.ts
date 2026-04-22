import type { ProgressSnapshotRow } from '@/types/database';
import { openDatabase } from '@/db/database';
import { normalizeProgressSnapshotRow } from '@/db/tables/progressSnapshotTable';

export const snapshotRepository = {
  async save(row: ProgressSnapshotRow): Promise<ProgressSnapshotRow> {
    const database = await openDatabase();
    const normalized = normalizeProgressSnapshotRow(row);
    await database.progressSnapshots.put(normalized);
    return normalized;
  },

  async latest(): Promise<ProgressSnapshotRow | undefined> {
    const database = await openDatabase();
    const snapshots = await database.progressSnapshots.orderBy('capturedAt').toArray();
    return snapshots.at(-1);
  },

  async listRecent(limit = 14): Promise<ProgressSnapshotRow[]> {
    const database = await openDatabase();
    const snapshots = await database.progressSnapshots.orderBy('capturedAt').reverse().limit(limit).toArray();
    return snapshots;
  },

  async deleteOlderThan(cutoffIso: string): Promise<number> {
    const database = await openDatabase();
    return database.progressSnapshots.where('capturedAt').below(cutoffIso).delete();
  },

  async clearAll(): Promise<void> {
    const database = await openDatabase();
    await database.progressSnapshots.clear();
  }
};
