import type { AnswerAccuracy, StudyMode } from '@/types/study';
import type { KnowledgeProblemType, KnowledgeState } from '@/types/progress';

export const DEFAULT_SESSION_TASK_COUNT = 8;
export const DEFAULT_MASTERY_THRESHOLD = 0.75;
export const DEFAULT_STABILITY_THRESHOLD = 0.65;
export const MAX_MASTERY_SCORE = 1;
export const MIN_MASTERY_SCORE = 0;

export function recommendedModeForProblem(problemType?: KnowledgeProblemType): StudyMode {
  switch (problemType) {
    case 'similar-person-confusion':
      return 'lab';
    case 'historical-sequence':
      return 'atlas';
    case 'institution-link':
    case 'test-link':
    case 'discipline-assignment':
      return 'atlas';
    case 'needed-hint':
    case 'active-recall-gap':
      return 'cases';
    default:
      return 'atlas';
  }
}

export function masteryDeltaForAccuracy(accuracy: AnswerAccuracy): number {
  switch (accuracy) {
    case 'correct':
      return 0.18;
    case 'correct-after-hint':
      return 0.06;
    case 'skipped':
      return -0.08;
    case 'incorrect':
      return -0.16;
  }
}

export function stabilityDeltaForAccuracy(accuracy: AnswerAccuracy): number {
  switch (accuracy) {
    case 'correct':
      return 0.12;
    case 'correct-after-hint':
      return 0.03;
    case 'skipped':
      return -0.05;
    case 'incorrect':
      return -0.12;
  }
}

export function isKnowledgeStable(state: Pick<KnowledgeState, 'masteryScore' | 'stabilityScore'>): boolean {
  return state.masteryScore >= DEFAULT_MASTERY_THRESHOLD && state.stabilityScore >= DEFAULT_STABILITY_THRESHOLD;
}
