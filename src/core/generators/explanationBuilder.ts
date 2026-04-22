import type { EntityId, RelationRecord } from '@/types/content';
import type { ContentIndex } from '@/core/content/contentIndex';
import type { AnswerAccuracy, StudyTask } from '@/types/study';

export function buildTaskExplanation(index: ContentIndex, task: StudyTask): string {
  switch (task.mode) {
    case 'atlas':
      return buildAtlasExplanation(index, task.relationIds.map((relationId) => index.relations.get(relationId)).filter(isDefined));
    case 'cases':
      return task.expectedOutcome;
    case 'lab':
      return task.expectedOutcome;
  }
}

export function buildAnswerFeedback(index: ContentIndex, task: StudyTask, accuracy: AnswerAccuracy): string {
  const baseExplanation = buildTaskExplanation(index, task);

  switch (accuracy) {
    case 'correct':
      return `Správně. ${baseExplanation}`;
    case 'correct-after-hint':
      return `Správně po nápovědě. ${baseExplanation}`;
    case 'skipped':
      return `Úloha byla přeskočena. ${baseExplanation}`;
    case 'incorrect':
      return `Tato vazba potřebuje další upevnění. ${baseExplanation}`;
  }
}

export function summarizeEntityList(index: ContentIndex, entityIds: EntityId[]): string {
  return entityIds
    .map((entityId) => {
      const entity = index.entities.get(entityId);
      return entity ? ('displayName' in entity ? entity.displayName : entity.label) : entityId;
    })
    .join(', ');
}

function buildAtlasExplanation(index: ContentIndex, relations: RelationRecord[]): string {
  if (relations.length === 0) {
    return 'Správné spojení odpovídá studijním vazbám v obsahu aplikace.';
  }

  const first = relations[0];
  const fromLabel = labelFor(index, first.fromId);
  const toLabel = labelFor(index, first.toId);

  if (relations.length === 1) {
    return `${fromLabel} je v obsahu aplikace spojován s entitou ${toLabel}. ${first.explanation}`;
  }

  return `Správné řešení spojuje více vazeb v jednom bloku. Základní oporou je spojení ${fromLabel} → ${toLabel}.`;
}

function labelFor(index: ContentIndex, entityId: EntityId): string {
  const entity = index.entities.get(entityId);
  if (!entity) {
    return entityId;
  }

  return 'displayName' in entity ? entity.displayName : entity.label;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
