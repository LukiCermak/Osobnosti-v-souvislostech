import type { ContentIndex } from '@/core/content/contentIndex';
import { rankContrastSets, resolveContrastEntityLabels } from '@/core/graph/contrastResolver';
import type { ContrastSetRecord } from '@/types/content';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import type { LabTask, StudyHint, StudyUnitRef } from '@/types/study';

export interface LabTaskGenerationInput {
  index: ContentIndex;
  confusions?: ConfusionRecord[];
  knowledgeStates?: KnowledgeState[];
  limit?: number;
}

export function generateLabTasks(input: LabTaskGenerationInput): LabTask[] {
  const rankedSets = rankContrastSets(input.index, input.confusions, input.knowledgeStates);
  return rankedSets.slice(0, Math.max(1, input.limit ?? 8)).map((item, order) => createLabTask(input.index, item.record, order + 1));
}

export function createLabTask(index: ContentIndex, contrastSet: ContrastSetRecord, order = 1): LabTask {
  const options = contrastSet.personIds.map((personId, indexValue) => ({
    id: `person-${indexValue + 1}`,
    label: resolveContrastEntityLabels(index, [personId])[0],
    isCorrect: indexValue === 0
  }));

  const unit: StudyUnitRef = {
    id: `lab-unit:${contrastSet.id}`,
    kind: 'contrast-set',
    contrastSetId: contrastSet.id,
    entityIds: [...contrastSet.personIds, ...contrastSet.relatedEntityIds],
    disciplineIds: collectDisciplineIds(index, contrastSet)
  };

  return {
    id: `lab-task:${order}:${contrastSet.id}`,
    mode: 'lab',
    contrastSetId: contrastSet.id,
    microtaskType: contrastSet.microtaskTypes[0] ?? 'definition-discrimination',
    unit,
    prompt: createPrompt(contrastSet),
    expectedOutcome: contrastSet.distinguishingFeature,
    hints: createLabHints(contrastSet),
    explanationSeedIds: contrastSet.personIds,
    options
  };
}

function createPrompt(contrastSet: ContrastSetRecord): string {
  return `Rozliš, které jméno nejlépe odpovídá rozlišovacímu znaku této sady: ${contrastSet.distinguishingFeature}`;
}

function createLabHints(contrastSet: ContrastSetRecord): StudyHint[] {
  return [
    {
      id: `${contrastSet.id}:hint-1`,
      title: 'Proč se tato sada vrací',
      text: contrastSet.confusionReason,
      unlockOrder: 1
    },
    {
      id: `${contrastSet.id}:hint-2`,
      title: 'Rozlišovací znak',
      text: contrastSet.distinguishingFeature,
      unlockOrder: 2
    }
  ];
}

function collectDisciplineIds(index: ContentIndex, contrastSet: ContrastSetRecord): string[] {
  const ids = new Set<string>();
  for (const personId of contrastSet.personIds) {
    const person = index.people.get(personId);
    for (const disciplineId of person?.disciplines ?? []) {
      ids.add(disciplineId);
    }
  }
  return [...ids];
}
