import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import type { NavigationItem } from '@/types/ui';

export interface AppShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  navigationItems: NavigationItem[];
  actions?: ReactNode;
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
  sidebarTitle,
  sidebarFooter,
  children
}: AppShellProps) {
  return (
    <div className="app-shell app-shell-layout">
      <div className="shell-width stack gap-lg">
        <Header title={title} subtitle={subtitle} eyebrow={eyebrow} actions={actions} />
        <div className="app-layout-grid">
          <Sidebar items={navigationItems} title={sidebarTitle} footer={sidebarFooter} />
          <main className="stack gap-lg">{children}</main>
        </div>
        <BottomNav items={navigationItems} />
      </div>
    </div>
  );
}
