import type { DisciplineId, EntityId, RelationRecord, RelationType } from '@/types/content';
import type { ContentIndex } from '@/core/content/contentIndex';
import type { ContentGraph, GraphEdge, GraphNode } from '@/core/graph/graphBuilder';

export interface GraphTraversalNode {
  entityId: EntityId;
  depth: number;
  viaRelationId?: string;
}

export function getNode(graph: ContentGraph, entityId: EntityId): GraphNode | undefined {
  return graph.nodes.get(entityId);
}

export function getNeighbors(graph: ContentGraph, entityId: EntityId): GraphNode[] {
  return (graph.adjacency.get(entityId) ?? [])
    .map((edge) => graph.nodes.get(edge.toId))
    .filter((node): node is GraphNode => Boolean(node));
}

export function getEdgesByType(index: ContentIndex, relationType: RelationType): RelationRecord[] {
  return [...(index.relationsByType.get(relationType) ?? [])];
}

export function getDisciplineSubgraph(graph: ContentGraph, disciplineId: DisciplineId): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = [...graph.nodes.values()].filter((node) => node.disciplineIds.includes(disciplineId));
  const allowed = new Set(nodes.map((node) => node.id));
  const edges = [...graph.edges.values()].filter((edge) => allowed.has(edge.fromId) && allowed.has(edge.toId));
  return { nodes, edges };
}

export function breadthFirstTraversal(graph: ContentGraph, startId: EntityId, maxDepth = 2): GraphTraversalNode[] {
  const queue: GraphTraversalNode[] = [{ entityId: startId, depth: 0 }];
  const visited = new Set<EntityId>([startId]);
  const result: GraphTraversalNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    result.push(current);

    if (current.depth >= maxDepth) {
      continue;
    }

    for (const edge of graph.adjacency.get(current.entityId) ?? []) {
      if (visited.has(edge.toId)) {
        continue;
      }

      visited.add(edge.toId);
      queue.push({
        entityId: edge.toId,
        depth: current.depth + 1,
        viaRelationId: edge.id
      });
    }
  }

  return result;
}

export function findShortestEntityPath(graph: ContentGraph, fromId: EntityId, toId: EntityId): EntityId[] {
  if (fromId === toId) {
    return [fromId];
  }

  const queue: EntityId[] = [fromId];
  const previous = new Map<EntityId, EntityId | null>([[fromId, null]]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) {
      continue;
    }

    for (const edge of graph.adjacency.get(currentId) ?? []) {
      if (previous.has(edge.toId)) {
        continue;
      }

      previous.set(edge.toId, currentId);
      if (edge.toId === toId) {
        return reconstructPath(previous, toId);
      }
      queue.push(edge.toId);
    }
  }

  return [];
}

function reconstructPath(previous: Map<EntityId, EntityId | null>, targetId: EntityId): EntityId[] {
  const path: EntityId[] = [];
  let current: EntityId | null | undefined = targetId;

  while (current) {
    path.push(current);
    current = previous.get(current) ?? null;
  }

  return path.reverse();
}
