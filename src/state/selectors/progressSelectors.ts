import type { AppStoreState } from '@/state/appStore';

export function selectMasteredUnits(state: AppStoreState): number {
  return state.latestSnapshot?.masteredUnits ?? 0;
}

export function selectUnstableUnits(state: AppStoreState): number {
  return state.latestSnapshot?.unstableUnits ?? 0;
}

export function selectTopConfusions(state: AppStoreState) {
  return state.latestSnapshot?.topConfusions ?? [];
}

export function selectDisciplineCoverage(state: AppStoreState) {
  return state.latestSnapshot?.disciplineCoverage ?? [];
}

export function selectReviewQueueCount(state: AppStoreState): number {
  return state.dailyReviewPlan?.dueStateIds.length ?? 0;
}
