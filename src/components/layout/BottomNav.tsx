import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '@/types/ui';

export interface BottomNavProps {
  items: NavigationItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="bottom-nav panel" aria-label="Spodní navigace">
      {items.map((item) => (
        <NavLink
          key={item.id}
          end={item.path === '/'}
          to={item.path}
          className={({ isActive }) => ['bottom-nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
