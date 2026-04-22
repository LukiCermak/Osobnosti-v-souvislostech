import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import type { StudyHint } from '@/types/study';

export interface DifferenceHintProps {
  hints: StudyHint[];
  revealedHintIds: string[];
  showDifferenceHints: boolean;
  onRevealNext: () => void;
}

export function DifferenceHint({ hints, revealedHintIds, showDifferenceHints, onRevealNext }: DifferenceHintProps) {
  if (!showDifferenceHints) {
    return null;
  }

  const revealedHints = hints.filter((hint) => revealedHintIds.includes(hint.id));
  const nextHint = hints.find((hint) => !revealedHintIds.includes(hint.id));
  const currentHint = revealedHints[revealedHints.length - 1];

  return (
    <Card
      as="section"
      className="lab-hint-card"
      eyebrow="Rozlišovací nápověda"
      title={currentHint?.title ?? 'Zatím bez nápovědy'}
      subtitle={
        currentHint?.text ??
        'Když si nejsi jistý, můžeš si odkrýt další rozlišovací stopu a teprve potom odpověď potvrdit.'
      }
    >
      {revealedHints.length > 1 ? (
        <div className="stack gap-sm">
          <p className="subsection-title">Dříve odkryté stopy</p>
          <ul className="feature-list">
            {revealedHints.slice(0, -1).map((hint) => (
              <li key={hint.id}>{hint.title}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {nextHint ? (
        <div className="button-row">
          <Button variant="secondary" onClick={onRevealNext}>
            Odkrýt další nápovědu
          </Button>
        </div>
      ) : (
        <p className="text-body">Všechny dostupné nápovědy už jsou odkryté.</p>
      )}
    </Card>
  );
}
