import type { ProgressSnapshot, KnowledgeState, ConfusionRecord } from '@/types/progress';
import type { ContentIndex } from '@/core/content/contentIndex';

export interface AggregatedProgress {
  totalUnits: number;
  masteredUnits: number;
  unstableUnits: number;
  dueToday: number;
  disciplineCoverage: ProgressSnapshot['disciplineCoverage'];
  topConfusions: ProgressSnapshot['topConfusions'];
}

export function aggregateProgress(index: ContentIndex, states: KnowledgeState[], confusions: ConfusionRecord[]): AggregatedProgress {
  const disciplineIds = new Set([...index.personsByDiscipline.keys(), ...index.conceptsByDiscipline.keys()]);
  const disciplineCoverage = [...disciplineIds].map((disciplineId) => {
    const disciplineStates = states.filter((state) => {
      const entities = state.entityIds;
      return entities.some((entityId) => {
        const entity = index.entities.get(entityId);
        if (!entity) {
          return false;
        }
        return 'disciplines' in entity ? entity.disciplines.includes(disciplineId) : entity.disciplineIds.includes(disciplineId);
      });
    });

    return {
      disciplineId,
      total: disciplineStates.length,
      mastered: disciplineStates.filter((state) => state.masteryScore >= 0.75).length,
      unstable: disciplineStates.filter((state) => state.stabilityScore < 0.65).length
    };
  });

  return {
    totalUnits: states.length,
    masteredUnits: states.filter((state) => state.masteryScore >= 0.75).length,
    unstableUnits: states.filter((state) => state.stabilityScore < 0.65).length,
    dueToday: states.filter((state) => state.dueAt && state.dueAt <= new Date().toISOString()).length,
    disciplineCoverage,
    topConfusions: [...confusions]
      .sort((left, right) => right.count - left.count)
      .slice(0, 8)
      .map((record) => ({
        sourceEntityId: record.sourceEntityId,
        confusedWithEntityId: record.confusedWithEntityId,
        count: record.count
      }))
  };
}
