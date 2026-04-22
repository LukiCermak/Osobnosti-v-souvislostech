import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import type { AtlasMapSummary } from '@/features/atlas/atlas.selectors';
import { labelForDiscipline, labelForRelationType } from '@/features/atlas/atlas.selectors';
import { joinLabels } from '@/utils/text';

export interface AtlasMapProps {
  summary: AtlasMapSummary;
  onFocusEntity: (entityId: string) => void;
}

export function AtlasMap({ summary, onFocusEntity }: AtlasMapProps) {
  if (summary.totalNodeCount === 0) {
    return (
      <EmptyState
        title="Ve zvoleném řezu teď nejsou žádné vazby"
        description="Zkus rozšířit filtry nebo vypnout zobrazení jen slabých míst."
      />
    );
  }

  return (
    <div className="stack gap-lg">
      <section className="grid grid-3 atlas-summary-grid">
        <SummaryCard title="Uzly v záběru" value={summary.totalNodeCount} description="Osobnosti a pojmy, které zůstaly po aplikaci filtrů." />
        <SummaryCard title="Zobrazené vazby" value={summary.totalRelationCount} description="Vztahy, z nichž Atlas právě skládá síť souvislostí." />
        <SummaryCard title="Rizikové uzly" value={summary.weakNodeCount} description="Jednotky, které se objevují ve slabých místech a častých záměnách." />
      </section>

      <Card
        as="section"
        className="atlas-focus-card"
        eyebrow="Fokus mapy"
        title="Který uzel chceš sledovat"
        subtitle="Vyber centrum mapy a Atlas ukáže přímé návaznosti v obou směrech."
      >
        <div className="atlas-node-grid">
          {summary.focusCandidates.map((node) => (
            <button
              key={node.id}
              className={['atlas-node-button', summary.focusedNode?.id === node.id ? 'is-active' : ''].filter(Boolean).join(' ')}
              type="button"
              onClick={() => onFocusEntity(node.id)}
            >
              <div className="atlas-node-icon" aria-hidden="true">
                {node.kind === 'person' ? 'Os' : 'Po'}
              </div>
              <div className="stack gap-sm">
                <strong>{node.label}</strong>
                <span className="text-body">{joinLabels(node.disciplineIds.map(labelForDiscipline))}</span>
                <div className="atlas-node-meta-row">
                  <ProgressBadge label="vazby" value={node.relationCount} tone="growing" />
                  {node.isWeak ? <ProgressBadge label="slabé místo" tone="needs-review" /> : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {summary.focusedNode ? (
        <Card
          as="section"
          className="atlas-node-detail-card"
          eyebrow="Detail zvoleného uzlu"
          title={summary.focusedNode.label}
          subtitle={`Oborové zařazení: ${joinLabels(summary.focusedNode.disciplineIds.map(labelForDiscipline))}`}
        >
          <div className="atlas-focus-meta">
            <ProgressBadge label="typ" value={summary.focusedNode.kind === 'person' ? 'osobnost' : 'pojem'} tone="growing" />
            <ProgressBadge label="priorita" value={priorityLabel(summary.focusedNode.priority)} tone={priorityTone(summary.focusedNode.priority)} />
            {summary.focusedNode.isWeak ? <ProgressBadge label="slabé místo" tone="needs-review" /> : null}
          </div>

          <div className="atlas-node-hero">
            <div className="atlas-node-icon atlas-node-icon-large" aria-hidden="true">
              {summary.focusedNode.kind === 'person' ? 'Os' : 'Po'}
            </div>
            <div className="stack gap-sm">
              <h3 className="subsection-title">Přímé návaznosti</h3>
              <p className="text-body">
                Atlas ukazuje vztahy, které vedou od zvoleného uzlu nebo k němu míří.
              </p>
            </div>
          </div>

          <div className="stack gap-md">
            {summary.neighbors.map((neighbor) => (
              <article key={`${neighbor.direction}:${neighbor.relationId}:${neighbor.neighborId}`} className="atlas-relation-row">
                <div className="stack gap-sm">
                  <div className="atlas-relation-headline">
                    <strong>{neighbor.neighborLabel}</strong>
                    <span className="text-body">
                      {neighbor.direction === 'outgoing' ? 'navazuje od středu' : 'vede ke středu'}
                    </span>
                  </div>
                  <p className="text-body">{neighbor.explanation}</p>
                  <div className="atlas-focus-meta">
                    <ProgressBadge label="typ vazby" value={labelForRelationType(neighbor.relationType)} tone="growing" />
                    {neighbor.isWeak ? <ProgressBadge label="častá záměna" tone="needs-review" /> : null}
                  </div>
                </div>
                <button className="button button-secondary button-size-sm" type="button" onClick={() => onFocusEntity(neighbor.neighborId)}>
                  Přesunout fokus
                </button>
              </article>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function SummaryCard(props: { title: string; value: number; description: string }) {
  return (
    <Card as="section" title={props.title} subtitle={props.description}>
      <strong className="atlas-summary-number">{props.value}</strong>
    </Card>
  );
}

function priorityLabel(priority: 'core' | 'important' | 'context'): string {
  switch (priority) {
    case 'core':
      return 'jádrová';
    case 'important':
      return 'důležitá';
    case 'context':
      return 'kontextová';
  }
}

function priorityTone(priority: 'core' | 'important' | 'context'): 'mastered' | 'growing' | 'needs-review' {
  switch (priority) {
    case 'core':
      return 'mastered';
    case 'important':
      return 'growing';
    case 'context':
      return 'needs-review';
  }
}
