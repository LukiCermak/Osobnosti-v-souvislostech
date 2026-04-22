import { NavLink, useLocation } from 'react-router-dom';
import type { NavigationItem } from '@/types/ui';

export interface TopNavProps {
  items: NavigationItem[];
  ariaLabel: string;
  className?: string;
}

export function TopNav({ items, ariaLabel, className }: TopNavProps) {
  const location = useLocation();

  return (
    <nav
      className={['top-nav panel', className ?? ''].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        if (item.children && item.children.length > 0) {
          const isActive = item.children.some((child) => location.pathname === child.path);
          return (
            <details key={item.id} className={['top-nav-group', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}>
              <summary className="top-nav-link top-nav-summary">{item.label}</summary>
              <div className="top-nav-dropdown panel">
                {item.children.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    className={({ isActive: childActive }) =>
                      ['top-nav-dropdown-link', childActive ? 'is-active' : ''].filter(Boolean).join(' ')
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </details>
          );
        }

        return (
          <NavLink
            key={item.id}
            end={item.path === '/'}
            to={item.path}
            className={({ isActive }) => ['top-nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
