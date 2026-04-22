import type { ReactNode } from 'react';

export interface SidebarProps {
  title?: string;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Sidebar({ title, footer, children }: SidebarProps) {
  return (
    <aside className="sidebar panel" aria-label={title ?? 'Postranni panel'}>
      <div className="stack gap-md">
        {title ? <h2 className="subsection-title">{title}</h2> : null}
        {children ? <div className="stack gap-md">{children}</div> : null}
        {footer ? <div>{footer}</div> : null}
      </div>
    </aside>
  );
}
