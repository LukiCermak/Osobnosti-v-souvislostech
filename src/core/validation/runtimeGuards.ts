import type {
  CaseRecord,
  ConceptRecord,
  ContrastSetRecord,
  PathRecord,
  PersonRecord,
  RelationRecord,
  SourceReference
} from '@/types/content';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isSourceReference(value: unknown): value is SourceReference {
  return (
    isObject(value) &&
    typeof value.sourceDocumentId === 'string' &&
    (value.section === undefined || typeof value.section === 'string') &&
    (value.locator === undefined || typeof value.locator === 'string') &&
    (value.excerpt === undefined || typeof value.excerpt === 'string') &&
    (value.note === undefined || typeof value.note === 'string')
  );
}

export function isPersonRecord(value: unknown): value is PersonRecord {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.displayName === 'string' &&
    isStringArray(value.alternativeNames) &&
    typeof value.eraId === 'string' &&
    typeof value.periodLabel === 'string' &&
    typeof value.nationalContext === 'string' &&
    isStringArray(value.disciplines) &&
    typeof value.significanceSummary === 'string' &&
    isStringArray(value.mainAnchors) &&
    isStringArray(value.relationTargets) &&
    typeof value.studyPriority === 'string' &&
    isStringArray(value.confusionTags) &&
    isStringArray(value.tags) &&
    Array.isArray(value.sourceReferences) &&
    value.sourceReferences.every(isSourceReference)
  );
}

export function isConceptRecord(value: unknown): value is ConceptRecord {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.label === 'string' &&
    isStringArray(value.alternativeLabels) &&
    typeof value.significanceSummary === 'string' &&
    isStringArray(value.disciplineIds) &&
    isStringArray(value.tags) &&
    Array.isArray(value.sourceReferences) &&
    value.sourceReferences.every(isSourceReference)
  );
}

export function isRelationRecord(value: unknown): value is RelationRecord {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.fromId === 'string' &&
    typeof value.toId === 'string' &&
    typeof value.type === 'string' &&
    typeof value.strength === 'string' &&
    typeof value.direction === 'string' &&
    typeof value.studyPriority === 'string' &&
    typeof value.suitableForContrast === 'boolean' &&
    typeof value.explanation === 'string' &&
    isStringArray(value.tags) &&
    Array.isArray(value.sourceReferences) &&
    value.sourceReferences.every(isSourceReference)
  );
}

export function isPathRecord(value: unknown): value is PathRecord {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.didacticGoal === 'string' &&
    isStringArray(value.disciplineIds) &&
    isStringArray(value.eraIds) &&
    Array.isArray(value.steps) &&
    Array.isArray(value.requiredNodeIds) &&
    Array.isArray(value.contrastMoments) &&
    typeof value.recommendedDifficulty === 'string' &&
    Array.isArray(value.sourceReferences) &&
    value.sourceReferences.every(isSourceReference)
  );
}

export function isCaseRecord(value: unknown): value is CaseRecord {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isStringArray(value.targetEntityIds) &&
    isStringArray(value.targetRelationIds) &&
    typeof value.goal === 'string' &&
    typeof value.difficulty === 'string' &&
    Array.isArray(value.clues) &&
    Array.isArray(value.questions) &&
    isObject(value.evaluation) &&
    typeof value.followUpExplanation === 'string' &&
    Array.isArray(value.sourceReferences) &&
    value.sourceReferences.every(isSourceReference)
  );
}

export function isContrastSetRecord(value: unknown): value is ContrastSetRecord {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isStringArray(value.personIds) &&
    isStringArray(value.relatedEntityIds) &&
    typeof value.confusionReason === 'string' &&
    typeof value.distinguishingFeature === 'string' &&
    Array.isArray(value.microtaskTypes) &&
    value.microtaskTypes.every((item) => typeof item === 'string') &&
    Array.isArray(value.sourceReferences) &&
    value.sourceReferences.every(isSourceReference)
  );
}

export function assertRecordArray<T>(
  label: string,
  value: unknown,
  guard: (candidate: unknown) => candidate is T
): asserts value is T[] {
  if (!Array.isArray(value) || !value.every(guard)) {
    throw new Error(`Runtime obsah ${label} nemá očekávanou podobu.`);
  }
}
