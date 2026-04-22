import type { ExportedDatabasePayload, SessionStateRow } from '@/types/database';
import type { ConfusionRecord, KnowledgeState, ProgressSnapshot, UserProfile } from '@/types/progress';

export function createSampleUserProfile(): UserProfile {
  return { id: 'default-user', createdAt: '2026-04-22T08:00:00.000Z', lastActiveAt: '2026-04-22T09:00:00.000Z', preferredDisciplineIds: ['diagnostika'], preferredDailyIntensity: 'standard', pseudonym: 'Tester', isFirstRun: false };
}

export function createSampleKnowledgeStates(referenceIso = '2026-04-22T10:00:00.000Z'): KnowledgeState[] {
  return [
    { id: 'atlas-unit:rel-binet-developed-scale', unitKind: 'relation', relationId: 'rel-binet-developed-scale', entityIds: ['alfred-binet','binet-simonova-skala'], masteryScore: 0.82, stabilityScore: 0.72, successCount: 4, errorCount: 1, dueAt: '2026-04-25T10:00:00.000Z', activeProblemType: 'test-link', lastMode: 'atlas', studyPriority: 'core' },
    { id: 'atlas-unit:rel-binet-preceded-terman', unitKind: 'relation', relationId: 'rel-binet-preceded-terman', entityIds: ['alfred-binet','lewis-terman'], masteryScore: 0.32, stabilityScore: 0.28, successCount: 0, errorCount: 2, dueAt: referenceIso, activeProblemType: 'historical-sequence', lastMode: 'atlas', studyPriority: 'important' },
    { id: 'lab-unit:contrast-binet-terman', unitKind: 'contrast-set', contrastSetId: 'contrast-binet-terman', entityIds: ['alfred-binet','lewis-terman','binet-simonova-skala','stanford-binet'], masteryScore: 0.4, stabilityScore: 0.35, successCount: 1, errorCount: 3, dueAt: referenceIso, activeProblemType: 'similar-person-confusion', lastMode: 'lab', studyPriority: 'core' }
  ];
}

export function createSampleConfusions(referenceIso = '2026-04-22T10:00:00.000Z'): ConfusionRecord[] {
  return [
    { id: 'confusion:alfred-binet:lewis-terman', sourceEntityId: 'alfred-binet', confusedWithEntityId: 'lewis-terman', count: 4, lastOccurredAt: referenceIso, disciplineIds: ['diagnostika'], problemType: 'similar-person-confusion' },
    { id: 'confusion:alfred-binet:maria-montessori', sourceEntityId: 'alfred-binet', confusedWithEntityId: 'maria-montessori', count: 1, lastOccurredAt: referenceIso, disciplineIds: ['psychopedie'], problemType: 'active-recall-gap' }
  ];
}

export function createSampleSession(): SessionStateRow {
  return { id: 'session-atlas-1', mode: 'atlas', startedAt: '2026-04-22T09:55:00.000Z', updatedAt: '2026-04-22T10:00:00.000Z', planId: 'atlas-2026-04-22', currentTaskId: 'atlas-task:1:rel-binet-preceded-terman', remainingTaskIds: ['atlas-task:2:rel-binet-developed-scale'], completedTaskIds: [], status: 'paused', context: { pathId: 'path-inteligenicni-diagnostika' } };
}

export function createSampleSnapshot(): ProgressSnapshot {
  return { id: 'snapshot:2026-04-22T10:00:00.000Z', capturedAt: '2026-04-22T10:00:00.000Z', totalUnits: 3, masteredUnits: 1, unstableUnits: 2, dueToday: 2, disciplineCoverage: [{ disciplineId: 'diagnostika', total: 3, mastered: 1, unstable: 2 }], topConfusions: [{ sourceEntityId: 'alfred-binet', confusedWithEntityId: 'lewis-terman', count: 4 }] };
}

export function createSampleExportPayload(): ExportedDatabasePayload {
  return { exportedAt: '2026-04-22T10:05:00.000Z', schemaVersion: 2, contentVersion: 'test-fixture-1', appVersion: '0.1.0-test', data: { userProfiles: [createSampleUserProfile()], knowledgeStates: createSampleKnowledgeStates(), confusions: createSampleConfusions(), sessionStates: [createSampleSession()], progressSnapshots: [createSampleSnapshot()], meta: [] } };
}
