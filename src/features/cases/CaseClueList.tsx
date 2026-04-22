import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import type { CaseRecord } from '@/types/content';

export interface CaseClueListProps {
  clues: CaseRecord['clues'];
  nextClue?: CaseRecord['clues'][number];
  onRevealNext?: () => void;
}

export function CaseClueList({ clues, nextClue, onRevealNext }: CaseClueListProps) {
  return (
    <Card
      as="section"
      eyebrow="Indicie"
      title="Stopa po stopě"
      subtitle="Indicie se odemykají postupně. Každá další stopa zužuje prostor správného řešení."
    >
      <ol className="case-clue-list">
        {clues.map((clue, index) => (
          <li key={clue.id} className="case-clue-item">
            <p className="eyebrow">{`Stopa ${index + 1}`}</p>
            <h3 className="subsection-title">{clue.title}</h3>
            <p className="text-body">{clue.text}</p>
          </li>
        ))}
      </ol>

      {nextClue && onRevealNext ? (
        <div className="button-row">
          <Button variant="secondary" onClick={onRevealNext}>
            {`Odhalit další stopu: ${nextClue.title}`}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
