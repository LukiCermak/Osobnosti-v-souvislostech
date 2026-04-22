import type { AppStoreState } from '@/state/appStore';
import type { LabTask } from '@/types/study';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import { selectLabConfusionSummaries, selectLabContrastSummaries, selectLabNavigationItems, selectRecommendedContrastSetId, type LabContrastSummary, type LabConfusionSummary } from '@/features/lab/lab.selectors';

export interface LabPageViewModel {
  navigationItems: ReturnType<typeof selectLabNavigationItems>;
  recommendedTitle: string;
  recommendedDescription: string;
  contrastSets: LabContrastSummary[];
  topConfusions: LabConfusionSummary[];
  recommendedContrastSetId?: string;
  dueTodayCount: number;
  hasHistory: boolean;
  currentTask?: LabTask;
}

export function createLabPageViewModel(input: {
  appState: AppStoreState;
  knowledgeStates?: KnowledgeState[];
  confusions?: ConfusionRecord[];
  currentTask?: LabTask;
}): LabPageViewModel | undefined {
  if (!input.appState.contentIndex) {
    return undefined;
  }

  const contrastSets = selectLabContrastSummaries({
    index: input.appState.contentIndex,
    confusions: input.confusions,
    knowledgeStates: input.knowledgeStates,
    disciplineIds: input.appState.userProfile?.preferredDisciplineIds
  });

  const topConfusions = selectLabConfusionSummaries(input.appState.contentIndex, input.confusions ?? []);
  const recommendedContrastSetId = selectRecommendedContrastSetId({ appState: input.appState, summaries: contrastSets });
  const dueTodayCount = input.appState.dailyReviewPlan?.dueStateIds.length ?? 0;
  const hasHistory = (input.confusions?.length ?? 0) > 0 || (input.knowledgeStates?.length ?? 0) > 0;

  const recommendedSummary = contrastSets.find((item) => item.id === recommendedContrastSetId) ?? contrastSets[0];

  return {
    navigationItems: selectLabNavigationItems(),
    recommendedTitle: recommendedSummary
      ? `Začni rozlišovacím blokem ${recommendedSummary.title}`
      : 'Začni krátkým rozlišovacím blokem',
    recommendedDescription: recommendedSummary
      ? recommendedSummary.confusionReason
      : 'Laboratoř se zaměří na nejčastější záměny a rychle vrátí to, co potřebuješ upevnit.',
    contrastSets,
    topConfusions,
    recommendedContrastSetId,
    dueTodayCount,
    hasHistory,
    currentTask: input.currentTask
  };
}
