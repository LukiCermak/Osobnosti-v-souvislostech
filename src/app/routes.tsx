import { Link, createBrowserRouter } from 'react-router-dom';
import { ContentReadyGuard } from '@/app/guards/contentReadyGuard';
import { useI18n } from '@/locale/i18n';
import { HomePage } from '@/features/home/HomePage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';

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

function PlaceholderModePage({ namespace }: { namespace: 'atlas' | 'cases' | 'lab' }) {
  const { tString } = useI18n();

  return (
    <section className="stack gap-lg">
      <div className="panel stack gap-md">
        <p className="eyebrow">{tString(`${namespace}.intro.eyebrow`)}</p>
        <h2 className="section-title">{tString(`${namespace}.intro.title`)}</h2>
        <p className="text-body text-lead">{tString(`${namespace}.intro.description`)}</p>
      </div>
      <div className="grid grid-2">
        <article className="panel stack gap-sm">
          <h3 className="subsection-title">{tString(`${namespace}.intro.studyIntentTitle`)}</h3>
          <p className="text-body">{tString(`${namespace}.intro.studyIntentText`)}</p>
        </article>
        <article className="panel stack gap-sm">
          <h3 className="subsection-title">{tString(`${namespace}.intro.nextTitle`)}</h3>
          <p className="text-body">{tString(`${namespace}.intro.nextText`)}</p>
        </article>
      </div>
    </section>
  );
}

export const router = createBrowserRouter([
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
        <PlaceholderModePage namespace="atlas" />
      </ContentReadyGuard>
    )
  },
  {
    path: '/detektivni-spisy',
    element: (
      <ContentReadyGuard routeId="cases">
        <PlaceholderModePage namespace="cases" />
      </ContentReadyGuard>
    )
  },
  {
    path: '/laborator-rozliseni',
    element: (
      <ContentReadyGuard routeId="lab">
        <PlaceholderModePage namespace="lab" />
      </ContentReadyGuard>
    )
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
