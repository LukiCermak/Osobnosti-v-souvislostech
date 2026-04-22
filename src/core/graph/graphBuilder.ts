import type {
  DisciplineId,
  EntityId,
  RelationId,
  RelationType,
  StudyPriority,
  TagId
} from '@/types/content';
import type { ContentIndex } from '@/core/content/contentIndex';

export interface GraphNode {
  id: EntityId;
  label: string;
  kind: 'person' | 'concept';
  disciplineIds: DisciplineId[];
  eraId?: string;
  priority: StudyPriority;
  tags: TagId[];
}

export interface GraphEdge {
  id: RelationId;
  fromId: EntityId;
  toId: EntityId;
  type: RelationType;
  weight: number;
  studyPriority: StudyPriority;
  suitableForContrast: boolean;
}

export interface ContentGraph {
  nodes: Map<EntityId, GraphNode>;
  edges: Map<RelationId, GraphEdge>;
  adjacency: Map<EntityId, GraphEdge[]>;
  reverseAdjacency: Map<EntityId, GraphEdge[]>;
}

export function buildContentGraph(index: ContentIndex): ContentGraph {
  const nodes = new Map<EntityId, GraphNode>();
  const edges = new Map<RelationId, GraphEdge>();
  const adjacency = new Map<EntityId, GraphEdge[]>();
  const reverseAdjacency = new Map<EntityId, GraphEdge[]>();

  for (const person of index.people.values()) {
    nodes.set(person.id, {
      id: person.id,
      label: person.displayName,
      kind: 'person',
      disciplineIds: person.disciplines,
      eraId: person.eraId,
      priority: person.studyPriority,
      tags: person.tags
    });
  }

  for (const concept of index.concepts.values()) {
    nodes.set(concept.id, {
      id: concept.id,
      label: concept.label,
      kind: 'concept',
      disciplineIds: concept.disciplineIds,
      priority: 'context',
      tags: concept.tags
    });
  }

  for (const relation of index.relations.values()) {
    const edge: GraphEdge = {
      id: relation.id,
      fromId: relation.fromId,
      toId: relation.toId,
      type: relation.type,
      weight: relationWeight(relation.studyPriority),
      studyPriority: relation.studyPriority,
      suitableForContrast: relation.suitableForContrast
    };

    edges.set(edge.id, edge);
    indexEdge(adjacency, relation.fromId, edge);
    indexEdge(reverseAdjacency, relation.toId, edge);

    if (relation.direction === 'bidirectional') {
      const reversedEdge: GraphEdge = {
        ...edge,
        id: `${edge.id}::reverse`,
        fromId: relation.toId,
        toId: relation.fromId
      };
      edges.set(reversedEdge.id, reversedEdge);
      indexEdge(adjacency, reversedEdge.fromId, reversedEdge);
      indexEdge(reverseAdjacency, reversedEdge.toId, reversedEdge);
    }
  }

  return { nodes, edges, adjacency, reverseAdjacency };
}

function relationWeight(priority: StudyPriority): number {
  switch (priority) {
    case 'core':
      return 1;
    case 'important':
      return 2;
    case 'context':
      return 3;
  }
}

function indexEdge(map: Map<EntityId, GraphEdge[]>, entityId: EntityId, edge: GraphEdge): void {
  const bucket = map.get(entityId);
  if (bucket) {
    bucket.push(edge);
    return;
  }

  map.set(entityId, [edge]);
}
