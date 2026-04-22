import { getEntityLabel, type ContentIndex } from '@/core/content/contentIndex';
import { rankContrastSets } from '@/core/graph/contrastResolver';
import type { AppStoreState } from '@/state/appStore';
import type { NavigationItem } from '@/types/ui';
import type { ContrastMicrotaskType, ContrastSetRecord, DisciplineId } from '@/types/content';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';

export interface LabContrastSummary {
  id: string;
  title: string;
  personLabels: string[];
  relatedLabels: string[];
  confusionReason: string;
  distinguishingFeature: string;
  microtaskLabel: string;
  disciplineIds: DisciplineId[];
  matchedConfusionCount: number;
  dueKnowledgeCount: number;
  score: number;
}

export interface LabConfusionSummary {
  id: string;
  sourceLabel: string;
  confusedWithLabel: string;
  count: number;
  problemType: string;
}

export function selectLabContrastSummaries(input: {
  index: ContentIndex;
  confusions?: ConfusionRecord[];
  knowledgeStates?: KnowledgeState[];
  disciplineIds?: DisciplineId[];
}): LabContrastSummary[] {
  const allowedDisciplines = input.disciplineIds?.length ? new Set(input.disciplineIds) : undefined;

  return rankContrastSets(input.index, input.confusions, input.knowledgeStates)
    .filter((item) =>
      !allowedDisciplines || item.record.personIds.some((personId) => {
        const person = input.index.people.get(personId);
        return person?.disciplines.some((disciplineId) => allowedDisciplines.has(disciplineId));
      })
    )
    .map((item) => toContrastSummary(input.index, item.record, item.matchedConfusionCount, item.dueKnowledgeCount, item.score));
}

export function selectLabConfusionSummaries(index: ContentIndex, confusions: ConfusionRecord[]): LabConfusionSummary[] {
  return confusions.slice(0, 8).map((record) => ({
    id: record.id,
    sourceLabel: getEntityLabel(index, record.sourceEntityId),
    confusedWithLabel: getEntityLabel(index, record.confusedWithEntityId),
    count: record.count,
    problemType: mapProblemTypeLabel(record.problemType)
  }));
}

export function selectRecommendedContrastSetId(input: {
  appState: AppStoreState;
  summaries: LabContrastSummary[];
}): string | undefined {
  const resumeContrastSetId = input.appState.resumeSession?.mode === 'lab'
    ? input.appState.resumeSession.context?.contrastSetId
    : undefined;

  if (resumeContrastSetId && input.summaries.some((item) => item.id === resumeContrastSetId)) {
    return resumeContrastSetId;
  }

  return input.summaries[0]?.id;
}

export function selectLabNavigationItems(): NavigationItem[] {
  return [
    { id: 'home', path: '/', label: 'Přehled' },
    { id: 'atlas', path: '/atlas', label: 'Atlas souvislostí', mode: 'atlas' },
    { id: 'cases', path: '/detektivni-spisy', label: 'Detektivní spisy', mode: 'cases' },
    { id: 'lab', path: '/laborator-rozliseni', label: 'Laboratoř rozlišení', mode: 'lab' },
    { id: 'onboarding', path: '/prvni-nastaveni', label: 'První nastavení' }
  ];
}

function toContrastSummary(
  index: ContentIndex,
  record: ContrastSetRecord,
  matchedConfusionCount: number,
  dueKnowledgeCount: number,
  score: number
): LabContrastSummary {
  const disciplineIds = Array.from(
    new Set(
      record.personIds.flatMap((personId) => index.people.get(personId)?.disciplines ?? [])
    )
  );

  return {
    id: record.id,
    title: record.title,
    personLabels: record.personIds.map((entityId) => getEntityLabel(index, entityId)),
    relatedLabels: record.relatedEntityIds.map((entityId) => getEntityLabel(index, entityId)),
    confusionReason: record.confusionReason,
    distinguishingFeature: record.distinguishingFeature,
    microtaskLabel: mapMicrotaskLabel(record.microtaskTypes[0] ?? 'definition-discrimination'),
    disciplineIds,
    matchedConfusionCount,
    dueKnowledgeCount,
    score
  };
}

function mapMicrotaskLabel(type: ContrastMicrotaskType): string {
  switch (type) {
    case 'two-names-one-attribute':
      return 'Dvě jména, jeden znak';
    case 'one-institution-two-people':
      return 'Jedna instituce, dvě osobnosti';
    case 'one-scale-three-authors':
      return 'Jedna škála, více autorů';
    case 'historical-sequence':
      return 'Historická návaznost';
    case 'incorrect-link-detection':
      return 'Odhalení chybného spojení';
    case 'definition-discrimination':
      return 'Rozlišení definice';
  }
}

function mapProblemTypeLabel(problemType: string): string {
  switch (problemType) {
    case 'discipline-assignment':
      return 'oborové zařazení';
    case 'institution-link':
      return 'propojení s institucí';
    case 'test-link':
      return 'test nebo škála';
    case 'historical-sequence':
      return 'historická návaznost';
    case 'similar-person-confusion':
      return 'záměna podobných osobností';
    case 'needed-hint':
      return 'správně až po nápovědě';
    case 'active-recall-gap':
    default:
      return 'vybavení z paměti';
  }
}
