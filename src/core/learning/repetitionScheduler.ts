import { isKnowledgeStable } from '@/core/learning/learningPolicy';
import type { KnowledgeState } from '@/types/progress';
import type { StudyAnswer } from '@/types/study';

export interface RepetitionDecision {
  dueAt: string;
  intervalDays: number;
  queue: 'immediate' | 'today' | 'scheduled';
}

export function scheduleNextReview(
  state: Pick<KnowledgeState, 'masteryScore' | 'stabilityScore' | 'successCount' | 'errorCount' | 'dueAt'>,
  answer: StudyAnswer
): RepetitionDecision {
  const submittedAt = new Date(answer.submittedAt);

  if (answer.accuracy === 'incorrect') {
    return {
      dueAt: addMinutes(submittedAt, 30).toISOString(),
      intervalDays: 0,
      queue: 'immediate'
    };
  }

  if (answer.accuracy === 'correct-after-hint') {
    return {
      dueAt: addHours(submittedAt, 6).toISOString(),
      intervalDays: 0,
      queue: 'today'
    };
  }

  const effectiveState = applyAnswerToHistory(state, answer);
  const intervalDays = Math.max(1, Math.floor(intervalDaysFromState(effectiveState) * multiplierForAccuracy(answer.accuracy)));

  return {
    dueAt: addDays(submittedAt, intervalDays).toISOString(),
    intervalDays,
    queue: isKnowledgeStable(effectiveState) ? 'scheduled' : 'today'
  };
}

export function isStateDueToday(dueAt?: string): boolean {
  if (!dueAt) {
    return false;
  }

  return dueAt <= new Date().toISOString();
}

function applyAnswerToHistory(
  state: Pick<KnowledgeState, 'masteryScore' | 'stabilityScore' | 'successCount' | 'errorCount'>,
  answer: StudyAnswer
): Pick<KnowledgeState, 'masteryScore' | 'stabilityScore' | 'successCount' | 'errorCount'> {
  return {
    ...state,
    successCount: state.successCount + (answer.accuracy === 'correct' || answer.accuracy === 'correct-after-hint' ? 1 : 0),
    errorCount: state.errorCount + (answer.accuracy === 'incorrect' || answer.accuracy === 'skipped' ? 1 : 0)
  };
}

function intervalDaysFromState(state: Pick<KnowledgeState, 'masteryScore' | 'stabilityScore' | 'successCount' | 'errorCount'>): number {
  const performance = Math.max(0.5, state.masteryScore + state.stabilityScore);
  const history = Math.max(1, state.successCount - state.errorCount + 1);
  return Math.min(21, Math.round(performance * history));
}

function multiplierForAccuracy(accuracy: StudyAnswer['accuracy']): number {
  switch (accuracy) {
    case 'correct':
      return 1.4;
    case 'correct-after-hint':
      return 0.5;
    case 'skipped':
      return 0.35;
    case 'incorrect':
      return 0;
  }
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function addHours(date: Date, hours: number): Date {
  const copy = new Date(date);
  copy.setUTCHours(copy.getUTCHours() + hours);
  return copy;
}

function addMinutes(date: Date, minutes: number): Date {
  const copy = new Date(date);
  copy.setUTCMinutes(copy.getUTCMinutes() + minutes);
  return copy;
}
