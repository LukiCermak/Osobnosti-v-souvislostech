import type { ProgressSnapshotRow } from '@/types/database';

export const progressSnapshotTable = {
  name: 'progressSnapshots',
  schema: '&id, capturedAt'
} as const;

export function normalizeProgressSnapshotRow(row: ProgressSnapshotRow): ProgressSnapshotRow {
  return {
    ...row,
    totalUnits: Math.max(0, Math.trunc(row.totalUnits)),
    masteredUnits: Math.max(0, Math.trunc(row.masteredUnits)),
    unstableUnits: Math.max(0, Math.trunc(row.unstableUnits)),
    dueToday: Math.max(0, Math.trunc(row.dueToday)),
    disciplineCoverage: row.disciplineCoverage.map((item) => ({
      disciplineId: item.disciplineId,
      total: Math.max(0, Math.trunc(item.total)),
      mastered: Math.max(0, Math.trunc(item.mastered)),
      unstable: Math.max(0, Math.trunc(item.unstable))
    })),
    topConfusions: row.topConfusions.map((item) => ({
      sourceEntityId: item.sourceEntityId,
      confusedWithEntityId: item.confusedWithEntityId,
      count: Math.max(0, Math.trunc(item.count))
    }))
  };
}
