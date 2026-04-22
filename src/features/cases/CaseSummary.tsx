import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

export interface CaseSummaryProps {
  title: string;
  synthesisPrompt: string;
  followUpExplanation: string;
  synthesisDraft: string;
  onChangeSynthesis: (value: string) => void;
  onToggleOpen?: () => void;
  isOpen: boolean;
  isCompleted: boolean;
}

export function CaseSummary({
  title,
  synthesisPrompt,
  followUpExplanation,
  synthesisDraft,
  onChangeSynthesis,
  onToggleOpen,
  isOpen,
  isCompleted
}: CaseSummaryProps) {
  if (!isOpen && !isCompleted) {
    return (
      <Card
        as="section"
        eyebrow="Závěrečná syntéza"
        title="Shrnutí případu"
        subtitle="Po zpracování indicií a odpovědí uzavřeš spis vlastní syntézou."
      >
        {onToggleOpen ? (
          <div className="button-row">
            <Button variant="secondary" onClick={onToggleOpen}>
              Otevřít shrnutí
            </Button>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card
      as="section"
      eyebrow={isCompleted ? 'Uzavřený spis' : 'Závěrečná syntéza'}
      title={title}
      subtitle={synthesisPrompt}
      highlight={isCompleted}
    >
      <label className="stack gap-sm">
        <span className="subsection-title">Vlastní shrnutí</span>
        <textarea
          className="input case-synthesis-input"
          value={synthesisDraft}
          onChange={(event) => onChangeSynthesis(event.target.value)}
          rows={5}
          placeholder="Stručně shrň, jak spolu osobnosti, pojmy a vazby v tomto spisu souvisejí."
        />
      </label>

      <div className="panel panel-contrast stack gap-sm">
        <h3 className="subsection-title">Opora po vyhodnocení</h3>
        <p className="text-body">{followUpExplanation}</p>
      </div>
    </Card>
  );
}
