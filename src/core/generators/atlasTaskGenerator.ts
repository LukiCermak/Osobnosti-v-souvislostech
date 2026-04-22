import type { ContentIndex } from '@/core/content/contentIndex';
import { summarizeEntityList } from '@/core/generators/explanationBuilder';
import type { DisciplineId, EntityId, PathRecord, RelationRecord } from '@/types/content';
import type { KnowledgeState } from '@/types/progress';
import type { AtlasTask, StudyHint, StudyUnitRef } from '@/types/study';

export interface AtlasTaskGenerationInput {
  index: ContentIndex;
  targetDisciplineIds?: DisciplineId[];
  path?: PathRecord;
  knowledgeStates?: KnowledgeState[];
  limit?: number;
}

export function generateAtlasTasks(input: AtlasTaskGenerationInput): AtlasTask[] {
  const candidateRelations = pickCandidateRelations(input);
  const limit = Math.max(1, input.limit ?? 8);

  return candidateRelations.slice(0, limit).map((relation, order) => createAtlasTask(input.index, relation, order + 1));
}

export function createAtlasTask(index: ContentIndex, relation: RelationRecord, order = 1): AtlasTask {
  const fromEntity = index.entities.get(relation.fromId);
  const toEntity = index.entities.get(relation.toId);
  const options = buildOptions(index, relation);

  const unit: StudyUnitRef = {
    id: `atlas-unit:${relation.id}`,
    kind: 'relation',
    relationId: relation.id,
    entityIds: [relation.fromId, relation.toId],
    disciplineIds: extractDisciplineIds(fromEntity, toEntity)
  };

  return {
    id: `atlas-task:${order}:${relation.id}`,
    mode: 'atlas',
    taskType: mapRelationToTaskType(relation),
    unit,
    prompt: createPrompt(index, relation),
    expectedOutcome: `${labelFor(index, relation.fromId)} patří ke vztahu ${labelFor(index, relation.toId)}.`,
    hints: createHints(index, relation),
    explanationSeedIds: [relation.fromId, relation.toId],
    relationIds: [relation.id],
    options
  };
}

function pickCandidateRelations(input: AtlasTaskGenerationInput): RelationRecord[] {
  const relationDueAt = new Map<string, string>();

  for (const state of input.knowledgeStates ?? []) {
    if (state.relationId && state.dueAt) {
      relationDueAt.set(state.relationId, state.dueAt);
    }
  }

  let relations = [...input.index.relations.values()].filter((relation) => relation.studyPriority !== 'context');

  if (input.targetDisciplineIds && input.targetDisciplineIds.length > 0) {
    const allowedEntities = new Set<EntityId>(
      input.targetDisciplineIds.flatMap((disciplineId) => [
        ...(input.index.personsByDiscipline.get(disciplineId) ?? []).map((record) => record.id),
        ...(input.index.conceptsByDiscipline.get(disciplineId) ?? []).map((record) => record.id)
      ])
    );
    relations = relations.filter((relation) => allowedEntities.has(relation.fromId) || allowedEntities.has(relation.toId));
  }

  if (input.path) {
    const allowedEntities = new Set(input.path.steps.map((step) => step.entityId));
    relations = relations.filter((relation) => allowedEntities.has(relation.fromId) || allowedEntities.has(relation.toId));
  }

  return relations.sort((left, right) => {
    const leftDueAt = relationDueAt.get(left.id);
    const rightDueAt = relationDueAt.get(right.id);
    const leftHasSchedule = leftDueAt ? 1 : 0;
    const rightHasSchedule = rightDueAt ? 1 : 0;

    if (leftHasSchedule !== rightHasSchedule) {
      return rightHasSchedule - leftHasSchedule;
    }

    if (leftDueAt && rightDueAt && leftDueAt !== rightDueAt) {
      return leftDueAt.localeCompare(rightDueAt);
    }

    return priorityWeight(left.studyPriority) - priorityWeight(right.studyPriority)
      || left.explanation.localeCompare(right.explanation, 'cs');
  });
}

function buildOptions(index: ContentIndex, relation: RelationRecord) {
  const correctLabel = labelFor(index, relation.toId);
  const distractors = [...index.entities.values()]
    .filter((entity) => entity.id !== relation.toId && entity.id !== relation.fromId)
    .slice(0, 3)
    .map((entity, indexValue) => ({
      id: `o${indexValue + 1}`,
      label: 'displayName' in entity ? entity.displayName : entity.label,
      entityId: entity.id,
      isCorrect: false
    }));

  const options = [
    {
      id: 'correct',
      label: correctLabel,
      entityId: relation.toId,
      isCorrect: true
    },
    ...distractors
  ];

  return options.sort((left, right) => left.label.localeCompare(right.label, 'cs'));
}

function createPrompt(index: ContentIndex, relation: RelationRecord): string {
  const fromLabel = labelFor(index, relation.fromId);

  switch (relation.type) {
    case 'belongs-to-discipline':
      return `Do které disciplíny v tomto učebním kontextu patří ${fromLabel}?`;
    case 'preceded':
    case 'succeeded':
      return `Která historická návaznost navazuje na entitu ${fromLabel}?`;
    case 'associated-with':
    case 'developed':
    case 'used-method':
    case 'created-system':
      return `S jakým pojmem, metodou nebo systémem je ve zdroji spojován ${fromLabel}?`;
    default:
      return `Které spojení nejlépe doplňuje vazbu k entitě ${fromLabel}?`;
  }
}

function createHints(index: ContentIndex, relation: RelationRecord): StudyHint[] {
  return [
    {
      id: `${relation.id}:hint-1`,
      title: 'První nápověda',
      text: `Zaměř se na vazbu mezi ${labelFor(index, relation.fromId)} a tím, s čím je tato osobnost nebo pojem ve zdroji výslovně spojován.`,
      unlockOrder: 1
    },
    {
      id: `${relation.id}:hint-2`,
      title: 'Druhá nápověda',
      text: `Správná odpověď patří do stejné studijní sítě jako ${summarizeEntityList(index, [relation.fromId, relation.toId])}.`,
      unlockOrder: 2
    }
  ];
}

function extractDisciplineIds(
  fromEntity: { disciplines?: DisciplineId[]; disciplineIds?: DisciplineId[] } | undefined,
  toEntity: { disciplines?: DisciplineId[]; disciplineIds?: DisciplineId[] } | undefined
): DisciplineId[] {
  return Array.from(
    new Set([...(fromEntity?.disciplines ?? fromEntity?.disciplineIds ?? []), ...(toEntity?.disciplines ?? toEntity?.disciplineIds ?? [])])
  );
}

function labelFor(index: ContentIndex, entityId: EntityId): string {
  const entity = index.entities.get(entityId);
  if (!entity) {
    return entityId;
  }

  return 'displayName' in entity ? entity.displayName : entity.label;
}

function mapRelationToTaskType(relation: RelationRecord): AtlasTask['taskType'] {
  switch (relation.type) {
    case 'worked-at':
    case 'founded':
      return 'match-person-to-institution';
    case 'preceded':
    case 'succeeded':
      return 'fill-historical-link';
    case 'developed':
    case 'used-method':
    case 'created-system':
      return 'match-person-to-method';
    case 'belongs-to-discipline':
      return 'assign-discipline';
    default:
      return 'identify-missing-node';
  }
}

function priorityWeight(priority: RelationRecord['studyPriority']): number {
  switch (priority) {
    case 'core':
      return 0;
    case 'important':
      return 1;
    case 'context':
      return 2;
  }
}
