import type { EntityId } from '@/types/content';
import type { RuntimeContentBundle } from '@/core/content/contentNormalizer';

export interface ContentAssertionIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface ContentAssertionResult {
  valid: boolean;
  issues: ContentAssertionIssue[];
}

export function assertContentIntegrity(bundle: RuntimeContentBundle): ContentAssertionResult {
  const issues: ContentAssertionIssue[] = [];
  const entityIds = new Set<EntityId>();

  for (const person of bundle.people) {
    if (entityIds.has(person.id)) {
      issues.push(error('duplicate-entity-id', `Osobnost ${person.id} se v runtime datech vyskytuje vícekrát.`));
    }
    entityIds.add(person.id);

    if (person.disciplines.length === 0) {
      issues.push(warning('person-without-discipline', `Osobnost ${person.displayName} nemá přiřazenou disciplínu.`));
    }
  }

  for (const concept of bundle.concepts) {
    if (entityIds.has(concept.id)) {
      issues.push(error('duplicate-entity-id', `Pojmová entita ${concept.id} se v runtime datech vyskytuje vícekrát.`));
    }
    entityIds.add(concept.id);
  }

  const relationIds = new Set<string>();
  for (const relation of bundle.relations) {
    if (relationIds.has(relation.id)) {
      issues.push(error('duplicate-relation-id', `Vazba ${relation.id} se v runtime datech vyskytuje vícekrát.`));
    }
    relationIds.add(relation.id);

    if (!entityIds.has(relation.fromId)) {
      issues.push(error('missing-relation-source', `Vazba ${relation.id} odkazuje na neznámý zdroj ${relation.fromId}.`));
    }
    if (!entityIds.has(relation.toId)) {
      issues.push(error('missing-relation-target', `Vazba ${relation.id} odkazuje na neznámý cíl ${relation.toId}.`));
    }
  }

  for (const path of bundle.paths) {
    if (path.steps.length === 0) {
      issues.push(error('empty-path', `Trasa ${path.id} neobsahuje žádný krok.`));
    }

    for (const step of path.steps) {
      if (!entityIds.has(step.entityId)) {
        issues.push(error('missing-path-step', `Trasa ${path.id} odkazuje na neznámou entitu ${step.entityId}.`));
      }
    }
  }

  for (const record of bundle.cases) {
    if (record.clues.length === 0) {
      issues.push(error('empty-case-clues', `Případ ${record.id} neobsahuje žádné indicie.`));
    }

    if (record.questions.length === 0) {
      issues.push(error('empty-case-questions', `Případ ${record.id} neobsahuje žádné otázky.`));
    }

    for (const entityId of record.targetEntityIds) {
      if (!entityIds.has(entityId)) {
        issues.push(error('missing-case-entity', `Případ ${record.id} odkazuje na neznámou entitu ${entityId}.`));
      }
    }

    for (const relationId of record.targetRelationIds) {
      if (!relationIds.has(relationId)) {
        issues.push(error('missing-case-relation', `Případ ${record.id} odkazuje na neznámou vazbu ${relationId}.`));
      }
    }
  }

  for (const contrastSet of bundle.contrastSets) {
    if (contrastSet.personIds.length < 2) {
      issues.push(error('small-contrast-set', `Kontrastní sada ${contrastSet.id} musí obsahovat alespoň dvě osobnosti.`));
    }

    for (const personId of contrastSet.personIds) {
      if (!entityIds.has(personId)) {
        issues.push(error('missing-contrast-person', `Kontrastní sada ${contrastSet.id} odkazuje na neznámou osobnost ${personId}.`));
      }
    }
  }

  return {
    valid: !issues.some((issue) => issue.level === 'error'),
    issues
  };
}

function error(code: string, message: string): ContentAssertionIssue {
  return { level: 'error', code, message };
}

function warning(code: string, message: string): ContentAssertionIssue {
  return { level: 'warning', code, message };
}
