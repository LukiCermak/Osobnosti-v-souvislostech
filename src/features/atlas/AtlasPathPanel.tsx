import { ProgressRing } from '@/components/charts/ProgressRing';
import { Card } from '@/components/shared/Card';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import { SectionTitle } from '@/components/shared/SectionTitle';
import type { AtlasPathSummary } from '@/features/atlas/atlas.selectors';
import { labelForDiscipline } from '@/features/atlas/atlas.selectors';
import { joinLabels } from '@/utils/text';

export interface AtlasPathPanelProps {
  paths: AtlasPathSummary[];
  selectedPathId?: string;
  onSelectPath: (pathId: string) => void;
  onApplyPath: (pathId: string) => void;
}

export function AtlasPathPanel({ paths, selectedPathId, onSelectPath, onApplyPath }: AtlasPathPanelProps) {
  return (
    <section className="panel stack gap-lg">
      <SectionTitle
        eyebrow="Studijní trasy"
        title="Kurátorské osy v Atlasu"
        subtitle="Vyber trasu, která ti pomůže projít obor jako navazující linii, ne jako izolovaný seznam jmen."
      />

      <div className="stack gap-md">
        {paths.map((path) => (
          <Card
            key={path.id}
            as="article"
            className={selectedPathId === path.id ? 'atlas-path-card is-selected' : 'atlas-path-card'}
            title={path.title}
            subtitle={path.didacticGoal}
            eyebrow={joinLabels(path.disciplineIds.map(labelForDiscipline))}
          >
            <div className="atlas-path-layout">
              <ProgressRing value={path.completionRatio} max={1} size={92} caption="Průchod trasou" />
              <div className="stack gap-sm">
                <div className="atlas-focus-meta">
                  <ProgressBadge label="obtížnost" value={difficultyLabel(path.recommendedDifficulty)} tone="growing" />
                  {path.nextUnmasteredStepLabel ? (
                    <ProgressBadge label="další krok" value={path.nextUnmasteredStepLabel} tone="needs-review" />
                  ) : (
                    <ProgressBadge label="stav" value="trasa je zatím otevřená" tone="mastered" />
                  )}
                </div>
                <ul className="feature-list atlas-step-list">
                  {path.stepLabels.slice(0, 6).map((step) => (
                    <li key={step.id}>
                      {step.label}
                      {step.mastered ? ' • upevněno' : ` • role ${step.role}`}
                    </li>
                  ))}
                </ul>
                {path.contrastQuestion ? <p className="text-body">{path.contrastQuestion}</p> : null}
                <div className="button-row">
                  <button className="button button-secondary" type="button" onClick={() => onSelectPath(path.id)}>
                    {selectedPathId === path.id ? 'Trasa je vybraná' : 'Vybrat trasu'}
                  </button>
                  <button className="button" type="button" onClick={() => onApplyPath(path.id)}>
                    Použít trasu pro studijní blok
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function difficultyLabel(value: AtlasPathSummary['recommendedDifficulty']): string {
  switch (value) {
    case 'introductory':
      return 'úvodní';
    case 'intermediate':
      return 'střední';
    case 'advanced':
      return 'pokročilá';
  }
}
