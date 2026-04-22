import type { ReactNode } from 'react';
import { Button, type ButtonVariant } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export interface EmptyStateAction {
  label: string;
  to?: string;
  href?: string;
  onAction?: () => void;
  variant?: ButtonVariant;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  eyebrow?: string;
  illustration?: ReactNode;
  action?: EmptyStateAction;
}

export function EmptyState({ title, description, eyebrow, illustration, action }: EmptyStateProps) {
  return (
    <Card as="section" className="empty-state" eyebrow={eyebrow} title={title} subtitle={description}>
      {illustration ? <div className="state-illustration">{illustration}</div> : null}
      {action ? (
        <div>
          {action.to ? (
            <Button variant={action.variant ?? 'primary'} to={action.to}>
              {action.label}
            </Button>
          ) : action.href ? (
            <Button variant={action.variant ?? 'primary'} href={action.href}>
              {action.label}
            </Button>
          ) : (
            <Button variant={action.variant ?? 'primary'} onClick={action.onAction}>
              {action.label}
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
