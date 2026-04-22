import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '@/types/ui';

export interface TopNavProps {
  items: NavigationItem[];
  ariaLabel: string;
  className?: string;
}

export function TopNav({ items, ariaLabel, className }: TopNavProps) {
  return (
    <nav
      className={['top-nav panel', className ?? ''].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <NavLink
          key={item.id}
          end={item.path === '/'}
          to={item.path}
          className={({ isActive }) => ['top-nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
