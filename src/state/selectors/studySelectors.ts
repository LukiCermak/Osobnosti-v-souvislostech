import type { StudyStoreState } from '@/state/studyStore';
import type { StudyTask } from '@/types/study';

export function selectCurrentTask(state: StudyStoreState): StudyTask | undefined {
  return state.tasks[state.currentTaskIndex];
}

export function selectCompletedTaskCount(state: StudyStoreState): number {
  return state.session?.completedTaskIds.length ?? 0;
}

export function selectRemainingTaskCount(state: StudyStoreState): number {
  const current = state.tasks[state.currentTaskIndex] ? 1 : 0;
  return Math.max(0, state.tasks.length - state.currentTaskIndex - current);
}

export function selectSessionProgressRatio(state: StudyStoreState): number {
  if (state.tasks.length === 0) {
    return 0;
  }

  return (state.session?.completedTaskIds.length ?? 0) / state.tasks.length;
}

export function selectCanResumeStudy(state: StudyStoreState): boolean {
  return Boolean(state.session && (state.session.status === 'active' || state.session.status === 'paused'));
}
