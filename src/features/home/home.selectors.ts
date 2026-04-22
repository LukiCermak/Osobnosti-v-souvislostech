import type { AppStoreState } from '@/state/appStore';
import type { ContentIndex } from '@/core/content/contentIndex';
import type { DisciplineId } from '@/types/content';
import type { StudyMode } from '@/types/study';
import type { KnowledgeProblemType } from '@/types/progress';

export interface HomeDisciplineSummary {
  id: DisciplineId;
  totalPeople: number;
  totalConcepts: number;
  totalUnits: number;
}

export interface HomeWeaknessSummary {
  id: string;
  label: string;
  value: number;
  detail: string;
}

export function selectHomeDisciplineSummaries(state: AppStoreState): HomeDisciplineSummary[] {
  const index = state.contentIndex;
  if (!index) {
    return [];
  }

  const preferredIds = state.userProfile?.preferredDisciplineIds ?? [];
  const sourceIds = preferredIds.length > 0 ? preferredIds : Array.from(index.personsByDiscipline.keys()).slice(0, 6);

  return sourceIds
    .map((disciplineId) => buildHomeDisciplineSummary(index, disciplineId))
    .filter((item): item is HomeDisciplineSummary => Boolean(item))
    .sort((left, right) => right.totalUnits - left.totalUnits);
}

export function selectHomeWeaknessSummaries(state: AppStoreState): HomeWeaknessSummary[] {
  const index = state.contentIndex;
  const confusions = state.latestSnapshot?.topConfusions ?? [];

  if (!index || confusions.length === 0) {
    return [];
  }

  return confusions.slice(0, 8).map((item) => ({
    id: `${item.sourceEntityId}:${item.confusedWithEntityId}`,
    label: `${getEntityLabel(index, item.sourceEntityId)} × ${getEntityLabel(index, item.confusedWithEntityId)}`,
    value: normalizeConfusionValue(item.count),
    detail: `Četnost záměny: ${item.count}`
  }));
}

export function selectHomeCompletionRatio(state: AppStoreState): number {
  const snapshot = state.latestSnapshot;
  if (!snapshot || snapshot.totalUnits <= 0) {
    return 0;
  }

  return snapshot.masteredUnits / snapshot.totalUnits;
}

export function selectHomeRecommendedReason(state: AppStoreState): KnowledgeProblemType | 'resume' | 'first-run' | 'steady-progress' {
  if (state.userProfile?.isFirstRun) {
    return 'first-run';
  }

  if (state.resumeSession) {
    return 'resume';
  }

  const primaryProblem = state.latestSnapshot?.topConfusions[0];
  if (primaryProblem) {
    return 'similar-person-confusion';
  }

  return 'steady-progress';
}

export function selectHomeRecommendedMode(state: AppStoreState): StudyMode {
  return state.activeMode ?? state.dailyReviewPlan?.recommendedModes[0] ?? state.resumeSession?.mode ?? 'atlas';
}

function buildHomeDisciplineSummary(index: ContentIndex, disciplineId: DisciplineId): HomeDisciplineSummary | undefined {
  const people = index.personsByDiscipline.get(disciplineId) ?? [];
  const concepts = index.conceptsByDiscipline.get(disciplineId) ?? [];

  if (people.length === 0 && concepts.length === 0) {
    return undefined;
  }

  return {
    id: disciplineId,
    totalPeople: people.length,
    totalConcepts: concepts.length,
    totalUnits: people.length + concepts.length
  };
}

function getEntityLabel(index: ContentIndex, entityId: string): string {
  const entity = index.entities.get(entityId);
  if (!entity) {
    return entityId;
  }

  return 'displayName' in entity ? entity.displayName : entity.label;
}

function normalizeConfusionValue(count: number): number {
  return Math.max(0.12, Math.min(1, count / 5));
}
