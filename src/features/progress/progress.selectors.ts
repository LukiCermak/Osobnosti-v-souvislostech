import type { ContentIndex } from '@/core/content/contentIndex';
import type { AppStoreState } from '@/state/appStore';
import type { WeaknessFocus } from '@/types/progress';

export interface ProgressMetricSummary {
  totalUnits: number;
  masteredUnits: number;
  unstableUnits: number;
  dueToday: number;
  completionRatio: number;
}

export interface ProgressDisciplineSummary {
  id: string;
  label: string;
  mastered: number;
  total: number;
  unstable: number;
  subtitle: string;
}

export interface ProgressConfusionSummary {
  id: string;
  label: string;
  value: number;
  detail: string;
}

export interface ProgressWeaknessSummary {
  id: string;
  title: string;
  detail: string;
  urgency: WeaknessFocus['urgency'];
}

export function selectProgressMetricSummary(state: AppStoreState): ProgressMetricSummary {
  const snapshot = state.latestSnapshot;
  const totalUnits = snapshot?.totalUnits ?? 0;
  const masteredUnits = snapshot?.masteredUnits ?? 0;
  const unstableUnits = snapshot?.unstableUnits ?? 0;
  const dueToday = snapshot?.dueToday ?? state.dailyReviewPlan?.dueStateIds.length ?? 0;

  return {
    totalUnits,
    masteredUnits,
    unstableUnits,
    dueToday,
    completionRatio: totalUnits > 0 ? masteredUnits / totalUnits : 0
  };
}

export function selectProgressDisciplineSummaries(state: AppStoreState, _index?: ContentIndex): ProgressDisciplineSummary[] {
  const coverage = state.latestSnapshot?.disciplineCoverage ?? [];

  return coverage
    .map((item) => ({
      id: item.disciplineId,
      label: resolveDisciplineLabel(item.disciplineId),
      mastered: item.mastered,
      total: item.total,
      unstable: item.unstable,
      subtitle: `${item.mastered} upevněno, ${item.unstable} nestabilní`
    }))
    .sort((left, right) => right.total - left.total || left.label.localeCompare(right.label, 'cs'));
}

export function selectProgressConfusionSummaries(state: AppStoreState, index?: ContentIndex): ProgressConfusionSummary[] {
  const confusions = state.latestSnapshot?.topConfusions ?? [];

  return confusions.map((item) => ({
    id: `${item.sourceEntityId}:${item.confusedWithEntityId}`,
    label: `${getEntityLabel(index, item.sourceEntityId)} × ${getEntityLabel(index, item.confusedWithEntityId)}`,
    value: Math.max(0.12, Math.min(1, item.count / 5)),
    detail: `Četnost záměny: ${item.count}`
  }));
}

export function selectProgressWeaknessSummaries(weaknesses: WeaknessFocus[]): ProgressWeaknessSummary[] {
  return weaknesses.map((item) => ({
    id: item.id,
    title: item.title,
    detail: buildWeaknessDetail(item),
    urgency: item.urgency
  }));
}

function buildWeaknessDetail(item: WeaknessFocus): string {
  const disciplinePart = item.disciplineId ? `Disciplína: ${resolveDisciplineLabel(item.disciplineId)}.` : '';
  const relationPart = item.relationIds.length > 0 ? ` Vazeb k upevnění: ${item.relationIds.length}.` : '';
  const urgencyPart = item.urgency === 'high' ? ' Vyžaduje rychlý návrat.' : item.urgency === 'medium' ? ' Vyplatí se zařadit do nejbližší relace.' : ' Stačí průběžné upevnění.';
  return `${disciplinePart}${relationPart}${urgencyPart}`.trim();
}

function getEntityLabel(index: ContentIndex | undefined, entityId: string): string {
  const entity = index?.entities.get(entityId);
  if (!entity) {
    return entityId;
  }

  return 'displayName' in entity ? entity.displayName : entity.label;
}

function resolveDisciplineLabel(disciplineId: string): string {
  return disciplineLabelMap[disciplineId] ?? disciplineId;
}

const disciplineLabelMap: Record<string, string> = {
  'specialni-pedagogika-a-dejiny-oboru': 'Speciální pedagogika a dějiny oboru',
  psychopedie: 'Psychopedie',
  somatopedie: 'Somatopedie',
  logopedie: 'Logopedie',
  surdopedie: 'Surdopedie',
  tyflopedie: 'Tyflopedie',
  etopedie: 'Etopedie',
  'diagnostika-a-psychometrie': 'Diagnostika a psychometrie',
  'psychologie-psychiatrie-a-psychoterapie': 'Psychologie, psychiatrie a psychoterapie',
  'andragogika-a-gerontagogika': 'Andragogika a gerontagogika',
  'novodoba-ceska-tradice-a-institucni-rozvoj': 'Novodobá česká tradice a institucionální rozvoj'
};
