import type { EntityId } from '@/types/content';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import type { ContentIndex } from '@/core/content/contentIndex';
import type { ContrastSetRecord } from '@/types/content';

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
  const dueEntityIds = new Set(
    knowledgeStates
      .filter((state) => isDue(state.dueAt))
      .flatMap((state) => state.entityIds)
  );

  return [...index.contrastSets.values()]
    .map((record) => {
      const personIds = new Set(record.personIds);
      const matchedConfusions = confusions.filter(
        (item) => personIds.has(item.sourceEntityId) || personIds.has(item.confusedWithEntityId)
      );
      const dueKnowledgeCount = record.personIds.filter((id) => dueEntityIds.has(id)).length;
      const score = matchedConfusions.reduce((sum, item) => sum + item.count, 0) + dueKnowledgeCount * 2;

      return {
        record,
        score,
        matchedConfusionCount: matchedConfusions.length,
        dueKnowledgeCount
      };
    })
    .sort((left, right) => right.score - left.score || left.record.title.localeCompare(right.record.title, 'cs'));
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

function isDue(dueAt?: string): boolean {
  if (!dueAt) {
    return false;
  }

  return dueAt <= new Date().toISOString();
}
