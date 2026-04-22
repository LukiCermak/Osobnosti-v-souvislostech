import { buildContentGraph, type ContentGraph, type GraphNode } from '@/core/graph/graphBuilder';
import { getEntityLabel, type ContentIndex } from '@/core/content/contentIndex';
import { breadthFirstTraversal, getNode } from '@/core/graph/graphQueries';
import { resolvePath } from '@/core/graph/pathResolver';
import type { AppStoreState } from '@/state/appStore';
import type { AtlasFiltersState } from '@/types/ui';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import type {
  DisciplineId,
  EntityId,
  EraId,
  PathRecord,
  RelationRecord,
  RelationType,
  StudyPriority,
  TagId
} from '@/types/content';
import { isDefined } from '@/utils/assertions';

export interface AtlasFilterOption {
  id: string;
  label: string;
  count: number;
}

export interface AtlasMapNodeSummary {
  id: EntityId;
  label: string;
  kind: GraphNode['kind'];
  disciplineIds: DisciplineId[];
  eraId?: EraId;
  priority: StudyPriority;
  relationCount: number;
  isWeak: boolean;
}

export interface AtlasNeighborSummary {
  relationId: string;
  relationType: RelationType;
  label: string;
  explanation: string;
  neighborId: EntityId;
  neighborLabel: string;
  direction: 'outgoing' | 'incoming';
  isWeak: boolean;
}

export interface AtlasPathSummary {
  id: string;
  title: string;
  didacticGoal: string;
  disciplineIds: DisciplineId[];
  completionRatio: number;
  nextUnmasteredStepLabel?: string;
  stepLabels: Array<{ id: string; label: string; mastered: boolean; role: string }>;
  contrastQuestion?: string;
  recommendedDifficulty: PathRecord['recommendedDifficulty'];
}

export interface AtlasMapSummary {
  totalNodeCount: number;
  totalRelationCount: number;
  weakNodeCount: number;
  focusedNode?: AtlasMapNodeSummary;
  focusCandidates: AtlasMapNodeSummary[];
  visibleNodes: AtlasMapNodeSummary[];
  visibleRelations: RelationRecord[];
  neighbors: AtlasNeighborSummary[];
}

export function selectAtlasGraph(index: ContentIndex): ContentGraph {
  return buildContentGraph(index);
}

export function selectAtlasDisciplineOptions(index: ContentIndex): AtlasFilterOption[] {
  const disciplineIds = new Set<string>([
    ...index.personsByDiscipline.keys(),
    ...index.conceptsByDiscipline.keys(),
    ...index.pathsByDiscipline.keys()
  ]);

  return [...disciplineIds]
    .map((disciplineId) => ({
      id: disciplineId,
      label: labelForDiscipline(disciplineId),
      count:
        (index.personsByDiscipline.get(disciplineId)?.length ?? 0) +
        (index.conceptsByDiscipline.get(disciplineId)?.length ?? 0)
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'cs'));
}

export function selectAtlasEraOptions(index: ContentIndex): AtlasFilterOption[] {
  const eraMap = new Map<EraId, { label: string; count: number }>();

  for (const person of index.people.values()) {
    const current = eraMap.get(person.eraId);
    if (current) {
      current.count += 1;
      continue;
    }

    eraMap.set(person.eraId, {
      label: person.periodLabel,
      count: 1
    });
  }

  return [...eraMap.entries()]
    .map(([id, value]) => ({ id, label: value.label, count: value.count }))
    .sort((left, right) => left.label.localeCompare(right.label, 'cs'));
}

export function selectAtlasRelationTypeOptions(index: ContentIndex): AtlasFilterOption[] {
  return [...index.relationsByType.entries()]
    .map(([type, relations]) => ({
      id: type,
      label: labelForRelationType(type),
      count: relations.length
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'cs'));
}

export function selectAtlasTagOptions(index: ContentIndex): AtlasFilterOption[] {
  const tagMap = new Map<TagId, number>();

  for (const [tagId, entityIds] of index.entitiesByTag.entries()) {
    tagMap.set(tagId, entityIds.length);
  }

  return [...tagMap.entries()]
    .map(([id, count]) => ({ id, label: labelForTag(id), count }))
    .sort((left, right) => left.label.localeCompare(right.label, 'cs'));
}

export function selectWeakEntityIds(appState: AppStoreState, confusions: ConfusionRecord[] = []): Set<EntityId> {
  const topConfusions = appState.latestSnapshot?.topConfusions ?? [];
  const entityIds = new Set<EntityId>();

  for (const item of topConfusions) {
    entityIds.add(item.sourceEntityId);
    entityIds.add(item.confusedWithEntityId);
  }

  for (const item of confusions) {
    entityIds.add(item.sourceEntityId);
    entityIds.add(item.confusedWithEntityId);
  }

  return entityIds;
}

export function selectAtlasMapSummary(input: {
  index: ContentIndex;
  graph: ContentGraph;
  filters: AtlasFiltersState;
  weakEntityIds?: Set<EntityId>;
  focusEntityId?: EntityId;
}): AtlasMapSummary {
  const weakEntityIds = input.weakEntityIds ?? new Set<EntityId>();
  const visibleRelations = [...input.index.relations.values()].filter((relation) => relationMatches(input.index, relation, input.filters, weakEntityIds));
  const visibleNodeIds = new Set<EntityId>(visibleRelations.flatMap((relation) => [relation.fromId, relation.toId]));

  if (visibleRelations.length === 0) {
    const fallbackNodes = [...input.graph.nodes.values()]
      .filter((node) => nodeMatches(node, input.filters, weakEntityIds))
      .slice(0, 12)
      .map((node) => toNodeSummary(input.graph, node.id, weakEntityIds))
      .filter(isDefined);

    return {
      totalNodeCount: fallbackNodes.length,
      totalRelationCount: 0,
      weakNodeCount: fallbackNodes.filter((item) => item.isWeak).length,
      focusedNode: fallbackNodes[0],
      focusCandidates: fallbackNodes,
      visibleNodes: fallbackNodes,
      visibleRelations: [],
      neighbors: []
    };
  }

  const visibleNodes = [...visibleNodeIds]
    .map((nodeId) => toNodeSummary(input.graph, nodeId, weakEntityIds))
.filter(isDefined)
    .sort((left, right) => right.relationCount - left.relationCount || left.label.localeCompare(right.label, 'cs'));

  const focusCandidates = visibleNodes.slice(0, 12);
  const resolvedFocusId = input.focusEntityId && visibleNodeIds.has(input.focusEntityId) ? input.focusEntityId : focusCandidates[0]?.id;
  const focusedNode = resolvedFocusId ? visibleNodes.find((node) => node.id === resolvedFocusId) : undefined;
  const neighbors = resolvedFocusId
    ? selectNodeNeighbors({ index: input.index, graph: input.graph, nodeId: resolvedFocusId, weakEntityIds, filters: input.filters })
    : [];

  return {
    totalNodeCount: visibleNodes.length,
    totalRelationCount: visibleRelations.length,
    weakNodeCount: visibleNodes.filter((item) => item.isWeak).length,
    focusedNode,
    focusCandidates,
    visibleNodes: visibleNodes.slice(0, 18),
    visibleRelations,
    neighbors
  };
}

export function selectAtlasPathSummaries(input: {
  index: ContentIndex;
  knowledgeStates?: KnowledgeState[];
  disciplineIds?: DisciplineId[];
}): AtlasPathSummary[] {
  const allowed = input.disciplineIds && input.disciplineIds.length > 0 ? new Set(input.disciplineIds) : undefined;

  return [...input.index.paths.values()]
    .filter((path) => !allowed || path.disciplineIds.some((disciplineId) => allowed.has(disciplineId)))
    .map((path) => {
      const resolved = resolvePath(input.index, path.id, input.knowledgeStates ?? []);
      return {
        id: path.id,
        title: path.title,
        didacticGoal: path.didacticGoal,
        disciplineIds: path.disciplineIds,
        completionRatio: resolved?.completionRatio ?? 0,
        nextUnmasteredStepLabel: resolved?.steps.find((step) => !step.mastered)?.label,
        stepLabels: (resolved?.steps ?? []).map((step) => ({
          id: step.id,
          label: step.label,
          mastered: step.mastered,
          role: step.role
        })),
        contrastQuestion: path.contrastMoments[0]?.question,
        recommendedDifficulty: path.recommendedDifficulty
      };
    })
    .sort((left, right) => right.completionRatio - left.completionRatio || left.title.localeCompare(right.title, 'cs'));
}

export function selectAtlasFocusTrail(graph: ContentGraph, focusEntityId?: EntityId): AtlasMapNodeSummary[] {
  if (!focusEntityId) {
    return [];
  }

  return breadthFirstTraversal(graph, focusEntityId, 2)
    .map((item) => {
      const node = getNode(graph, item.entityId);
      if (!node) {
        return undefined;
      }

      return {
        id: node.id,
        label: node.label,
        kind: node.kind,
        disciplineIds: node.disciplineIds,
        eraId: node.eraId,
        priority: node.priority,
        relationCount: (graph.adjacency.get(node.id)?.length ?? 0) + (graph.reverseAdjacency.get(node.id)?.length ?? 0),
        isWeak: false
      };
    })
.filter(isDefined);
}

function selectNodeNeighbors(input: {
  index: ContentIndex;
  graph: ContentGraph;
  nodeId: EntityId;
  weakEntityIds: Set<EntityId>;
  filters: AtlasFiltersState;
}): AtlasNeighborSummary[] {
  const outgoing = (input.graph.adjacency.get(input.nodeId) ?? [])
    .map((edge) => input.index.relations.get(edge.id.replace(/::reverse$/, '')))
    .filter((relation): relation is RelationRecord => Boolean(relation))
    .filter((relation) => relationMatches(input.index, relation, input.filters, input.weakEntityIds))
    .map((relation) => ({
      relationId: relation.id,
      relationType: relation.type,
      label: labelForRelationType(relation.type),
      explanation: relation.explanation,
      neighborId: relation.toId,
      neighborLabel: getEntityLabel(input.index, relation.toId),
      direction: 'outgoing' as const,
      isWeak: input.weakEntityIds.has(relation.toId)
    }));

  const incoming = (input.graph.reverseAdjacency.get(input.nodeId) ?? [])
    .map((edge) => input.index.relations.get(edge.id.replace(/::reverse$/, '')))
    .filter((relation): relation is RelationRecord => Boolean(relation))
    .filter((relation) => relationMatches(input.index, relation, input.filters, input.weakEntityIds))
    .map((relation) => ({
      relationId: relation.id,
      relationType: relation.type,
      label: labelForRelationType(relation.type),
      explanation: relation.explanation,
      neighborId: relation.fromId,
      neighborLabel: getEntityLabel(input.index, relation.fromId),
      direction: 'incoming' as const,
      isWeak: input.weakEntityIds.has(relation.fromId)
    }));

  return [...outgoing, ...incoming]
    .sort((left, right) => left.neighborLabel.localeCompare(right.neighborLabel, 'cs'))
    .slice(0, 12);
}

function relationMatches(
  index: ContentIndex,
  relation: RelationRecord,
  filters: AtlasFiltersState,
  weakEntityIds: Set<EntityId>
): boolean {
  if (filters.relationTypes.length > 0 && !filters.relationTypes.includes(relation.type)) {
    return false;
  }

  const fromNode = index.entities.get(relation.fromId);
  const toNode = index.entities.get(relation.toId);

  if (!fromNode || !toNode) {
    return false;
  }

  const disciplineIds = [
    ...('disciplines' in fromNode ? fromNode.disciplines : fromNode.disciplineIds),
    ...('disciplines' in toNode ? toNode.disciplines : toNode.disciplineIds)
  ];

  if (filters.disciplineIds.length > 0 && !disciplineIds.some((disciplineId) => filters.disciplineIds.includes(disciplineId))) {
    return false;
  }

  const tagIds = [...relation.tags, ...('tags' in fromNode ? fromNode.tags : []), ...('tags' in toNode ? toNode.tags : [])];
  if (filters.tagIds.length > 0 && !tagIds.some((tagId) => filters.tagIds.includes(tagId))) {
    return false;
  }

  const eraIds = [
    'eraId' in fromNode ? fromNode.eraId : undefined,
    'eraId' in toNode ? toNode.eraId : undefined
  ].filter((item): item is EraId => Boolean(item));
  if (filters.eraIds.length > 0 && !eraIds.some((eraId) => filters.eraIds.includes(eraId))) {
    return false;
  }

  if (filters.showOnlyWeakAreas && !(weakEntityIds.has(relation.fromId) || weakEntityIds.has(relation.toId))) {
    return false;
  }

  return true;
}

function nodeMatches(node: GraphNode, filters: AtlasFiltersState, weakEntityIds: Set<EntityId>): boolean {
  if (filters.disciplineIds.length > 0 && !node.disciplineIds.some((disciplineId) => filters.disciplineIds.includes(disciplineId))) {
    return false;
  }

  if (filters.eraIds.length > 0 && node.eraId && !filters.eraIds.includes(node.eraId)) {
    return false;
  }

  if (filters.tagIds.length > 0 && !node.tags.some((tagId) => filters.tagIds.includes(tagId))) {
    return false;
  }

  if (filters.showOnlyWeakAreas && !weakEntityIds.has(node.id)) {
    return false;
  }

  return true;
}

function toNodeSummary(graph: ContentGraph, nodeId: EntityId, weakEntityIds: Set<EntityId>): AtlasMapNodeSummary | undefined {
  const node = graph.nodes.get(nodeId);
  if (!node) {
    return undefined;
  }

  return {
    id: node.id,
    label: node.label,
    kind: node.kind,
    disciplineIds: node.disciplineIds,
    eraId: node.eraId,
    priority: node.priority,
    relationCount: (graph.adjacency.get(node.id)?.length ?? 0) + (graph.reverseAdjacency.get(node.id)?.length ?? 0),
    isWeak: weakEntityIds.has(node.id)
  };
}

export function labelForDiscipline(disciplineId: string): string {
  return disciplineLabelMap[disciplineId] ?? humanizeSlug(disciplineId);
}

export function labelForRelationType(type: RelationType): string {
  return relationTypeLabelMap[type] ?? humanizeSlug(type);
}

export function labelForTag(tagId: string): string {
  return tagLabelMap[tagId] ?? humanizeSlug(tagId);
}

function humanizeSlug(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const disciplineLabelMap: Record<string, string> = {
  'specialni-pedagogika-a-dejiny-oboru': 'Speciální pedagogika a dějiny oboru',
  psychopedie: 'Psychopedie',
  somatopedie: 'Somatopedie',
  logopedie: 'Logopedie',
  surdopedie: 'Surdopedie',
  tyflopedie: 'Tyflopedie',
  etopedie: 'Etopedie',
  'diagnostika-a-psychometrie': 'Diagnostika a psychometrie',
  'psychologie-psychiatrie-a-psychoterapie': 'Psychologie, psychiatrie a psychoterapie',
  'andragogika-a-gerontagogika': 'Andragogika a gerontagogika',
  'novodoba-ceska-tradice-a-institucni-rozvoj': 'Novodobá česká tradice a institucionální rozvoj'
};

const relationTypeLabelMap: Record<RelationType, string> = {
  'associated-with': 'spojeno s',
  founded: 'založil nebo založila',
  developed: 'rozvinul nebo rozvinula',
  revised: 'revidoval nebo revidovala',
  'co-authored': 'spoluautorství',
  influenced: 'ovlivnil nebo ovlivnila',
  introduced: 'uvedl nebo uvedla',
  led: 'vedl nebo vedla',
  'worked-at': 'působil nebo působila v instituci',
  studied: 'studoval nebo studovala',
  taught: 'vyučoval nebo vyučovala',
  'belongs-to-discipline': 'patří do disciplíny',
  'represents-approach': 'reprezentuje přístup',
  'contrasts-with': 'kontrastuje s',
  preceded: 'předchází',
  succeeded: 'navazuje na',
  inspired: 'inspiroval nebo inspirovala',
  treated: 'léčil nebo léčila',
  diagnosed: 'diagnosticky popsal nebo popsala',
  'used-method': 'pracoval nebo pracovala metodou',
  'created-system': 'vytvořil nebo vytvořila systém',
  'related-to': 'souvisí s'
};

const tagLabelMap: Record<string, string> = {
  instituce: 'Instituce',
  metoda: 'Metoda',
  skala: 'Škála',
  diagnostika: 'Diagnostika',
  'historicka-linie': 'Historická linie',
  'zahranicni-prostredi': 'Zahraniční prostředí',
  'ceske-prostredi': 'České prostředí',
  'slovenske-prostredi': 'Slovenské prostředí'
};
