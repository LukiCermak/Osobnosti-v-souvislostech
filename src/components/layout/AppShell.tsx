import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import type { NavigationItem } from '@/types/ui';

export interface AppShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  navigationItems: NavigationItem[];
  actions?: ReactNode;
  sidebar?: ReactNode;
  sidebarTitle?: string;
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  title,
  subtitle,
  eyebrow,
  navigationItems,
  actions,
  sidebar,
  sidebarTitle,
  sidebarFooter,
  children
}: AppShellProps) {
  return (
    <div className="app-shell app-shell-layout">
      <div className="shell-width stack gap-lg">
        <Header title={title} subtitle={subtitle} eyebrow={eyebrow} actions={actions} />
        <div className="shell-nav-row">
          <TopNav items={navigationItems} ariaLabel="Hlavní navigace" />
          <Link className="button button-secondary shell-settings-link" to="/nastaveni">
            Nastavení
          </Link>
        </div>
        <div className={sidebar ? 'app-layout-grid' : 'content-frame stack gap-lg'}>
          {sidebar ? (
            <Sidebar title={sidebarTitle} footer={sidebarFooter}>
              {sidebar}
            </Sidebar>
          ) : null}
          <main className="stack gap-lg content-frame">{children}</main>
        </div>
      </div>
    </div>
  );
}
