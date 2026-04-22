import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { NavigationItem } from '@/types/ui';

export interface SidebarProps {
  items: NavigationItem[];
  title?: string;
  footer?: ReactNode;
}

export function Sidebar({ items, title, footer }: SidebarProps) {
  return (
    <aside className="sidebar panel" aria-label={title ?? 'Postranní navigace'}>
      <div className="stack gap-md">
        {title ? <h2 className="subsection-title">{title}</h2> : null}
        <nav className="stack gap-sm">
          {items.map((item) => (
            <NavLink
              key={item.id}
              end={item.path === '/'}
              to={item.path}
              className={({ isActive }) => ['sidebar-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {footer ? <div>{footer}</div> : null}
      </div>
    </aside>
  );
}
