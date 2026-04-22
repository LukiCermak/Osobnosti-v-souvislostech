import type { ReactNode } from 'react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function Header({ title, subtitle, eyebrow, actions, meta }: HeaderProps) {
  return (
    <header className="app-header panel">
      <div className="stack gap-sm">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="header-row">
          <div className="stack gap-sm">
            <h1 className="app-title">{title}</h1>
            {subtitle ? <p className="text-body text-lead">{subtitle}</p> : null}
          </div>
          {actions ? <div className="header-actions">{actions}</div> : null}
        </div>
        {meta ? <div className="header-meta">{meta}</div> : null}
      </div>
    </header>
  );
}
