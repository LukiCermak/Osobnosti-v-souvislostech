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

  return (
    <Card
      as="section"
      eyebrow="Rozlišovací nápověda"
      title={revealedHints.length > 0 ? revealedHints[revealedHints.length - 1].title : 'Zatím bez nápovědy'}
      subtitle={revealedHints.length > 0 ? revealedHints[revealedHints.length - 1].text : 'Když si nejsi jistý, můžeš si odkryt další rozlišovací stopu.'}
    >
      {revealedHints.length > 1 ? (
        <ul className="feature-list">
          {revealedHints.slice(0, -1).map((hint) => (
            <li key={hint.id}>{hint.title}</li>
          ))}
        </ul>
      ) : null}
      {nextHint ? (
        <div>
          <Button variant="secondary" onClick={onRevealNext}>
            Odkryt další nápovědu
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
