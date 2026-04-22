import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import type { NavigationItem } from '@/types/ui';

export interface AppShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  navigationItems: NavigationItem[];
  modeNavigationItems?: NavigationItem[];
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
  modeNavigationItems,
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
        <TopNav items={navigationItems} ariaLabel="Hlavni navigace" />
        {modeNavigationItems && modeNavigationItems.length > 0 ? (
          <TopNav items={modeNavigationItems} ariaLabel="Studijni rezimy" className="mode-nav" />
        ) : null}
        <div className={sidebar ? 'app-layout-grid' : 'content-frame stack gap-lg'}>
          {sidebar ? (
            <Sidebar title={sidebarTitle} footer={sidebarFooter}>
              {sidebar}
            </Sidebar>
          ) : null}
          <main className="stack gap-lg content-frame">{children}</main>
        </div>
        <BottomNav items={navigationItems} />
      </div>
    </div>
  );
}
