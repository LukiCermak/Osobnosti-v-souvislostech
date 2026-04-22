import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export interface NextStepCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onContinue?: () => void;
  to?: string;
  detailItems?: string[];
}

export function NextStepCard({ title, description, actionLabel, onContinue, to, detailItems = [] }: NextStepCardProps) {
  return (
    <Card as="section" eyebrow="Doporučený další krok" title={title} subtitle={description}>
      {detailItems.length > 0 ? (
        <ul className="feature-list">
          {detailItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <div>
        {to ? (
          <Button to={to}>
            {actionLabel}
          </Button>
        ) : (
          <Button onClick={onContinue}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
