import type { KnowledgeState } from '@/types/progress';
import type { StudyAnswer } from '@/types/study';
import { isKnowledgeStable } from '@/core/learning/learningPolicy';

export interface RepetitionDecision {
  dueAt: string;
  intervalDays: number;
  queue: 'immediate' | 'today' | 'scheduled';
}

export function scheduleNextReview(state: Pick<KnowledgeState, 'masteryScore' | 'stabilityScore' | 'successCount' | 'errorCount' | 'dueAt'>, answer: StudyAnswer): RepetitionDecision {
  const baseDays = intervalDaysFromState(state);
  const multiplier = multiplierForAccuracy(answer.accuracy);
  const intervalDays = Math.max(answer.accuracy === 'incorrect' ? 0 : 1, Math.round(baseDays * multiplier));

  if (answer.accuracy === 'incorrect') {
    return {
      dueAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      intervalDays: 0,
      queue: 'immediate'
    };
  }

  if (answer.accuracy === 'correct-after-hint') {
    return {
      dueAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      intervalDays: 0,
      queue: 'today'
    };
  }

  return {
    dueAt: addDays(new Date(), intervalDays).toISOString(),
    intervalDays,
    queue: isKnowledgeStable(state) ? 'scheduled' : 'today'
  };
}

export function isStateDueToday(dueAt?: string): boolean {
  if (!dueAt) {
    return false;
  }

  return dueAt <= new Date().toISOString();
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
  copy.setDate(copy.getDate() + days);
  return copy;
}
