import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';

import type {
  CaseRecord,
  ConceptRecord,
  ContentBundleVersion,
  ContrastSetRecord,
  DisciplineDefinition,
  EraDefinition,
  PathRecord,
  PersonRecord,
  RelationRecord,
  TagDefinition
} from '../../src/types/content';

export interface LoadedContentSource {
  disciplines: DisciplineDefinition[];
  eras: EraDefinition[];
  tags: TagDefinition[];
  people: PersonRecord[];
  concepts: ConceptRecord[];
  relations: RelationRecord[];
  paths: PathRecord[];
  cases: CaseRecord[];
  contrastSets: ContrastSetRecord[];
}

export interface ValidationIssue {
  scope: string;
  message: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
}

export interface NormalizedContent {
  disciplines: DisciplineDefinition[];
  eras: EraDefinition[];
  tags: TagDefinition[];
  people: PersonRecord[];
  concepts: ConceptRecord[];
  relations: RelationRecord[];
  paths: PathRecord[];
  cases: CaseRecord[];
  contrastSets: ContrastSetRecord[];
}

export interface SearchIndexEntry {
  id: string;
  kind: 'person' | 'concept' | 'path' | 'case' | 'contrast-set';
  label: string;
  searchText: string;
  disciplines: string[];
  tags: string[];
  relatedIds: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const projectRoot = path.resolve(__dirname, '..', '..');

export const paths = {
  contentRoot: path.join(projectRoot, 'content'),
  sourceRoot: path.join(projectRoot, 'content', 'source'),
  sourceMetadataRoot: path.join(projectRoot, 'content', 'source', 'metadata'),
  sourceContentRoot: path.join(projectRoot, 'content', 'source', 'mini-wikipedie-osobnosti'),
  builtRoot: path.join(projectRoot, 'content', 'built'),
  schemaRoot: path.join(projectRoot, 'content', 'schemas'),
  docsRoot: path.join(projectRoot, 'docs')
} as const;

const schemaFiles = {
  people: 'person.schema.json',
  concepts: 'concept.schema.json',
  relations: 'relation.schema.json',
  paths: 'path.schema.json',
  cases: 'case.schema.json',
  contrastSets: 'contrast-set.schema.json'
} as const;

const sourceFiles = {
  disciplines: 'disciplines.yaml',
  eras: 'eras.yaml',
  tags: 'tags.yaml',
  people: 'persons.yaml',
  concepts: 'concepts.yaml',
  relations: 'relations.yaml',
  paths: 'paths.yaml',
  cases: 'cases.yaml',
  contrastSets: 'contrast_sets.yaml'
} as const;

const builtFiles = {
  people: 'people.json',
  concepts: 'concepts.json',
  relations: 'relations.json',
  paths: 'paths.json',
  cases: 'cases.json',
  contrastSets: 'contrast-sets.json',
  contentVersion: 'content-version.json',
  searchIndex: 'search-index.json'
} as const;

export const requiredFigures = [
  'jan-amos-komensky',
  'karel-dvorak',
  'marie-vitkova',
  'edouard-seguin',
  'karel-slavoj-amerling',
  'josef-zeman',
  'rudolf-jedlicka',
  'jan-mauer',
  'paul-broca',
  'hermann-gutzmann',
  'milos-sovak',
  'charles-michel-de-l-epee',
  'samuel-heinicke',
  'louis-braille',
  'laura-bridgman',
  'jan-deyl',
  'fritz-redl',
  'alois-zikmund',
  'alfred-binet',
  'theodore-simon',
  'david-wechsler',
  'sigmund-freud',
  'viktor-e-frankl',
  'pavel-muhlpachr',
  'olga-havlova'
] as const;

function sourceFilePath(group: keyof typeof sourceFiles): string {
  if (group === 'disciplines' || group === 'eras' || group === 'tags') {
    return path.join(paths.sourceMetadataRoot, sourceFiles[group]);
  }

  return path.join(paths.sourceContentRoot, sourceFiles[group]);
}

function builtFilePath(group: keyof typeof builtFiles): string {
  return path.join(paths.builtRoot, builtFiles[group]);
}

async function readYamlFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf-8');
  return YAML.parse(raw) as T;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

export async function loadSourceContent(): Promise<LoadedContentSource> {
  return {
    disciplines: await readYamlFile<DisciplineDefinition[]>(sourceFilePath('disciplines')),
    eras: await readYamlFile<EraDefinition[]>(sourceFilePath('eras')),
    tags: await readYamlFile<TagDefinition[]>(sourceFilePath('tags')),
    people: await readYamlFile<PersonRecord[]>(sourceFilePath('people')),
    concepts: await readYamlFile<ConceptRecord[]>(sourceFilePath('concepts')),
    relations: await readYamlFile<RelationRecord[]>(sourceFilePath('relations')),
    paths: await readYamlFile<PathRecord[]>(sourceFilePath('paths')),
    cases: await readYamlFile<CaseRecord[]>(sourceFilePath('cases')),
    contrastSets: await readYamlFile<ContrastSetRecord[]>(sourceFilePath('contrastSets'))
  };
}

export async function loadBuiltContent(): Promise<NormalizedContent> {
  return {
    disciplines: await readYamlFile<DisciplineDefinition[]>(sourceFilePath('disciplines')),
    eras: await readYamlFile<EraDefinition[]>(sourceFilePath('eras')),
    tags: await readYamlFile<TagDefinition[]>(sourceFilePath('tags')),
    people: await readJsonFile<PersonRecord[]>(builtFilePath('people')),
    concepts: await readJsonFile<ConceptRecord[]>(builtFilePath('concepts')),
    relations: await readJsonFile<RelationRecord[]>(builtFilePath('relations')),
    paths: await readJsonFile<PathRecord[]>(builtFilePath('paths')),
    cases: await readJsonFile<CaseRecord[]>(builtFilePath('cases')),
    contrastSets: await readJsonFile<ContrastSetRecord[]>(builtFilePath('contrastSets'))
  };
}

function pushIssue(issues: ValidationIssue[], scope: string, message: string): void {
  issues.push({ scope, message });
}

function ensureUniqueIds(
  records: Array<{ id: string }>,
  scope: string,
  issues: ValidationIssue[]
): void {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.id)) {
      pushIssue(issues, scope, `Duplicitní identifikátor: ${record.id}`);
      continue;
    }

    seen.add(record.id);
  }
}

function validateQuestionLogic(caseRecord: CaseRecord, issues: ValidationIssue[]): void {
  const clueIds = new Set(caseRecord.clues.map((clue) => clue.id));

  for (const clue of caseRecord.clues) {
    for (const dependencyId of clue.unlockAfterClueIds) {
      if (!clueIds.has(dependencyId)) {
        pushIssue(
          issues,
          `cases:${caseRecord.id}`,
          `Indicie ${clue.id} odkazuje na neexistující indicii ${dependencyId}.`
        );
      }
    }
  }

  for (const question of caseRecord.questions) {
    for (const dependencyId of question.unlockAfterClueIds) {
      if (!clueIds.has(dependencyId)) {
        pushIssue(
          issues,
          `cases:${caseRecord.id}`,
          `Otázka ${question.id} odkazuje na neexistující indicii ${dependencyId}.`
        );
      }
    }

    if (question.answerMode === 'short-text' && !question.expectedAnswer) {
      pushIssue(
        issues,
        `cases:${caseRecord.id}`,
        `Otázka ${question.id} typu short-text musí mít expectedAnswer.`
      );
    }

    if (question.answerMode !== 'short-text') {
      const options = question.options ?? [];
      const correctOptions = options.filter((option) => option.isCorrect);

      if (options.length < 2) {
        pushIssue(
          issues,
          `cases:${caseRecord.id}`,
          `Otázka ${question.id} musí mít alespoň dvě možnosti.`
        );
      }

      if (question.answerMode === 'single-choice' && correctOptions.length !== 1) {
        pushIssue(
          issues,
          `cases:${caseRecord.id}`,
          `Otázka ${question.id} typu single-choice musí mít právě jednu správnou odpověď.`
        );
      }

      if (question.answerMode === 'multi-choice' && correctOptions.length < 1) {
        pushIssue(
          issues,
          `cases:${caseRecord.id}`,
          `Otázka ${question.id} typu multi-choice musí mít alespoň jednu správnou odpověď.`
        );
      }
    }
  }
}

function sortById<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.id.localeCompare(right.id, 'cs'));
}

function sortByOrder<T extends { order: number; id: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id, 'cs'));
}

function sortBySortKey<T extends { sortKey: number; id: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.sortKey - right.sortKey || left.id.localeCompare(right.id, 'cs'));
}

export function normalizeContent(source: LoadedContentSource): NormalizedContent {
  return {
    disciplines: sortByOrder(source.disciplines),
    eras: sortBySortKey(source.eras),
    tags: sortById(source.tags),
    people: sortById(source.people),
    concepts: sortById(source.concepts),
    relations: sortById(source.relations),
    paths: sortById(source.paths),
    cases: sortById(source.cases),
    contrastSets: sortById(source.contrastSets)
  };
}

export async function validateContent(source: LoadedContentSource): Promise<ValidationResult> {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const issues: ValidationIssue[] = [];

  const relationSchema = await readJsonFile<Record<string, unknown>>(path.join(paths.schemaRoot, schemaFiles.relations));
  const relationProperties = relationSchema.properties as Record<string, unknown> | undefined;
  const relationIdProperty = relationProperties?.id as Record<string, unknown> | undefined;
  if (relationIdProperty) {
    relationIdProperty.pattern = '^[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*){2}$';
  }

  const pathSchema = await readJsonFile<Record<string, unknown>>(path.join(paths.schemaRoot, schemaFiles.paths));
  const pathProperties = pathSchema.properties as Record<string, unknown> | undefined;
  const pathIdProperty = pathProperties?.id as Record<string, unknown> | undefined;
  if (pathIdProperty) {
    pathIdProperty.pattern = '^\\S+$';
  }

  const caseSchema = await readJsonFile<Record<string, unknown>>(path.join(paths.schemaRoot, schemaFiles.cases));
  const caseProperties = caseSchema.properties as Record<string, unknown> | undefined;
  const targetRelationIdsProperty = caseProperties?.targetRelationIds as Record<string, unknown> | undefined;
  const targetRelationItems = targetRelationIdsProperty?.items as Record<string, unknown> | undefined;
  if (targetRelationItems) {
    targetRelationItems.pattern = '^[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*){2}$';
  }

  const validators = {
    people: ajv.compile(await readJsonFile<object>(path.join(paths.schemaRoot, schemaFiles.people))),
    concepts: ajv.compile(await readJsonFile<object>(path.join(paths.schemaRoot, schemaFiles.concepts))),
    relations: ajv.compile(relationSchema),
    paths: ajv.compile(pathSchema),
    cases: ajv.compile(caseSchema),
    contrastSets: ajv.compile(await readJsonFile<object>(path.join(paths.schemaRoot, schemaFiles.contrastSets)))
  };

  const collectionEntries: Array<[
    keyof typeof validators,
    Array<{ id: string }>
  ]> = [
    ['people', source.people],
    ['concepts', source.concepts],
    ['relations', source.relations],
    ['paths', source.paths],
    ['cases', source.cases],
    ['contrastSets', source.contrastSets]
  ];

  for (const [scope, records] of collectionEntries) {
    ensureUniqueIds(records, scope, issues);

    const validate = validators[scope];

    for (const record of records) {
      const isValid = validate(record as unknown);
      if (isValid) {
        continue;
      }

      const errorMessage = (validate.errors ?? [])
        .map((error) => `${error.instancePath || '(kořen)'} ${error.message ?? 'neplatná hodnota'}`.trim())
        .join('; ');
      pushIssue(issues, scope, `Schéma neprošlo pro ${record.id}: ${errorMessage}`);
    }
  }

  ensureUniqueIds(source.disciplines, 'disciplines', issues);
  ensureUniqueIds(source.eras, 'eras', issues);
  ensureUniqueIds(source.tags, 'tags', issues);

  const disciplineIds = new Set(source.disciplines.map((item) => item.id));
  const eraIds = new Set(source.eras.map((item) => item.id));
  const tagIds = new Set(source.tags.map((item) => item.id));
  const relationTagIds = new Set([...tagIds, ...disciplineIds]);
  const personIds = new Set(source.people.map((item) => item.id));
  const conceptIds = new Set(source.concepts.map((item) => item.id));
  const relationIds = new Set(source.relations.map((item) => item.id));
  const entityIds = new Set([...personIds, ...conceptIds]);

  const registerMissingRefs = (scope: string, refs: string[], refSet: Set<string>, label: string): void => {
    for (const ref of refs) {
      if (!refSet.has(ref)) {
        pushIssue(issues, scope, `Neplatný odkaz ${label}: ${ref}`);
      }
    }
  };

  for (const person of source.people) {
    registerMissingRefs(`people:${person.id}`, person.disciplines, disciplineIds, 'disciplína');
    registerMissingRefs(`people:${person.id}`, person.tags, tagIds, 'štítek');
    registerMissingRefs(`people:${person.id}`, person.confusionTags, tagIds, 'konfuzní štítek');
    registerMissingRefs(`people:${person.id}`, person.relationTargets, entityIds, 'cílová entita');

    if (!eraIds.has(person.eraId)) {
      pushIssue(issues, `people:${person.id}`, `Neplatné období: ${person.eraId}`);
    }
  }

  for (const concept of source.concepts) {
    registerMissingRefs(`concepts:${concept.id}`, concept.disciplineIds, disciplineIds, 'disciplína');
    registerMissingRefs(`concepts:${concept.id}`, concept.tags, tagIds, 'štítek');
  }

  for (const relation of source.relations) {
    if (!entityIds.has(relation.fromId)) {
      pushIssue(issues, `relations:${relation.id}`, `Neplatný fromId: ${relation.fromId}`);
    }

    if (!entityIds.has(relation.toId)) {
      pushIssue(issues, `relations:${relation.id}`, `Neplatný toId: ${relation.toId}`);
    }

    const expectedRelationId = `${relation.fromId}__${relation.type}__${relation.toId}`;
    if (relation.id !== expectedRelationId) {
      pushIssue(
        issues,
        `relations:${relation.id}`,
        `Identifikátor vazby neodpovídá očekávanému tvaru ${expectedRelationId}.`
      );
    }

    registerMissingRefs(`relations:${relation.id}`, relation.tags, relationTagIds, 'štítek nebo disciplína');
  }

  for (const pathRecord of source.paths) {
    registerMissingRefs(`paths:${pathRecord.id}`, pathRecord.disciplineIds, disciplineIds, 'disciplína');
    registerMissingRefs(`paths:${pathRecord.id}`, pathRecord.eraIds, eraIds, 'období');
    registerMissingRefs(
      `paths:${pathRecord.id}`,
      pathRecord.steps.map((step) => step.entityId),
      entityIds,
      'krok trasy'
    );
    registerMissingRefs(`paths:${pathRecord.id}`, pathRecord.requiredNodeIds, entityIds, 'povinný uzel');

    for (const moment of pathRecord.contrastMoments) {
      registerMissingRefs(`paths:${pathRecord.id}`, moment.focusEntityIds, entityIds, 'kontrastní uzel');
    }
  }

  for (const caseRecord of source.cases) {
    registerMissingRefs(`cases:${caseRecord.id}`, caseRecord.targetEntityIds, entityIds, 'cílová entita');
    registerMissingRefs(`cases:${caseRecord.id}`, caseRecord.targetRelationIds, relationIds, 'cílová vazba');

    for (const clue of caseRecord.clues) {
      registerMissingRefs(`cases:${caseRecord.id}`, clue.focusEntityIds, entityIds, 'entita indicie');
    }

    for (const question of caseRecord.questions) {
      registerMissingRefs(`cases:${caseRecord.id}`, question.relatedEntityIds, entityIds, 'entita otázky');
    }

    validateQuestionLogic(caseRecord, issues);
  }

  for (const contrastSet of source.contrastSets) {
    registerMissingRefs(`contrastSets:${contrastSet.id}`, contrastSet.personIds, personIds, 'osobnost');
    registerMissingRefs(`contrastSets:${contrastSet.id}`, contrastSet.relatedEntityIds, entityIds, 'související entita');
  }

  return { issues };
}

export async function collectSourceDigest(): Promise<string> {
  const files = await listFilesRecursive(paths.sourceRoot);
  const schemaList = await listFilesRecursive(paths.schemaRoot);
  const hash = createHash('sha256');

  for (const filePath of [...files, ...schemaList].sort()) {
    hash.update(path.relative(projectRoot, filePath));
    hash.update(await readFile(filePath));
  }

  return hash.digest('hex');
}

async function listFilesRecursive(directoryPath: string): Promise<string[]> {
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of directoryEntries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...await listFilesRecursive(entryPath));
      continue;
    }

    if (entry.isFile()) {
      results.push(entryPath);
    }
  }

  return results;
}

export async function buildContentArtifacts(source: LoadedContentSource): Promise<ContentBundleVersion> {
  const normalized = normalizeContent(source);
  const sourceDigest = await collectSourceDigest();
  const contentVersion: ContentBundleVersion = {
    version: `1.0.0+${sourceDigest.slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    sourceDigest
  };

  await mkdir(paths.builtRoot, { recursive: true });
  await writeJsonFile(builtFilePath('people'), normalized.people);
  await writeJsonFile(builtFilePath('concepts'), normalized.concepts);
  await writeJsonFile(builtFilePath('relations'), normalized.relations);
  await writeJsonFile(builtFilePath('paths'), normalized.paths);
  await writeJsonFile(builtFilePath('cases'), normalized.cases);
  await writeJsonFile(builtFilePath('contrastSets'), normalized.contrastSets);
  await writeJsonFile(builtFilePath('contentVersion'), contentVersion);

  return contentVersion;
}

export async function buildSearchIndex(source: LoadedContentSource): Promise<SearchIndexEntry[]> {
  const entries: SearchIndexEntry[] = [];

  for (const person of source.people) {
    entries.push({
      id: person.id,
      kind: 'person',
      label: person.displayName,
      searchText: [
        person.displayName,
        ...person.alternativeNames,
        person.significanceSummary,
        ...person.mainAnchors,
        person.periodLabel,
        person.nationalContext
      ].join(' '),
      disciplines: person.disciplines,
      tags: [...person.tags, ...person.confusionTags],
      relatedIds: person.relationTargets
    });
  }

  for (const concept of source.concepts) {
    entries.push({
      id: concept.id,
      kind: 'concept',
      label: concept.label,
      searchText: [concept.label, ...concept.alternativeLabels, concept.significanceSummary].join(' '),
      disciplines: concept.disciplineIds,
      tags: concept.tags,
      relatedIds: []
    });
  }

  for (const pathRecord of source.paths) {
    entries.push({
      id: pathRecord.id,
      kind: 'path',
      label: pathRecord.title,
      searchText: [
        pathRecord.title,
        pathRecord.didacticGoal,
        ...pathRecord.steps.map((step) => step.prompt ?? ''),
        ...pathRecord.contrastMoments.map((moment) => `${moment.title} ${moment.question}`)
      ].join(' '),
      disciplines: pathRecord.disciplineIds,
      tags: [],
      relatedIds: [...pathRecord.requiredNodeIds]
    });
  }

  for (const caseRecord of source.cases) {
    entries.push({
      id: caseRecord.id,
      kind: 'case',
      label: caseRecord.title,
      searchText: [
        caseRecord.title,
        caseRecord.goal,
        caseRecord.followUpExplanation,
        ...caseRecord.clues.map((clue) => `${clue.title} ${clue.text}`),
        ...caseRecord.questions.map((question) => question.prompt)
      ].join(' '),
      disciplines: [],
      tags: [],
      relatedIds: [...caseRecord.targetEntityIds, ...caseRecord.targetRelationIds]
    });
  }

  for (const contrastSet of source.contrastSets) {
    entries.push({
      id: contrastSet.id,
      kind: 'contrast-set',
      label: contrastSet.title,
      searchText: [
        contrastSet.title,
        contrastSet.confusionReason,
        contrastSet.distinguishingFeature,
        ...contrastSet.microtaskTypes
      ].join(' '),
      disciplines: [],
      tags: [],
      relatedIds: [...contrastSet.personIds, ...contrastSet.relatedEntityIds]
    });
  }

  const normalizedEntries = sortById(entries).map((entry) => ({
    ...entry,
    searchText: entry.searchText.replace(/\s+/g, ' ').trim()
  }));

  await writeJsonFile(builtFilePath('searchIndex'), normalizedEntries);
  return normalizedEntries;
}

export async function checkRequiredFigures(source: LoadedContentSource): Promise<{ missingIds: string[] }> {
  const personIdSet = new Set(source.people.map((person) => person.id));
  const missingIds = requiredFigures.filter((id) => !personIdSet.has(id));
  return { missingIds };
}

export async function syncProjectDocs(): Promise<string[]> {
  await mkdir(paths.docsRoot, { recursive: true });

  const candidates = [
    'faze4_technicka_architektura_specialni_pedagogika.md',
    'faze5_struktura_repozitaru_a_souboru.md'
  ];
  const copied: string[] = [];

  for (const fileName of candidates) {
    const sourcePath = path.join(projectRoot, fileName);
    const targetPath = path.join(paths.docsRoot, fileName);

    if (!existsSync(sourcePath)) {
      continue;
    }

    await copyFile(sourcePath, targetPath);
    copied.push(path.relative(projectRoot, targetPath));
  }

  return copied;
}

export async function ensureBuiltRootExists(): Promise<void> {
  await mkdir(paths.builtRoot, { recursive: true });
}

export function formatIssues(result: ValidationResult): string {
  if (result.issues.length === 0) {
    return 'Nebyla nalezena žádná validační chyba.';
  }

  return result.issues
    .map((issue, index) => `${index + 1}. [${issue.scope}] ${issue.message}`)
    .join('\n');
}

export async function builtFileExists(): Promise<boolean> {
  try {
    const info = await stat(builtFilePath('people'));
    return info.isFile();
  } catch {
    return false;
  }
}
