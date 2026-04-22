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
  isSolved?: boolean;
  correctCount?: number;
  totalQuestions?: number;
  onReturnToLibrary?: () => void;
  onStartNewCase?: () => void;
}

export function CaseSummary({
  title,
  synthesisPrompt,
  followUpExplanation,
  synthesisDraft,
  onChangeSynthesis,
  onToggleOpen,
  isOpen,
  isCompleted,
  isSolved = false,
  correctCount = 0,
  totalQuestions = 0,
  onReturnToLibrary,
  onStartNewCase
}: CaseSummaryProps) {
  if (!isOpen && !isCompleted) {
    return (
      <Card
        as="section"
        eyebrow="Závěrečné shrnutí"
        title="Shrnutí případu"
        subtitle="Po zpracování indicií a odpovědí uzavřeš spis vlastním shrnutím, které propojí hlavní osobnosti, pojmy a souvislosti."
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
      eyebrow={isCompleted ? 'Výsledek spisu' : 'Závěrečné shrnutí'}
      title={title}
      subtitle={isCompleted ? 'Spis je uzavřený. Teď je důležité vědět, s čím z něj odejdeš a na co navázat dál.' : synthesisPrompt}
      highlight={isCompleted}
      className="case-summary-card"
    >
      {isCompleted ? (
        <div className="case-outcome-grid">
          <div className="case-outcome-panel">
            <p className="eyebrow">{isSolved ? 'Spis vyřešený' : 'Spis uzavřený s rezervou'}</p>
            <h3 className="subsection-title">
              {isSolved
                ? 'Hlavní souvislosti v případu jsou rozpoznané správně.'
                : 'Případ je dokončený, ale vyplatí se vrátit k některým otázkám a souvislostem.'}
            </h3>
            <p className="text-body">{`Správně vyhodnocené otázky: ${correctCount} z ${totalQuestions}.`}</p>
          </div>
          <div className="panel panel-contrast stack gap-sm">
            <h3 className="subsection-title">Co si ze spisu odnést</h3>
            <p className="text-body">{followUpExplanation}</p>
          </div>
        </div>
      ) : null}

      <label className="stack gap-sm">
        <span className="subsection-title">Vlastní shrnutí</span>
        <textarea
          className="input case-synthesis-input"
          value={synthesisDraft}
          onChange={(event) => onChangeSynthesis(event.target.value)}
          rows={5}
          placeholder="Stručně shrň, jak spolu osobnosti, pojmy a souvislosti v tomto spisu souvisejí."
        />
      </label>

      {!isCompleted ? (
        <div className="panel panel-contrast stack gap-sm">
          <h3 className="subsection-title">Opora po vyhodnocení</h3>
          <p className="text-body">{followUpExplanation}</p>
        </div>
      ) : null}

      {isCompleted && (onReturnToLibrary || onStartNewCase) ? (
        <div className="button-row">
          {onReturnToLibrary ? (
            <Button variant="secondary" onClick={onReturnToLibrary}>
              Vrátit se do knihovny spisů
            </Button>
          ) : null}
          {onStartNewCase ? <Button onClick={onStartNewCase}>Otevřít další spis</Button> : null}
        </div>
      ) : null}
    </Card>
  );
}
