import type { SessionStateRow } from '@/types/database';
import { openDatabase } from '@/db/database';
import { normalizeSessionStateRow } from '@/db/tables/sessionStateTable';

export const sessionRepository = {
  async getById(id: string): Promise<SessionStateRow | undefined> {
    const database = await openDatabase();
    return database.sessionStates.get(id);
  },

  async getActive(): Promise<SessionStateRow | undefined> {
    const database = await openDatabase();
    const active = await database.sessionStates.where('status').equals('active').sortBy('updatedAt');
    return active.at(-1);
  },

  async getResumeCandidate(): Promise<SessionStateRow | undefined> {
    const database = await openDatabase();
    const candidates = await database.sessionStates
      .filter((row) => row.status === 'active' || row.status === 'paused')
      .toArray();

    return candidates.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
  },

  async save(row: SessionStateRow): Promise<SessionStateRow> {
    const database = await openDatabase();
    const normalized = normalizeSessionStateRow(row);
    await database.sessionStates.put(normalized);
    return normalized;
  },

  async updateProgress(id: string, patch: Partial<Pick<SessionStateRow, 'currentTaskId' | 'currentTask' | 'remainingTaskIds' | 'completedTaskIds' | 'status' | 'context' | 'lastAnswerAt'>>): Promise<SessionStateRow | undefined> {
    const current = await this.getById(id);

    if (!current) {
      return undefined;
    }

    return this.save({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    });
  },

  async pause(id: string): Promise<SessionStateRow | undefined> {
    return this.updateProgress(id, { status: 'paused' });
  },

  async complete(id: string): Promise<SessionStateRow | undefined> {
    return this.updateProgress(id, { status: 'completed', currentTaskId: undefined, currentTask: undefined, remainingTaskIds: [] });
  },

  async abandon(id: string): Promise<SessionStateRow | undefined> {
    return this.updateProgress(id, { status: 'abandoned' });
  },

  async deleteById(id: string): Promise<void> {
    const database = await openDatabase();
    await database.sessionStates.delete(id);
  },

  async clearAll(): Promise<void> {
    const database = await openDatabase();
    await database.sessionStates.clear();
  }
};
