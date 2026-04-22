import type { CaseRecord, EntityId } from '@/types/content';
import type { ContentIndex } from '@/core/content/contentIndex';
import { summarizeEntityList } from '@/core/generators/explanationBuilder';
import type { CaseTask, StudyHint, StudyUnitRef } from '@/types/study';

export interface CaseGenerationInput {
  index: ContentIndex;
  targetCaseId?: string;
  limit?: number;
}

export function generateCaseTasks(input: CaseGenerationInput): CaseTask[] {
  const sourceCases = input.targetCaseId ? [input.index.cases.get(input.targetCaseId)].filter(isDefined) : [...input.index.cases.values()];
  return sourceCases.slice(0, Math.max(1, input.limit ?? sourceCases.length)).map((record, order) => createCaseTask(input.index, record, order + 1));
}

export function createCaseTask(index: ContentIndex, record: CaseRecord, order = 1): CaseTask {
  const clueSequence = sortClues(record).map((clue) => clue.id);
  const questionIds = record.questions.map((question) => question.id);
  const unit: StudyUnitRef = {
    id: `case-unit:${record.id}`,
    kind: 'case',
    caseId: record.id,
    entityIds: record.targetEntityIds,
    disciplineIds: extractDisciplineIds(index, record.targetEntityIds)
  };

  return {
    id: `case-task:${order}:${record.id}`,
    mode: 'cases',
    unit,
    caseId: record.id,
    prompt: record.goal,
    expectedOutcome: record.followUpExplanation,
    hints: createCaseHints(record),
    explanationSeedIds: record.targetEntityIds,
    clueSequence,
    questionIds,
    synthesisPrompt: `Shrň, jak spolu ve zdroji souvisejí: ${summarizeEntityList(index, record.targetEntityIds)}.`
  };
}

function createCaseHints(record: CaseRecord): StudyHint[] {
  return sortClues(record).slice(0, 3).map((clue, indexValue) => ({
    id: `${record.id}:hint:${clue.id}`,
    title: clue.title,
    text: clue.text,
    unlockOrder: indexValue + 1
  }));
}

function sortClues(record: CaseRecord) {
  return [...record.clues].sort((left, right) => left.weight - right.weight || left.title.localeCompare(right.title, 'cs'));
}

function extractDisciplineIds(index: ContentIndex, entityIds: EntityId[]): string[] {
  const ids = new Set<string>();

  for (const entityId of entityIds) {
    const entity = index.entities.get(entityId);
    if (!entity) {
      continue;
    }

    if ('disciplines' in entity) {
      for (const disciplineId of entity.disciplines) {
        ids.add(disciplineId);
      }
    } else {
      for (const disciplineId of entity.disciplineIds) {
        ids.add(disciplineId);
      }
    }
  }

  return [...ids];
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
