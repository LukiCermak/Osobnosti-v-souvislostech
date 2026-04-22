import type {
  CaseRecord,
  ConceptRecord,
  ContrastSetRecord,
  DisciplineId,
  EntityId,
  PathRecord,
  PersonRecord,
  RelationRecord,
  RelationType,
  TagId
} from '@/types/content';
import {
  createRuntimeContentMaps,
  type RuntimeContentBundle,
  type RuntimeContentMaps
} from '@/core/content/contentNormalizer';

export interface ContentIndex extends RuntimeContentMaps {
  entities: Map<EntityId, PersonRecord | ConceptRecord>;
  outgoingRelations: Map<EntityId, RelationRecord[]>;
  incomingRelations: Map<EntityId, RelationRecord[]>;
  relationsByType: Map<RelationType, RelationRecord[]>;
  personsByDiscipline: Map<DisciplineId, PersonRecord[]>;
  conceptsByDiscipline: Map<DisciplineId, ConceptRecord[]>;
  pathsByDiscipline: Map<DisciplineId, PathRecord[]>;
  casesByEntity: Map<EntityId, CaseRecord[]>;
  contrastSetsByEntity: Map<EntityId, ContrastSetRecord[]>;
  entitiesByTag: Map<TagId, EntityId[]>;
}

export function buildContentIndex(bundle: RuntimeContentBundle): ContentIndex {
  const maps = createRuntimeContentMaps(bundle);
  const entities = new Map<EntityId, PersonRecord | ConceptRecord>();
  const outgoingRelations = new Map<EntityId, RelationRecord[]>();
  const incomingRelations = new Map<EntityId, RelationRecord[]>();
  const relationsByType = new Map<RelationType, RelationRecord[]>();
  const personsByDiscipline = new Map<DisciplineId, PersonRecord[]>();
  const conceptsByDiscipline = new Map<DisciplineId, ConceptRecord[]>();
  const pathsByDiscipline = new Map<DisciplineId, PathRecord[]>();
  const casesByEntity = new Map<EntityId, CaseRecord[]>();
  const contrastSetsByEntity = new Map<EntityId, ContrastSetRecord[]>();
  const entitiesByTag = new Map<TagId, EntityId[]>();

  for (const person of bundle.people) {
    entities.set(person.id, person);
    indexMany(personsByDiscipline, person.disciplines, person);
    indexMany(entitiesByTag, person.tags, person.id);
  }

  for (const concept of bundle.concepts) {
    entities.set(concept.id, concept);
    indexMany(conceptsByDiscipline, concept.disciplineIds, concept);
    indexMany(entitiesByTag, concept.tags, concept.id);
  }

  for (const relation of bundle.relations) {
    indexOne(outgoingRelations, relation.fromId, relation);
    indexOne(incomingRelations, relation.toId, relation);
    indexOne(relationsByType, relation.type, relation);
  }

  for (const path of bundle.paths) {
    indexMany(pathsByDiscipline, path.disciplineIds, path);
  }

  for (const record of bundle.cases) {
    indexMany(casesByEntity, record.targetEntityIds, record);
  }

  for (const contrastSet of bundle.contrastSets) {
    indexMany(contrastSetsByEntity, contrastSet.personIds, contrastSet);
    indexMany(contrastSetsByEntity, contrastSet.relatedEntityIds, contrastSet);
  }

  return {
    ...maps,
    entities,
    outgoingRelations,
    incomingRelations,
    relationsByType,
    personsByDiscipline,
    conceptsByDiscipline,
    pathsByDiscipline,
    casesByEntity,
    contrastSetsByEntity,
    entitiesByTag
  };
}

export function getEntityLabel(index: ContentIndex, entityId: EntityId): string {
  const entity = index.entities.get(entityId);

  if (!entity) {
    return entityId;
  }

  return 'displayName' in entity ? entity.displayName : entity.label;
}

export function getDisciplineEntityIds(index: ContentIndex, disciplineId: DisciplineId): EntityId[] {
  const people = index.personsByDiscipline.get(disciplineId) ?? [];
  const concepts = index.conceptsByDiscipline.get(disciplineId) ?? [];

  return [...people.map((item) => item.id), ...concepts.map((item) => item.id)];
}

function indexOne<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const bucket = map.get(key);
  if (bucket) {
    bucket.push(value);
    return;
  }

  map.set(key, [value]);
}

function indexMany<K, V>(map: Map<K, V[]>, keys: K[], value: V): void {
  for (const key of keys) {
    indexOne(map, key, value);
  }
}
