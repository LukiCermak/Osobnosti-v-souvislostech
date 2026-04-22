import { createElement, Fragment, useEffect, type PropsWithChildren, type ReactNode } from 'react';
import { useAppStore } from '@/state/appStore';
import { useI18n } from '@/locale/i18n';
import { selectIsAppReady } from '@/state/selectors/appSelectors';
import type { AppRouteId } from '@/types/ui';

export interface ContentReadyGuardProps extends PropsWithChildren {
  routeId?: AppRouteId;
}

const guardNamespaceByRoute: Partial<Record<AppRouteId, 'atlas' | 'cases' | 'lab'>> = {
  atlas: 'atlas',
  cases: 'cases',
  lab: 'lab'
};

export function ContentReadyGuard({ children, routeId }: ContentReadyGuardProps): ReactNode {
  const { tString } = useI18n();
  const bootstrapStatus = useAppStore((state) => state.bootstrapStatus);
  const lastError = useAppStore((state) => state.lastError);
  const databaseRecovered = useAppStore((state) => state.databaseRecovered);
  const initializeApp = useAppStore((state) => state.initializeApp);
  const isReady = useAppStore(selectIsAppReady);

  useEffect(() => {
    if (bootstrapStatus === 'idle') {
      void initializeApp();
    }
  }, [bootstrapStatus, initializeApp]);

  if (isReady) {
    return createElement(Fragment, null, children);
  }

  const namespace = routeId ? guardNamespaceByRoute[routeId] : undefined;
  const title = namespace
    ? tString(`${namespace}.guard.title`, { fallback: tString('common.app.contentNotReady') })
    : tString('common.app.contentNotReady');
  const text = namespace
    ? tString(`${namespace}.guard.text`, { fallback: tString('common.app.loading') })
    : tString('common.app.loading');

  return createElement(
    'section',
    { className: 'panel stack gap-md', 'aria-live': 'polite' },
    createElement(
      'p',
      { className: 'eyebrow' },
      tString(`common.status.${bootstrapStatus}`, { fallback: tString('common.status.loading') })
    ),
    createElement('h2', { className: 'section-title' }, title),
    createElement(
      'p',
      { className: 'text-body' },
      bootstrapStatus === 'error' ? lastError ?? tString('common.app.unexpectedError') : text
    ),
    databaseRecovered
      ? createElement('p', { className: 'text-body' }, tString('common.app.storageRecovered'))
      : null
  );
}
