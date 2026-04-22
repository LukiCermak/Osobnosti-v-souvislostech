import type { ReactNode } from 'react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export interface ErrorStateProps {
  title: string;
  description: string;
  details?: string;
  actionLabel?: string;
  onRetry?: () => void;
  footer?: ReactNode;
}

export function ErrorState({ title, description, details, actionLabel, onRetry, footer }: ErrorStateProps) {
  return (
    <Card as="section" className="error-state" eyebrow="Potřebuje pozornost" title={title} subtitle={description}>
      {details ? <pre className="error-state-details">{details}</pre> : null}
      {onRetry && actionLabel ? (
        <div>
          <Button variant="danger" onClick={onRetry}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
      {footer ? <div>{footer}</div> : null}
    </Card>
  );
}
