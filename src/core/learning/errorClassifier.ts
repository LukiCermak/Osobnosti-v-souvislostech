import type { RelationRecord } from '@/types/content';
import type { ContentIndex } from '@/core/content/contentIndex';
import type { KnowledgeProblemType } from '@/types/progress';
import type { StudyAnswer, StudyTask } from '@/types/study';

export interface ErrorClassificationResult {
  problemType: KnowledgeProblemType;
  shouldTriggerContrast: boolean;
  shouldTriggerCaseFollowUp: boolean;
  recommendedMode: StudyTask['mode'];
}

export function classifyAnswerError(index: ContentIndex, task: StudyTask, answer: StudyAnswer): ErrorClassificationResult {
  if (answer.accuracy === 'correct-after-hint') {
    return {
      problemType: 'needed-hint',
      shouldTriggerContrast: false,
      shouldTriggerCaseFollowUp: true,
      recommendedMode: 'cases'
    };
  }

  if ((task.mode === 'lab' || task.unit.kind === 'contrast-set') && answer.accuracy === 'incorrect') {
    return {
      problemType: 'similar-person-confusion',
      shouldTriggerContrast: true,
      shouldTriggerCaseFollowUp: false,
      recommendedMode: 'lab'
    };
  }

  if (task.mode === 'atlas') {
    const relation = getPrimaryRelation(index, task);
    const problemType = classifyRelationProblem(relation);
    return {
      problemType,
      shouldTriggerContrast: problemType === 'similar-person-confusion',
      shouldTriggerCaseFollowUp: problemType === 'historical-sequence',
      recommendedMode: problemType === 'historical-sequence' ? 'cases' : 'atlas'
    };
  }

  return {
    problemType: answer.accuracy === 'incorrect' ? 'active-recall-gap' : 'needed-hint',
    shouldTriggerContrast: false,
    shouldTriggerCaseFollowUp: true,
    recommendedMode: 'cases'
  };
}

function classifyRelationProblem(relation?: RelationRecord): KnowledgeProblemType {
  switch (relation?.type) {
    case 'belongs-to-discipline':
      return 'discipline-assignment';
    case 'worked-at':
    case 'founded':
      return 'institution-link';
    case 'developed':
    case 'revised':
    case 'co-authored':
      return 'test-link';
    case 'preceded':
    case 'succeeded':
      return 'historical-sequence';
    case 'contrasts-with':
      return 'similar-person-confusion';
    default:
      return 'active-recall-gap';
  }
}

function getPrimaryRelation(index: ContentIndex, task: Extract<StudyTask, { mode: 'atlas' }>): RelationRecord | undefined {
  return task.relationIds.map((relationId) => index.relations.get(relationId)).find(isDefined);
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
