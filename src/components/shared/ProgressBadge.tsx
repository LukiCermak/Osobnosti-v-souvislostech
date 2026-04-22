import type { HTMLAttributes } from 'react';

export type ProgressTone = 'mastered' | 'growing' | 'needs-review' | 'at-risk';

export interface ProgressBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ProgressTone;
  label: string;
  value?: string | number;
}

export function ProgressBadge({ tone = 'growing', label, value, className, ...rest }: ProgressBadgeProps) {
  const classes = ['progress-badge', `progress-badge-${tone}`, className ?? ''].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      <span className="progress-badge-label">{label}</span>
      {value !== undefined ? <strong className="progress-badge-value">{value}</strong> : null}
    </span>
  );
}
