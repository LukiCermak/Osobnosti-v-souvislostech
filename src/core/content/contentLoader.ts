import rawCases from '../../../content/built/cases.json';
import rawConcepts from '../../../content/built/concepts.json';
import rawContrastSets from '../../../content/built/contrast-sets.json';
import rawPaths from '../../../content/built/paths.json';
import rawPeople from '../../../content/built/people.json';
import rawRelations from '../../../content/built/relations.json';
import rawVersion from '../../../content/built/content-version.json';
import type {
  CaseRecord,
  ConceptRecord,
  ContentBundleVersion,
  ContrastSetRecord,
  PathRecord,
  PersonRecord,
  RelationRecord
} from '@/types/content';
import { normalizeRuntimeContentBundle, type RuntimeContentBundle } from '@/core/content/contentNormalizer';
import { normalizeContentVersion } from '@/core/content/contentVersion';
import {
  assertRecordArray,
  isCaseRecord,
  isConceptRecord,
  isContrastSetRecord,
  isPathRecord,
  isPersonRecord,
  isRelationRecord
} from '@/core/validation/runtimeGuards';
import { assertContentIntegrity } from '@/core/validation/contentAssertions';

let cachedBundle: RuntimeContentBundle | null = null;

export async function loadRuntimeContentBundle(forceReload = false): Promise<RuntimeContentBundle> {
  if (cachedBundle && !forceReload) {
    return cachedBundle;
  }

  const people = validateAndCloneArray<PersonRecord>('osobnosti', rawPeople, isPersonRecord);
  const concepts = validateAndCloneArray<ConceptRecord>('pojmy', rawConcepts, isConceptRecord);
  const relations = validateAndCloneArray<RelationRecord>('vazby', rawRelations, isRelationRecord);
  const paths = validateAndCloneArray<PathRecord>('trasy', rawPaths, isPathRecord);
  const cases = validateAndCloneArray<CaseRecord>('případy', rawCases, isCaseRecord);
  const contrastSets = validateAndCloneArray<ContrastSetRecord>('kontrastní sady', rawContrastSets, isContrastSetRecord);
  const version = normalizeContentVersion(rawVersion as Partial<ContentBundleVersion>);

  const bundle = normalizeRuntimeContentBundle({
    people,
    concepts,
    relations,
    paths,
    cases,
    contrastSets,
    version
  });

  const assertionResult = assertContentIntegrity(bundle);
  if (!assertionResult.valid) {
    throw new Error(assertionResult.issues.map((issue) => issue.message).join('\n'));
  }

  cachedBundle = bundle;
  return bundle;
}

export function getCachedRuntimeContentBundle(): RuntimeContentBundle | null {
  return cachedBundle;
}

export function clearRuntimeContentBundleCache(): void {
  cachedBundle = null;
}

function validateAndCloneArray<T>(
  label: string,
  value: unknown,
  guard: (candidate: unknown) => candidate is T
): T[] {
  assertRecordArray(label, value, guard);
  return structuredClone(value);
}
