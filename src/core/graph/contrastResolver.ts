import type { ContentIndex } from '@/core/content/contentIndex';
import type { ContrastSetRecord, EntityId } from '@/types/content';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';

export interface RankedContrastSet {
  record: ContrastSetRecord;
  score: number;
  matchedConfusionCount: number;
  dueKnowledgeCount: number;
}

export function rankContrastSets(
  index: ContentIndex,
  confusions: ConfusionRecord[] = [],
  knowledgeStates: KnowledgeState[] = []
): RankedContrastSet[] {
  return [...index.contrastSets.values()]
    .map((record) => rankSingleContrastSet(record, confusions, knowledgeStates))
    .sort((left, right) =>
      right.score - left.score
      || right.matchedConfusionCount - left.matchedConfusionCount
      || right.dueKnowledgeCount - left.dueKnowledgeCount
      || left.record.title.localeCompare(right.record.title, 'cs')
    );
}

export function resolveContrastEntityLabels(index: ContentIndex, entityIds: EntityId[]): string[] {
  return entityIds.map((entityId) => {
    const entity = index.entities.get(entityId);
    if (!entity) {
      return entityId;
    }

    return 'displayName' in entity ? entity.displayName : entity.label;
  });
}

function rankSingleContrastSet(
  record: ContrastSetRecord,
  confusions: ConfusionRecord[],
  knowledgeStates: KnowledgeState[]
): RankedContrastSet {
  const personIds = new Set(record.personIds);
  const matchedConfusions = confusions.filter(
    (item) => personIds.has(item.sourceEntityId) && personIds.has(item.confusedWithEntityId)
  );
  const dueKnowledgeCount = knowledgeStates.filter(
    (state) => state.contrastSetId === record.id && Boolean(state.dueAt)
  ).length;
  const score = matchedConfusions.reduce((sum, item) => sum + item.count, 0) + dueKnowledgeCount * 3;

  return {
    record,
    score,
    matchedConfusionCount: matchedConfusions.length,
    dueKnowledgeCount
  };
}
