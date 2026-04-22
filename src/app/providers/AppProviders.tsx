import { useEffect } from 'react';
import { AppRouterProvider } from './RouterProvider';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider, useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { startQuotaMonitor } from '@/services/storage/quotaMonitor';
import { useUiStore } from '@/state/uiStore';
import { usePwaUpdateNotifier } from '@/services/pwa/updateNotifier';

function AppBootstrap() {
  const { tString } = useI18n();
  const initializeApp = useAppStore((state) => state.initializeApp);
  const setStorageHealth = useAppStore((state) => state.setStorageHealth);
  const setLastVisitedRoute = useUiStore((state) => state.setLastVisitedRoute);

  usePwaUpdateNotifier({
    updateTitle: tString('common.pwa.updateTitle'),
    updateText: tString('common.pwa.updateText'),
    updateAction: tString('common.pwa.updateAction'),
    dismissAction: tString('common.pwa.dismissAction'),
    offlineReadyTitle: tString('common.pwa.offlineReadyTitle'),
    offlineReadyText: tString('common.pwa.offlineReadyText'),
    registrationError: tString('common.pwa.registrationError')
  });

  useEffect(() => {
    void initializeApp();

    const monitor = startQuotaMonitor({
      onChange: (report) => {
        setStorageHealth(report);
      }
    });

    void monitor.refresh();

    return () => {
      monitor.stop();
    };
  }, [initializeApp, setStorageHealth]);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('atlas')) {
      setLastVisitedRoute('atlas');
      return;
    }

    if (pathname.includes('detektivni-spisy')) {
      setLastVisitedRoute('cases');
      return;
    }

    if (pathname.includes('laborator-rozliseni')) {
      setLastVisitedRoute('lab');
      return;
    }

    setLastVisitedRoute('home');
  }, [setLastVisitedRoute]);

  return null;
}

export function AppProviders() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppBootstrap />
        <AppRouterProvider />
      </ThemeProvider>
    </I18nProvider>
  );
}
