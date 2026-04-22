import type { ContentIndex } from '@/core/content/contentIndex';
import type { AppStoreState } from '@/state/appStore';
import type { KnowledgeStateRow } from '@/types/database';
import type { NavigationItem } from '@/types/ui';
import type { StudyMode } from '@/types/study';

export interface ReviewQueueItemViewModel {
  id: string;
  title: string;
  subtitle: string;
  dueLabel: string;
  recommendedMode: StudyMode;
}

export interface ReviewPageViewModel {
  navigationItems: NavigationItem[];
  dueCount: number;
  recommendedMode: StudyMode;
  recommendedModeLabel: string;
  queueItems: ReviewQueueItemViewModel[];
}

export function createReviewPageViewModel(
  state: AppStoreState,
  index: ContentIndex | undefined,
  dueRows: KnowledgeStateRow[],
  navigationItems: NavigationItem[]
): ReviewPageViewModel {
  const recommendedMode = state.dailyReviewPlan?.recommendedModes[0] ?? state.activeMode ?? 'lab';

  return {
    navigationItems,
    dueCount: dueRows.length,
    recommendedMode,
    recommendedModeLabel: resolveModeLabel(recommendedMode),
    queueItems: dueRows.map((row) => ({
      id: row.id,
      title: resolveRowTitle(row, index),
      subtitle: resolveRowSubtitle(row),
      dueLabel: row.dueAt ? new Date(row.dueAt).toLocaleString('cs-CZ') : 'Ihned k opakování',
      recommendedMode: (row.lastMode as StudyMode | undefined) ?? recommendedModeForRow(row)
    }))
  };
}

function resolveRowTitle(row: KnowledgeStateRow, index?: ContentIndex): string {
  const firstEntityId = row.entityIds[0];
  const entity = firstEntityId ? index?.entities.get(firstEntityId) : undefined;
  if (entity) {
    return 'displayName' in entity ? entity.displayName : entity.label;
  }

  if (row.relationId && index?.relations.has(row.relationId)) {
    const relation = index.relations.get(row.relationId);
    return relation ? relation.explanation : row.relationId;
  }

  return row.id;
}

function resolveRowSubtitle(row: KnowledgeStateRow): string {
  if (row.contrastSetId) {
    return 'Rozlišovací blok čeká na zopakování.';
  }
  if (row.pathId) {
    return 'Studijní trasa potřebuje navázání.';
  }
  if (row.relationId) {
    return 'Vazba potřebuje další upevnění.';
  }
  return 'Jednotka čeká na další opakování.';
}

function recommendedModeForRow(row: KnowledgeStateRow): StudyMode {
  if (row.contrastSetId || row.activeProblemType === 'similar-person-confusion') {
    return 'lab';
  }
  if (row.pathId || row.activeProblemType === 'historical-sequence') {
    return 'atlas';
  }
  return 'cases';
}

function resolveModeLabel(mode: StudyMode): string {
  switch (mode) {
    case 'atlas':
      return 'Atlas souvislostí';
    case 'cases':
      return 'Detektivní spisy';
    case 'lab':
      return 'Laboratoř rozlišení';
  }
}
