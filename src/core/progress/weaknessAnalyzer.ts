import type { WeaknessFocus, ConfusionRecord, KnowledgeState } from '@/types/progress';

export function analyzeWeaknesses(states: KnowledgeState[], confusions: ConfusionRecord[]): WeaknessFocus[] {
  const stateWeaknesses = states
    .filter((state) => state.errorCount > 0 || (state.dueAt && state.dueAt <= new Date().toISOString()))
    .map<WeaknessFocus>((state) => ({
      id: `weakness:${state.id}`,
      title: buildStateWeaknessTitle(state),
      disciplineId: undefined,
      tagIds: [],
      relationIds: state.relationId ? [state.relationId] : [],
      problemType: state.activeProblemType ?? 'active-recall-gap',
      urgency: urgencyFromState(state)
    }));

  const confusionWeaknesses = confusions.map<WeaknessFocus>((record) => ({
    id: `confusion:${record.id}`,
    title: `Častá záměna ${record.sourceEntityId} a ${record.confusedWithEntityId}`,
    disciplineId: record.disciplineIds[0],
    tagIds: [],
    relationIds: [],
    problemType: record.problemType,
    urgency: record.count >= 4 ? 'high' : record.count >= 2 ? 'medium' : 'low'
  }));

  return [...stateWeaknesses, ...confusionWeaknesses].sort(compareWeaknesses);
}

function buildStateWeaknessTitle(state: KnowledgeState): string {
  if (state.relationId) {
    return `Vazba ${state.relationId} potřebuje upevnění`;
  }
  if (state.contrastSetId) {
    return `Kontrastní sada ${state.contrastSetId} potřebuje rozlišení`;
  }
  if (state.pathId) {
    return `Trasa ${state.pathId} není ještě stabilní`;
  }
  return `Studijní jednotka ${state.id} potřebuje další opakování`;
}

function urgencyFromState(state: KnowledgeState): WeaknessFocus['urgency'] {
  if (state.errorCount >= state.successCount || state.masteryScore < 0.35) {
    return 'high';
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
