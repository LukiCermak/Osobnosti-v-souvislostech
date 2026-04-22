import type { ReactNode } from 'react';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  compact?: boolean;
}

export function SectionTitle({ title, subtitle, eyebrow, actions, compact = false }: SectionTitleProps) {
  return (
    <div className={[ 'section-title-row', compact ? 'section-title-row-compact' : '' ].filter(Boolean).join(' ')}>
      <div className="stack gap-sm">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="text-body">{subtitle}</p> : null}
      </div>
      {actions ? <div className="section-title-actions">{actions}</div> : null}
    </div>
  );
}
