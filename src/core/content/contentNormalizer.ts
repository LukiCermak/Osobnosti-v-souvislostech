import type {
  CaseRecord,
  ConceptRecord,
  ContentBundleVersion,
  ContrastSetRecord,
  PathRecord,
  PersonRecord,
  RelationRecord,
  SourceReference
} from '@/types/content';

export interface RuntimeContentBundle {
  people: PersonRecord[];
  concepts: ConceptRecord[];
  relations: RelationRecord[];
  paths: PathRecord[];
  cases: CaseRecord[];
  contrastSets: ContrastSetRecord[];
  version: ContentBundleVersion;
}

export interface RuntimeContentMaps {
  people: Map<string, PersonRecord>;
  concepts: Map<string, ConceptRecord>;
  relations: Map<string, RelationRecord>;
  paths: Map<string, PathRecord>;
  cases: Map<string, CaseRecord>;
  contrastSets: Map<string, ContrastSetRecord>;
}

export function normalizeRuntimeContentBundle(input: RuntimeContentBundle): RuntimeContentBundle {
  return {
    people: deduplicateById(input.people.map(normalizePersonRecord)),
    concepts: deduplicateById(input.concepts.map(normalizeConceptRecord)),
    relations: deduplicateById(input.relations.map(normalizeRelationRecord)),
    paths: deduplicateById(input.paths.map(normalizePathRecord)),
    cases: deduplicateById(input.cases.map(normalizeCaseRecord)),
    contrastSets: deduplicateById(input.contrastSets.map(normalizeContrastSetRecord)),
    version: {
      version: input.version.version,
      createdAt: input.version.createdAt,
      sourceDigest: input.version.sourceDigest
    }
  };
}

export function createRuntimeContentMaps(bundle: RuntimeContentBundle): RuntimeContentMaps {
  return {
    people: toMap(bundle.people),
    concepts: toMap(bundle.concepts),
    relations: toMap(bundle.relations),
    paths: toMap(bundle.paths),
    cases: toMap(bundle.cases),
    contrastSets: toMap(bundle.contrastSets)
  };
}

export function normalizePersonRecord(record: PersonRecord): PersonRecord {
  return {
    ...record,
    displayName: record.displayName.trim(),
    alternativeNames: normalizeStringArray(record.alternativeNames),
    periodLabel: record.periodLabel.trim(),
    nationalContext: record.nationalContext.trim(),
    disciplines: normalizeStringArray(record.disciplines),
    significanceSummary: record.significanceSummary.trim(),
    mainAnchors: normalizeStringArray(record.mainAnchors),
    relationTargets: normalizeStringArray(record.relationTargets),
    confusionTags: normalizeStringArray(record.confusionTags),
    tags: normalizeStringArray(record.tags),
    sourceReferences: record.sourceReferences.map(normalizeSourceReference)
  };
}

export function normalizeConceptRecord(record: ConceptRecord): ConceptRecord {
  return {
    ...record,
    label: record.label.trim(),
    alternativeLabels: normalizeStringArray(record.alternativeLabels),
    significanceSummary: record.significanceSummary.trim(),
    disciplineIds: normalizeStringArray(record.disciplineIds),
    tags: normalizeStringArray(record.tags),
    sourceReferences: record.sourceReferences.map(normalizeSourceReference)
  };
}

export function normalizeRelationRecord(record: RelationRecord): RelationRecord {
  return {
    ...record,
    fromId: record.fromId.trim(),
    toId: record.toId.trim(),
    explanation: record.explanation.trim(),
    tags: normalizeStringArray(record.tags),
    sourceReferences: record.sourceReferences.map(normalizeSourceReference)
  };
}

export function normalizePathRecord(record: PathRecord): PathRecord {
  return {
    ...record,
    title: record.title.trim(),
    didacticGoal: record.didacticGoal.trim(),
    disciplineIds: normalizeStringArray(record.disciplineIds),
    eraIds: normalizeStringArray(record.eraIds),
    steps: record.steps.map((step) => ({
      ...step,
      id: step.id.trim(),
      entityId: step.entityId.trim(),
      prompt: step.prompt?.trim()
    })),
    requiredNodeIds: normalizeStringArray(record.requiredNodeIds),
    contrastMoments: record.contrastMoments.map((moment) => ({
      ...moment,
      id: moment.id.trim(),
      title: moment.title.trim(),
      focusEntityIds: normalizeStringArray(moment.focusEntityIds),
      question: moment.question.trim()
    })),
    sourceReferences: record.sourceReferences.map(normalizeSourceReference)
  };
}

export function normalizeCaseRecord(record: CaseRecord): CaseRecord {
  return {
    ...record,
    title: record.title.trim(),
    targetEntityIds: normalizeStringArray(record.targetEntityIds),
    targetRelationIds: normalizeStringArray(record.targetRelationIds),
    goal: record.goal.trim(),
    clues: record.clues.map((clue) => ({
      ...clue,
      id: clue.id.trim(),
      title: clue.title.trim(),
      text: clue.text.trim(),
      unlockAfterClueIds: normalizeStringArray(clue.unlockAfterClueIds),
      focusEntityIds: normalizeStringArray(clue.focusEntityIds),
      weight: Math.max(1, Math.trunc(clue.weight))
    })),
    questions: record.questions.map((question) => ({
      ...question,
      id: question.id.trim(),
      prompt: question.prompt.trim(),
      unlockAfterClueIds: normalizeStringArray(question.unlockAfterClueIds),
      relatedEntityIds: normalizeStringArray(question.relatedEntityIds),
      options: question.options?.map((option) => ({
        ...option,
        id: option.id.trim(),
        label: option.label.trim(),
        rationale: option.rationale?.trim()
      })),
      expectedAnswer: question.expectedAnswer?.trim()
    })),
    followUpExplanation: record.followUpExplanation.trim(),
    sourceReferences: record.sourceReferences.map(normalizeSourceReference)
  };
}

export function normalizeContrastSetRecord(record: ContrastSetRecord): ContrastSetRecord {
  return {
    ...record,
    title: record.title.trim(),
    personIds: normalizeStringArray(record.personIds),
    relatedEntityIds: normalizeStringArray(record.relatedEntityIds),
    confusionReason: record.confusionReason.trim(),
    distinguishingFeature: record.distinguishingFeature.trim(),
    microtaskTypes: Array.from(new Set(record.microtaskTypes)),
    sourceReferences: record.sourceReferences.map(normalizeSourceReference)
  };
}

function normalizeSourceReference(reference: SourceReference): SourceReference {
  return {
    sourceDocumentId: reference.sourceDocumentId.trim(),
    section: reference.section?.trim(),
    locator: reference.locator?.trim(),
    excerpt: reference.excerpt?.trim(),
    note: reference.note?.trim()
  };
}

function normalizeStringArray(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function deduplicateById<T extends { id: string }>(records: T[]): T[] {
  return Array.from(toMap(records).values());
}

function toMap<T extends { id: string }>(records: T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}
