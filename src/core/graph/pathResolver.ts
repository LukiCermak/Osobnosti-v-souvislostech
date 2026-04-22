import type { DisciplineId, EntityId, PathRecord } from '@/types/content';
import type { ContentIndex } from '@/core/content/contentIndex';
import type { KnowledgeState } from '@/types/progress';

export interface ResolvedPathStep {
  id: string;
  entityId: EntityId;
  label: string;
  role: PathRecord['steps'][number]['role'];
  prompt?: string;
  mastered: boolean;
}

export interface ResolvedPath {
  id: string;
  title: string;
  didacticGoal: string;
  disciplineIds: DisciplineId[];
  completionRatio: number;
  nextUnmasteredStepId?: string;
  steps: ResolvedPathStep[];
}

export function resolvePath(index: ContentIndex, pathId: string, knowledgeStates: KnowledgeState[] = []): ResolvedPath | undefined {
  const path = index.paths.get(pathId);
  if (!path) {
    return undefined;
  }

  const masteredEntityIds = new Set(
    knowledgeStates
      .filter((state) => state.masteryScore >= 0.7)
      .flatMap((state) => state.entityIds)
  );

  const steps = path.steps.map((step) => ({
    id: step.id,
    entityId: step.entityId,
    label: getEntityLabel(index, step.entityId),
    role: step.role,
    prompt: step.prompt,
    mastered: masteredEntityIds.has(step.entityId)
  }));

  const masteredCount = steps.filter((step) => step.mastered).length;

  return {
    id: path.id,
    title: path.title,
    didacticGoal: path.didacticGoal,
    disciplineIds: path.disciplineIds,
    completionRatio: steps.length === 0 ? 0 : masteredCount / steps.length,
    nextUnmasteredStepId: steps.find((step) => !step.mastered)?.id,
    steps
  };
}

export function listPathsForDiscipline(index: ContentIndex, disciplineId: DisciplineId): PathRecord[] {
  return [...(index.pathsByDiscipline.get(disciplineId) ?? [])];
}

export function getPathCandidateEntityIds(path: PathRecord): EntityId[] {
  return Array.from(new Set(path.steps.map((step) => step.entityId)));
}

function getEntityLabel(index: ContentIndex, entityId: EntityId): string {
  const entity = index.entities.get(entityId);
  if (!entity) {
    return entityId;
  }

  return 'displayName' in entity ? entity.displayName : entity.label;
}
