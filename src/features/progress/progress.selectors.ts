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

export function selectProgressDisciplineSummaries(
  state: AppStoreState,
  index?: ContentIndex
): ProgressDisciplineSummary[] {
  const coverage = state.latestSnapshot?.disciplineCoverage ?? [];

  return coverage
    .map((item) => ({
      id: item.disciplineId,
      label: resolveDisciplineLabel(item.disciplineId, index),
      mastered: item.mastered,
      total: item.total,
      unstable: item.unstable,
      subtitle: `${item.mastered} upevněno, ${item.unstable} nestabilní`
    }))
    .sort((left, right) => right.total - left.total || left.label.localeCompare(right.label, 'cs'));
}

export function selectProgressConfusionSummaries(
  state: AppStoreState,
  index?: ContentIndex
): ProgressConfusionSummary[] {
  const confusions = state.latestSnapshot?.topConfusions ?? [];

  return confusions.map((item) => ({
    id: `${item.sourceEntityId}:${item.confusedWithEntityId}`,
    label: `${getEntityLabel(index, item.sourceEntityId)} × ${getEntityLabel(index, item.confusedWithEntityId)}`,
    value: Math.max(0.12, Math.min(1, item.count / 5)),
    detail: `Četnost záměny: ${item.count}`
  }));
}

export function selectProgressWeaknessSummaries(
  weaknesses: WeaknessFocus[],
  index?: ContentIndex
): ProgressWeaknessSummary[] {
  return weaknesses.map((item) => ({
    id: item.id,
    title: buildWeaknessTitle(item, index),
    detail: buildWeaknessDetail(item, index),
    urgency: item.urgency
  }));
}

function buildWeaknessTitle(item: WeaknessFocus, index?: ContentIndex): string {
  if (item.relationIds.length > 0) {
    const relation = index?.relations.get(item.relationIds[0]);
    if (relation) {
      return relation.explanation;
    }
  }

  if (item.contrastSetId) {
    const contrastSet = index?.contrastSets.get(item.contrastSetId);
    if (contrastSet) {
      return contrastSet.title;
    }
  }

  if (item.pathId) {
    const path = index?.paths.get(item.pathId);
    if (path) {
      return path.title;
    }
  }

  if (item.entityIds && item.entityIds.length > 0) {
    return item.entityIds.map((entityId) => getEntityLabel(index, entityId)).join(' × ');
  }

  return item.title;
}

function buildWeaknessDetail(item: WeaknessFocus, index?: ContentIndex): string {
  const disciplinePart = item.disciplineId ? `Disciplína: ${resolveDisciplineLabel(item.disciplineId, index)}.` : '';
  const relationPart = item.relationIds.length > 0 ? ` Vazeb k upevnění: ${item.relationIds.length}.` : '';
  const entityPart = item.entityIds && item.entityIds.length > 1
    ? ` Zaměřeno na ${item.entityIds.map((entityId) => getEntityLabel(index, entityId)).join(' a ')}.`
    : '';
  const urgencyPart = item.urgency === 'high'
    ? ' Vyžaduje rychlý návrat.'
    : item.urgency === 'medium'
      ? ' Vyplatí se zařadit do nejbližší relace.'
      : ' Stačí průběžné upevnění.';

  return `${disciplinePart}${relationPart}${entityPart}${urgencyPart}`.trim();
}

function getEntityLabel(index: ContentIndex | undefined, entityId: string): string {
  const entity = index?.entities.get(entityId);
  if (!entity) {
    return entityId;
  }

  return 'displayName' in entity ? entity.displayName : entity.label;
}

function resolveDisciplineLabel(disciplineId: string, index?: ContentIndex): string {
  if (disciplineLabelMap[disciplineId]) {
    return disciplineLabelMap[disciplineId];
  }

  const entityFromPeople = index?.personsByDiscipline.get(disciplineId)?.[0];
  if (entityFromPeople) {
    return entityFromPeople.disciplines[0] ?? disciplineId;
  }

  const entityFromConcepts = index?.conceptsByDiscipline.get(disciplineId)?.[0];
  if (entityFromConcepts) {
    return entityFromConcepts.disciplineIds[0] ?? disciplineId;
  }

  return disciplineId;
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
