import type { KnowledgeStateRow } from '@/types/database';

export const knowledgeStateTable = {
  name: 'knowledgeStates',
  schema:
    '&id, unitKind, dueAt, lastAttemptAt, activeProblemType, lastMode, studyPriority, relationId, contrastSetId, pathId, *entityIds'
} as const;

export function normalizeKnowledgeStateRow(row: KnowledgeStateRow): KnowledgeStateRow {
  return {
    ...row,
    entityIds: Array.from(new Set(row.entityIds)),
    masteryScore: clamp01(row.masteryScore),
    stabilityScore: clamp01(row.stabilityScore),
    successCount: Math.max(0, Math.trunc(row.successCount)),
    errorCount: Math.max(0, Math.trunc(row.errorCount)),
    averageResponseTimeMs: row.averageResponseTimeMs ? Math.max(0, row.averageResponseTimeMs) : undefined,
    confidenceAverage: row.confidenceAverage !== undefined ? clamp(row.confidenceAverage, 1, 5) : undefined
  };
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
