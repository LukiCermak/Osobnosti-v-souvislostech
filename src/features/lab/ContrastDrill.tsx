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
    <Card as="section" eyebrow="Rozlisovaci uloha" title={task.prompt} subtitle={task.expectedOutcome}>
      <div className="lab-drill-layout">
        <div className="stack gap-md">
          <div className="atlas-focus-meta">
            <ProgressBadge label="Typ ulohy" value={mapMicrotaskType(task.microtaskType)} tone="mastered" />
            <ProgressBadge label="Napovedy" value={revealedHintIds.length} tone="growing" />
          </div>

          <QuickChoice task={task} selectedOptionId={selectedOptionId} onSelect={onSelect} />

          <div className="stack gap-sm">
            <p className="eyebrow">Jistota odpovedi</p>
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
              Vyhodnotit odpoved
            </Button>
            <Button variant="secondary" onClick={onSkip}>
              Preskocit
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
      return 'Dve jmena, jeden znak';
    case 'one-institution-two-people':
      return 'Jedna instituce, dve osobnosti';
    case 'one-scale-three-authors':
      return 'Jedna skala, vice autoru';
    case 'historical-sequence':
      return 'Historicka navaznost';
    case 'incorrect-link-detection':
      return 'Chybne spojeni';
    case 'definition-discrimination':
      return 'Rozliseni definice';
  }
}
