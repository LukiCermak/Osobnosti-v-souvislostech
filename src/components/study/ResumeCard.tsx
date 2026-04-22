import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { formatDateTime } from '@/utils/dates';
import type { SessionStateRow } from '@/types/database';

export interface ResumeCardProps {
  session?: SessionStateRow;
  onResume?: () => void;
  onStartNew?: () => void;
}

export function ResumeCard({ session, onResume, onStartNew }: ResumeCardProps) {
  if (!session) {
    return null;
  }

  return (
    <Card
      as="section"
      eyebrow="Rozpracované studium"
      title="Můžeš navázat tam, kde jsi skončil"
      subtitle="Aplikace si pamatuje poslední rozpracovanou relaci a nabídne plynulé pokračování."
    >
      <ul className="feature-list">
        <li>{`Režim: ${mapModeLabel(session.mode)}`}</li>
        <li>{`Zbývající úkoly: ${session.remainingTaskIds.length + (session.currentTaskId ? 1 : 0)}`}</li>
        <li>{`Poslední změna: ${formatDateTime(session.updatedAt)}`}</li>
      </ul>
      <div className="button-row">
        {onResume ? <Button onClick={onResume}>Pokračovat</Button> : null}
        {onStartNew ? (
          <Button variant="secondary" onClick={onStartNew}>
            Začít novou relaci
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function mapModeLabel(mode: SessionStateRow['mode']): string {
  switch (mode) {
    case 'atlas':
      return 'Atlas souvislostí';
    case 'cases':
      return 'Detektivní spisy';
    case 'lab':
      return 'Laboratoř rozlišení';
  }
}
