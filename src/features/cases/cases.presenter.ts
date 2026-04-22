import type { AppStoreState } from '@/state/appStore';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import { selectCaseList, selectRecommendedCaseId } from '@/features/cases/cases.selectors';
import { getEntityLabel } from '@/core/content/contentIndex';
import type { NavigationItem } from '@/types/ui';

export interface CasesPageViewModel {
  navigationItems: NavigationItem[];
  caseItems: ReturnType<typeof selectCaseList>;
  recommendedCaseId?: string;
  recommendedTitle: string;
  recommendedDescription: string;
  dueTodayCount: number;
}

export function createCasesPageViewModel(input: {
  appState: AppStoreState;
  knowledgeStates?: KnowledgeState[];
  confusions?: ConfusionRecord[];
}): CasesPageViewModel | undefined {
  const index = input.appState.contentIndex;
  if (!index) {
    return undefined;
  }

  const caseItems = selectCaseList({
    index,
    knowledgeStates: input.knowledgeStates,
    confusions: input.confusions,
    preferredDisciplineIds: input.appState.userProfile?.preferredDisciplineIds
  });

  const recommendedCaseId = selectRecommendedCaseId({
    appState: input.appState,
    knowledgeStates: input.knowledgeStates,
    confusions: input.confusions
  });

  const recommendedRecord = recommendedCaseId ? index.cases.get(recommendedCaseId) : undefined;
  const recommendedLabels = recommendedRecord
    ? recommendedRecord.targetEntityIds.slice(0, 3).map((entityId) => getEntityLabel(index, entityId)).join(', ')
    : undefined;
  const dueTodayCount = input.appState.dailyReviewPlan?.dueStateIds.length ?? 0;

  return {
    navigationItems,
    caseItems,
    recommendedCaseId,
    recommendedTitle: recommendedRecord
      ? `Doporučený spis: ${recommendedRecord.title}`
      : 'Začni novým detektivním spisem',
    recommendedDescription: recommendedRecord
      ? `Tento spis se hodí pro hlubší rekonstrukci souvislostí mezi entitami ${recommendedLabels}.`
      : dueTodayCount > 0
        ? `V systému čeká ${dueTodayCount} jednotek k opakování. Detektivní spis pomůže vrátit vazby do hlubšího kontextu.`
        : 'Detektivní spisy vedou od obecných stop ke konkrétním vazbám a k závěrečné syntéze.',
    dueTodayCount
  };
}

const navigationItems: NavigationItem[] = [
  { id: 'home', path: '/', label: 'Přehled' },
  { id: 'atlas', path: '/atlas', label: 'Atlas souvislostí', mode: 'atlas' },
  { id: 'cases', path: '/detektivni-spisy', label: 'Detektivní spisy', mode: 'cases' },
  { id: 'lab', path: '/laborator-rozliseni', label: 'Laboratoř rozlišení', mode: 'lab' },
  { id: 'onboarding', path: '/prvni-nastaveni', label: 'První nastavení' }
];
