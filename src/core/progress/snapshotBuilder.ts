import type { ProgressSnapshot, KnowledgeState, ConfusionRecord } from '@/types/progress';
import type { ContentIndex } from '@/core/content/contentIndex';
import { aggregateProgress } from '@/core/progress/progressAggregator';

export function buildProgressSnapshot(index: ContentIndex, states: KnowledgeState[], confusions: ConfusionRecord[]): ProgressSnapshot {
  const capturedAt = new Date().toISOString();
  const aggregated = aggregateProgress(index, states, confusions);

  return {
    id: `snapshot:${capturedAt}`,
    capturedAt,
    totalUnits: aggregated.totalUnits,
    masteredUnits: aggregated.masteredUnits,
    unstableUnits: aggregated.unstableUnits,
    dueToday: aggregated.dueToday,
    disciplineCoverage: aggregated.disciplineCoverage,
    topConfusions: aggregated.topConfusions
  };
}
