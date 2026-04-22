import type { ConfusionRow } from '@/types/database';
import { openDatabase } from '@/db/database';
import { createConfusionId, normalizeConfusionRow } from '@/db/tables/confusionTable';

export const confusionRepository = {
  async getById(id: string): Promise<ConfusionRow | undefined> {
    const database = await openDatabase();
    return database.confusions.get(id);
  },

  async record(input: {
    sourceEntityId: string;
    confusedWithEntityId: string;
    disciplineIds?: string[];
    problemType: string;
    occurredAt?: string;
  }): Promise<ConfusionRow> {
    const database = await openDatabase();
    const id = createConfusionId(input.sourceEntityId, input.confusedWithEntityId);
    const existing = await database.confusions.get(id);

    const next = normalizeConfusionRow({
      id,
      sourceEntityId: input.sourceEntityId,
      confusedWithEntityId: input.confusedWithEntityId,
      count: (existing?.count ?? 0) + 1,
      lastOccurredAt: input.occurredAt ?? new Date().toISOString(),
      disciplineIds: [...(existing?.disciplineIds ?? []), ...(input.disciplineIds ?? [])],
      problemType: input.problemType
    });

    await database.confusions.put(next);
    return next;
  },

  async listTop(limit = 20): Promise<ConfusionRow[]> {
    const database = await openDatabase();
    const rows = await database.confusions.toArray();
    return rows.sort((left, right) => right.count - left.count).slice(0, limit);
  },

  async listByEntity(entityId: string): Promise<ConfusionRow[]> {
    const database = await openDatabase();
    return database.confusions.where('sourceEntityId').equals(entityId).toArray();
  },

  async pruneOlderThan(cutoffIso: string): Promise<number> {
    const database = await openDatabase();
    return database.confusions.where('lastOccurredAt').below(cutoffIso).delete();
  },

  async clearAll(): Promise<void> {
    const database = await openDatabase();
    await database.confusions.clear();
  }
};
