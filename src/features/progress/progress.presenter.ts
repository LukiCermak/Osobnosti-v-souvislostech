import type { ContentIndex } from '@/core/content/contentIndex';
import type { AppStoreState } from '@/state/appStore';
import type { NavigationItem } from '@/types/ui';
import type { WeaknessFocus } from '@/types/progress';
import {
  selectProgressConfusionSummaries,
  selectProgressDisciplineSummaries,
  selectProgressMetricSummary,
  selectProgressWeaknessSummaries
} from '@/features/progress/progress.selectors';

export interface ProgressPageViewModel {
  navigationItems: NavigationItem[];
  metrics: ReturnType<typeof selectProgressMetricSummary>;
  disciplineSummaries: ReturnType<typeof selectProgressDisciplineSummaries>;
  confusionSummaries: ReturnType<typeof selectProgressConfusionSummaries>;
  weaknessSummaries: ReturnType<typeof selectProgressWeaknessSummaries>;
  latestSnapshotLabel: string;
  hasData: boolean;
}

export function createProgressPageViewModel(
  state: AppStoreState,
  index: ContentIndex | undefined,
  weaknesses: WeaknessFocus[],
  navigationItems: NavigationItem[]
): ProgressPageViewModel {
  const metrics = selectProgressMetricSummary(state);

  return {
    navigationItems,
    metrics,
    disciplineSummaries: selectProgressDisciplineSummaries(state, index),
    confusionSummaries: selectProgressConfusionSummaries(state, index),
    weaknessSummaries: selectProgressWeaknessSummaries(weaknesses),
    latestSnapshotLabel: state.latestSnapshot?.capturedAt
      ? new Date(state.latestSnapshot.capturedAt).toLocaleString('cs-CZ')
      : 'Zatím bez uloženého přehledu',
    hasData: metrics.totalUnits > 0 || weaknesses.length > 0
  };
}
