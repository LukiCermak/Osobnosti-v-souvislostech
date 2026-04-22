import type { AppStoreState } from '@/state/appStore';
import type { AtlasFiltersState, NavigationItem } from '@/types/ui';
import type { AtlasTask } from '@/types/study';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import { selectAtlasDisciplineOptions, selectAtlasEraOptions, selectAtlasGraph, selectAtlasMapSummary, selectAtlasPathSummaries, selectAtlasRelationTypeOptions, selectAtlasTagOptions, selectWeakEntityIds, type AtlasMapSummary, type AtlasPathSummary } from '@/features/atlas/atlas.selectors';

export interface AtlasPageViewModel {
  navigationItems: NavigationItem[];
  summary: AtlasMapSummary;
  paths: AtlasPathSummary[];
  disciplineOptions: ReturnType<typeof selectAtlasDisciplineOptions>;
  eraOptions: ReturnType<typeof selectAtlasEraOptions>;
  relationTypeOptions: ReturnType<typeof selectAtlasRelationTypeOptions>;
  tagOptions: ReturnType<typeof selectAtlasTagOptions>;
  sessionTask?: AtlasTask;
  dueTodayCount: number;
  recommendedTitle: string;
  recommendedDescription: string;
  filtersActiveCount: number;
}

export function createAtlasPageViewModel(input: {
  appState: AppStoreState;
  filters: AtlasFiltersState;
  knowledgeStates?: KnowledgeState[];
  confusions?: ConfusionRecord[];
  focusEntityId?: string;
  task?: AtlasTask;
}): AtlasPageViewModel | undefined {
  const index = input.appState.contentIndex;
  if (!index) {
    return undefined;
  }

  const graph = selectAtlasGraph(index);
  const weakEntityIds = selectWeakEntityIds(input.appState, input.confusions);
  const summary = selectAtlasMapSummary({
    index,
    graph,
    filters: input.filters,
    weakEntityIds,
    focusEntityId: input.focusEntityId
  });

  const disciplineIds = input.filters.disciplineIds.length > 0
    ? input.filters.disciplineIds
    : input.appState.userProfile?.preferredDisciplineIds;

  const paths = selectAtlasPathSummaries({
    index,
    knowledgeStates: input.knowledgeStates,
    disciplineIds
  });

  const dueTodayCount = input.appState.dailyReviewPlan?.dueStateIds.length ?? 0;
  const filtersActiveCount = countActiveFilters(input.filters);

  return {
    navigationItems: navigationItems,
    summary,
    paths,
    disciplineOptions: selectAtlasDisciplineOptions(index),
    eraOptions: selectAtlasEraOptions(index),
    relationTypeOptions: selectAtlasRelationTypeOptions(index),
    tagOptions: selectAtlasTagOptions(index).slice(0, 12),
    sessionTask: input.task,
    dueTodayCount,
    recommendedTitle: summary.focusedNode
      ? `Nejlépe teď využiješ uzel ${summary.focusedNode.label}`
      : 'Začni mapovat vazby v Atlasu souvislostí',
    recommendedDescription: input.task
      ? 'Rozpracovaný atlasový blok už běží. Stačí navázat na aktuální vazbu a průběžně upevňovat slabá místa.'
      : dueTodayCount > 0
        ? `V systému čeká ${dueTodayCount} jednotek k opakování. Atlas teď pomůže znovu zasadit vazby do širších souvislostí.`
        : 'Atlas je vhodný pro orientaci v oborových sítích, historických liniích a vztazích mezi osobnostmi, pojmy a institucemi.',
    filtersActiveCount
  };
}

function countActiveFilters(filters: AtlasFiltersState): number {
  return [filters.disciplineIds, filters.eraIds, filters.relationTypes, filters.tagIds]
    .reduce((sum, values) => sum + values.length, 0) + (filters.showOnlyWeakAreas ? 1 : 0);
}

const navigationItems: NavigationItem[] = [
  { id: 'home', path: '/', label: 'Přehled' },
  { id: 'atlas', path: '/atlas', label: 'Atlas souvislostí', mode: 'atlas' },
  { id: 'cases', path: '/detektivni-spisy', label: 'Detektivní spisy', mode: 'cases' },
  { id: 'lab', path: '/laborator-rozliseni', label: 'Laboratoř rozlišení', mode: 'lab' },
  { id: 'onboarding', path: '/prvni-nastaveni', label: 'První nastavení' }
];
