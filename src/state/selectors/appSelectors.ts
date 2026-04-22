import type { AppStoreState } from '@/state/appStore';
import { formatStorageUsage } from '@/services/storage/storageHealth';

export function selectIsAppReady(state: AppStoreState): boolean {
  return state.bootstrapStatus === 'ready' && Boolean(state.contentIndex);
}

export function selectNeedsOnboarding(state: AppStoreState): boolean {
  return Boolean(state.userProfile?.isFirstRun);
}

export function selectHasResumeSession(state: AppStoreState): boolean {
  return Boolean(state.resumeSession && (state.resumeSession.status === 'active' || state.resumeSession.status === 'paused'));
}

export function selectDueTodayCount(state: AppStoreState): number {
  return state.dailyReviewPlan?.dueStateIds.length ?? 0;
}

export function selectRecommendedMode(state: AppStoreState): string | undefined {
  return state.activeMode ?? state.dailyReviewPlan?.recommendedModes[0] ?? state.resumeSession?.mode;
}

export function selectPreferredDisciplineCount(state: AppStoreState): number {
  return state.userProfile?.preferredDisciplineIds.length ?? 0;
}

export function selectStorageUsageLabel(state: AppStoreState): string {
  return state.storageHealth ? formatStorageUsage(state.storageHealth.estimate) : '';
}
