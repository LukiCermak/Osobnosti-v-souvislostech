import type { KnowledgeStateRow } from '@/types/database';
import { openDatabase } from '@/db/database';
import { normalizeKnowledgeStateRow } from '@/db/tables/knowledgeStateTable';

export const knowledgeRepository = {
  async getById(id: string): Promise<KnowledgeStateRow | undefined> {
    const database = await openDatabase();
    return database.knowledgeStates.get(id);
  },

  async listAll(): Promise<KnowledgeStateRow[]> {
    const database = await openDatabase();
    return database.knowledgeStates.toArray();
  },

  async bulkUpsert(rows: KnowledgeStateRow[]): Promise<number> {
    const database = await openDatabase();
    const normalized = rows.map(normalizeKnowledgeStateRow);
    await database.knowledgeStates.bulkPut(normalized);
    return normalized.length;
  },

  async save(row: KnowledgeStateRow): Promise<KnowledgeStateRow> {
    const database = await openDatabase();
    const normalized = normalizeKnowledgeStateRow(row);
    await database.knowledgeStates.put(normalized);
    return normalized;
  },

  async listDue(referenceIso: string = new Date().toISOString(), limit = 50): Promise<KnowledgeStateRow[]> {
    const database = await openDatabase();
    return database.knowledgeStates.where('dueAt').belowOrEqual(referenceIso).sortBy('dueAt').then((rows) => rows.slice(0, limit));
  },

  async listWeakest(limit = 20): Promise<KnowledgeStateRow[]> {
    const rows = await this.listAll();
    return rows
      .slice()
      .sort((left, right) => {
        const riskLeft = left.masteryScore + left.stabilityScore - left.errorCount * 0.05;
        const riskRight = right.masteryScore + right.stabilityScore - right.errorCount * 0.05;
        return riskLeft - riskRight;
      })
      .slice(0, limit);
  },

  async listByEntity(entityId: string): Promise<KnowledgeStateRow[]> {
    const database = await openDatabase();
    return database.knowledgeStates.where('entityIds').equals(entityId).toArray();
  },

  async patchStats(id: string, patch: {
    masteryScore?: number;
    stabilityScore?: number;
    successCountDelta?: number;
    errorCountDelta?: number;
    lastAttemptAt?: string;
    dueAt?: string;
    averageResponseTimeMs?: number;
    confidenceAverage?: number;
    activeProblemType?: string;
    lastMode?: string;
  }): Promise<KnowledgeStateRow | undefined> {
    const database = await openDatabase();
    const current = await database.knowledgeStates.get(id);

    if (!current) {
      return undefined;
    }

    const next = normalizeKnowledgeStateRow({
      ...current,
      masteryScore: patch.masteryScore ?? current.masteryScore,
      stabilityScore: patch.stabilityScore ?? current.stabilityScore,
      successCount: current.successCount + (patch.successCountDelta ?? 0),
      errorCount: current.errorCount + (patch.errorCountDelta ?? 0),
      lastAttemptAt: patch.lastAttemptAt ?? current.lastAttemptAt,
      dueAt: patch.dueAt ?? current.dueAt,
      averageResponseTimeMs: patch.averageResponseTimeMs ?? current.averageResponseTimeMs,
      confidenceAverage: patch.confidenceAverage ?? current.confidenceAverage,
      activeProblemType: patch.activeProblemType ?? current.activeProblemType,
      lastMode: patch.lastMode ?? current.lastMode
    });

    await database.knowledgeStates.put(next);
    return next;
  },

  async deleteByIds(ids: string[]): Promise<void> {
    const database = await openDatabase();
    await database.knowledgeStates.bulkDelete(ids);
  },

  async clearAll(): Promise<void> {
    const database = await openDatabase();
    await database.knowledgeStates.clear();
  },

  async runInTransaction<T>(task: () => Promise<T>): Promise<T> {
    const database = await openDatabase();
    return database.transaction('rw', database.knowledgeStates, task);
  }
};
