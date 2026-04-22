import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import { DifferenceHint } from '@/features/lab/DifferenceHint';
import { QuickChoice } from '@/features/lab/QuickChoice';
import type { LabTask, StudyAnswer } from '@/types/study';

export interface ContrastDrillProps {
  task: LabTask;
  selectedOptionId?: string;
  confidence: StudyAnswer['confidence'];
  revealedHintIds: string[];
  showDifferenceHints: boolean;
  onSelect: (optionId: string) => void;
  onConfidenceChange: (value: StudyAnswer['confidence']) => void;
  onRevealHint: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export function ContrastDrill({
  task,
  selectedOptionId,
  confidence,
  revealedHintIds,
  showDifferenceHints,
  onSelect,
  onConfidenceChange,
  onRevealHint,
  onSubmit,
  onSkip
}: ContrastDrillProps) {
  return (
    <Card
      as="section"
      eyebrow="Rozlišovací úloha"
      title={task.prompt}
      subtitle={task.expectedOutcome}
    >
      <div className="lab-drill-layout">
        <div className="stack gap-md">
          <div className="atlas-focus-meta">
            <ProgressBadge label="Typ úlohy" value={mapMicrotaskType(task.microtaskType)} tone="mastered" />
            <ProgressBadge label="Nápovědy" value={revealedHintIds.length} tone="growing" />
          </div>

          <QuickChoice task={task} selectedOptionId={selectedOptionId} onSelect={onSelect} />

          <div className="stack gap-sm">
            <p className="eyebrow">Jistota odpovědi</p>
            <div className="lab-confidence-row">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={['lab-confidence-button', confidence === value ? 'is-selected' : ''].filter(Boolean).join(' ')}
                  onClick={() => onConfidenceChange(value as StudyAnswer['confidence'])}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="button-row">
            <Button onClick={onSubmit} disabled={!selectedOptionId}>
              Vyhodnotit odpověď
            </Button>
            <Button variant="secondary" onClick={onSkip}>
              Přeskočit
            </Button>
          </div>
        </div>

        <DifferenceHint
          hints={task.hints}
          revealedHintIds={revealedHintIds}
          showDifferenceHints={showDifferenceHints}
          onRevealNext={onRevealHint}
        />
      </div>
    </Card>
  );
}

function mapMicrotaskType(taskType: LabTask['microtaskType']): string {
  switch (taskType) {
    case 'two-names-one-attribute':
      return 'Dvě jména, jeden znak';
    case 'one-institution-two-people':
      return 'Jedna instituce, dvě osobnosti';
    case 'one-scale-three-authors':
      return 'Jedna škála, více autorů';
    case 'historical-sequence':
      return 'Historická návaznost';
    case 'incorrect-link-detection':
      return 'Chybné spojení';
    case 'definition-discrimination':
      return 'Rozlišení definice';
  }
}
