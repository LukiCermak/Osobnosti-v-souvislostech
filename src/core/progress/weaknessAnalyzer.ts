import type { ConfusionRecord, KnowledgeState, WeaknessFocus } from '@/types/progress';

export function analyzeWeaknesses(states: KnowledgeState[], confusions: ConfusionRecord[]): WeaknessFocus[] {
  const stateWeaknesses = states
    .filter((state) =>
      state.errorCount > 0
      || (state.dueAt && state.dueAt <= new Date().toISOString())
      || state.activeProblemType === 'needed-hint'
      || state.activeProblemType === 'active-recall-gap'
    )
    .map<WeaknessFocus>((state) => ({
      id: `weakness:${state.id}`,
      title: buildStateWeaknessTitle(state),
      disciplineId: undefined,
      tagIds: [],
      relationIds: state.relationId ? [state.relationId] : [],
      entityIds: state.entityIds,
      contrastSetId: state.contrastSetId,
      pathId: state.pathId,
      problemType: state.activeProblemType ?? 'active-recall-gap',
      urgency: urgencyFromState(state)
    }));

  const confusionWeaknesses = confusions.map<WeaknessFocus>((record) => ({
    id: `confusion:${record.id}`,
    title: 'Častá záměna mezi podobnými položkami',
    disciplineId: record.disciplineIds[0],
    tagIds: [],
    relationIds: [],
    entityIds: [record.sourceEntityId, record.confusedWithEntityId],
    problemType: record.problemType,
    urgency: record.count >= 4 ? 'high' : record.count >= 2 ? 'medium' : 'low'
  }));

  return [...stateWeaknesses, ...confusionWeaknesses].sort(compareWeaknesses);
}

function buildStateWeaknessTitle(state: KnowledgeState): string {
  if (state.relationId) {
    return 'Jedna vazba potřebuje upevnění';
  }
  if (state.contrastSetId) {
    return 'Jedna kontrastní sada potřebuje rozlišení';
  }
  if (state.pathId) {
    return 'Jedna studijní trasa ještě není stabilní';
  }
  return 'Jedna studijní jednotka potřebuje další opakování';
}

function urgencyFromState(state: KnowledgeState): WeaknessFocus['urgency'] {
  if (state.errorCount >= state.successCount || state.masteryScore < 0.35) {
    return 'high';
  }
  if (state.activeProblemType === 'needed-hint' || state.activeProblemType === 'active-recall-gap') {
    return 'medium';
  }
  if (state.dueAt && state.dueAt <= new Date().toISOString()) {
    return 'medium';
  }
  return 'low';
}

function compareWeaknesses(left: WeaknessFocus, right: WeaknessFocus): number {
  const weight = (value: WeaknessFocus['urgency']) => {
    switch (value) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
    }
  };

  return weight(right.urgency) - weight(left.urgency) || left.title.localeCompare(right.title, 'cs');
}
