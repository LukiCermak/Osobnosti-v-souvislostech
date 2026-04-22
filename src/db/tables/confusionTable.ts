import type { ConfusionRow } from '@/types/database';

export const confusionTable = {
  name: 'confusions',
  schema: '&id, sourceEntityId, confusedWithEntityId, lastOccurredAt, problemType, *disciplineIds, [sourceEntityId+confusedWithEntityId]'
} as const;

export function normalizeConfusionRow(row: ConfusionRow): ConfusionRow {
  return {
    ...row,
    count: Math.max(1, Math.trunc(row.count)),
    disciplineIds: Array.from(new Set(row.disciplineIds))
  };
}

export function createConfusionId(sourceEntityId: string, confusedWithEntityId: string): string {
  return `${sourceEntityId}::${confusedWithEntityId}`;
}
