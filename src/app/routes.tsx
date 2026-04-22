import { Link, createBrowserRouter } from 'react-router-dom';
import { ContentReadyGuard } from '@/app/guards/contentReadyGuard';
import { useI18n } from '@/locale/i18n';
import { HomePage } from '@/features/home/HomePage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { AtlasPage } from '@/features/atlas/AtlasPage';
import { CasesPage } from '@/features/cases/CasesPage';
import { LabPage } from '@/features/lab/LabPage';
import { ProgressPage } from '@/features/progress/ProgressPage';
import { ReviewQueuePage } from '@/features/review/ReviewQueuePage';
import { SettingsPage } from '@/features/settings/SettingsPage';

function NotFoundPage() {
  const { tString } = useI18n();

  return (
    <section className="panel stack gap-md">
      <p className="eyebrow">{tString('common.fallback.pageMissingTitle')}</p>
      <h2 className="section-title">{tString('common.fallback.pageMissingTitle')}</h2>
      <p className="text-body">{tString('common.fallback.pageMissingText')}</p>
      <div>
        <Link className="button button-primary" to="/">
          {tString('common.actions.goHome')}
        </Link>
      </div>
    </section>
  );
}

const routerBasename = normalizeRouterBasename(import.meta.env.BASE_URL);

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
      errorElement: <NotFoundPage />
    },
    {
      path: '/prvni-nastaveni',
      element: <OnboardingPage />
    },
    {
      path: '/atlas',
      element: (
        <ContentReadyGuard routeId="atlas">
          <AtlasPage />
        </ContentReadyGuard>
      )
    },
    {
      path: '/detektivni-spisy',
      element: (
        <ContentReadyGuard routeId="cases">
          <CasesPage />
        </ContentReadyGuard>
      )
    },
    {
      path: '/laborator-rozliseni',
      element: (
        <ContentReadyGuard routeId="lab">
          <LabPage />
        </ContentReadyGuard>
      )
    },
    {
      path: '/pokrok',
      element: (
        <ContentReadyGuard>
          <ProgressPage />
        </ContentReadyGuard>
      )
    },
    {
      path: '/opakovani',
      element: (
        <ContentReadyGuard>
          <ReviewQueuePage />
        </ContentReadyGuard>
      )
    },
    {
      path: '/nastaveni',
      element: (
        <ContentReadyGuard>
          <SettingsPage />
        </ContentReadyGuard>
      )
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ],
  {
    basename: routerBasename
  }
);

function normalizeRouterBasename(baseUrl: string): string | undefined {
  if (!baseUrl || baseUrl === '/') {
    return undefined;
  }

  return baseUrl.endsWith('/') && baseUrl.length > 1 ? baseUrl.slice(0, -1) : baseUrl;
}
