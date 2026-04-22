import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DisciplineBars } from '@/components/charts/DisciplineBars';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { WeaknessHeatmap } from '@/components/charts/WeaknessHeatmap';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { NextStepCard } from '@/components/study/NextStepCard';
import { ResumeCard } from '@/components/study/ResumeCard';
import { useAppStore } from '@/state/appStore';
import { useStudyStore } from '@/state/studyStore';
import { useUiStore } from '@/state/uiStore';
import { createHomePageViewModel, describeHomeCoverage } from '@/features/home/home.presenter';
import { useI18n } from '@/locale/i18n';
import type { NavigationItem } from '@/types/ui';
import type { StudySessionPlan } from '@/types/study';

const navigationItems: NavigationItem[] = [
  { id: 'home', path: '/', label: 'Přehled' },
  { id: 'atlas', path: '/atlas', label: 'Atlas souvislostí', mode: 'atlas' },
  { id: 'cases', path: '/detektivni-spisy', label: 'Detektivní spisy', mode: 'cases' },
  { id: 'lab', path: '/laborator-rozliseni', label: 'Laboratoř rozlišení', mode: 'lab' },
  { id: 'onboarding', path: '/prvni-nastaveni', label: 'První nastavení' }
];

export function HomePage() {
  const navigate = useNavigate();
  const { tString } = useI18n();
  const appState = useAppStore();
  const startSession = useStudyStore((state) => state.startSession);
  const resumeSession = useStudyStore((state) => state.resumeSession);
  const setLastVisitedRoute = useUiStore((state) => state.setLastVisitedRoute);

  const viewModel = useMemo(() => createHomePageViewModel(appState), [appState]);
  const coverageText = useMemo(() => describeHomeCoverage(appState.contentIndex), [appState.contentIndex]);

  const handleStartRecommended = async () => {
    setLastVisitedRoute(viewModel.needsOnboarding ? 'onboarding' : viewModel.recommendedMode);

    if (viewModel.needsOnboarding) {
      navigate('/prvni-nastaveni');
      return;
    }

    await startSession({
      mode: viewModel.recommendedMode,
      reason: resolvePlanReason(viewModel.resumeAvailable, viewModel.dueTodayCount, appState.userProfile?.isFirstRun)
    });
    navigate(modeToPath(viewModel.recommendedMode));
  };

  const handleResume = async () => {
    if (!appState.resumeSession) {
      return;
    }

    await resumeSession(appState.resumeSession.id);
    setLastVisitedRoute(routeIdFromMode(appState.resumeSession.mode));
    navigate(modeToPath(appState.resumeSession.mode));
  };

  return (
    <AppShell
      title={tString('common.app.title')}
      subtitle={tString('common.app.subtitle')}
      eyebrow={tString('home.hero.eyebrow')}
      navigationItems={navigationItems}
      sidebarTitle={tString('home.sidebar.title')}
      sidebarFooter={<p className="text-body">{coverageText}</p>}
      actions={
        <div className="button-row">
          <Button variant="secondary" to="/prvni-nastaveni">
            {viewModel.needsOnboarding ? tString('home.actions.completeSetup') : tString('home.actions.adjustSetup')}
          </Button>
          <Button onClick={() => void handleStartRecommended()}>{viewModel.recommendedActionLabel}</Button>
        </div>
      }
    >
      <section className="hero panel panel-highlight stack gap-md">
        <p className="eyebrow">{tString('home.hero.kicker')}</p>
        <h2 className="hero-title">{tString('home.hero.title')}</h2>
        <p className="text-body text-lead">{tString('home.hero.description')}</p>
      </section>

      <div className="grid grid-2 home-summary-grid">
        <NextStepCard
          title={viewModel.recommendedActionTitle}
          description={viewModel.recommendedActionDescription}
          actionLabel={viewModel.recommendedActionLabel}
          onContinue={() => void handleStartRecommended()}
          detailItems={viewModel.highlightItems.map((item) => `${item.label}: ${item.value}`)}
        />

        <Card
          as="section"
          eyebrow={tString('home.cards.progress.eyebrow')}
          title={tString('home.cards.progress.title')}
          subtitle={viewModel.completionLabel}
        >
          <div className="home-progress-card">
            <ProgressRing value={viewModel.completionRatio} max={1} caption={tString('home.cards.progress.caption')} />
            <ul className="feature-list">
              <li>{`${tString('home.cards.progress.totalUnits')}: ${viewModel.totalUnits}`}</li>
              <li>{`${tString('home.cards.progress.dueToday')}: ${viewModel.dueTodayCount}`}</li>
              <li>{`${tString('home.cards.progress.recommendedMode')}: ${viewModel.recommendedModeLabel}`}</li>
            </ul>
          </div>
        </Card>
      </div>

      {appState.resumeSession ? (
        <ResumeCard
          session={appState.resumeSession}
          onResume={() => void handleResume()}
          onStartNew={() => void handleStartRecommended()}
        />
      ) : null}

      <SectionTitle title={tString('home.sections.modeTitle')} subtitle={tString('home.sections.modeSubtitle')} />
      <div className="grid grid-3">
        {viewModel.modeCards.map((card) => (
          <Card key={card.id} as="article" eyebrow={card.title} title={card.title} subtitle={card.description}>
            <Button to={card.to}>{tString('common.actions.openMode')}</Button>
          </Card>
        ))}
      </div>

      <div className="grid grid-2 home-analytics-grid">
        {viewModel.disciplineBars.length > 0 ? (
          <DisciplineBars
            title={tString('home.sections.disciplinesTitle')}
            items={viewModel.disciplineBars.map((item) => ({
              id: item.id,
              label: item.label,
              value: item.totalUnits,
              total: Math.max(item.totalUnits, 1),
              subtitle: item.subtitle
            }))}
          />
        ) : (
          <EmptyState
            title={tString('home.empty.disciplinesTitle')}
            description={tString('home.empty.disciplinesText')}
            action={{ label: tString('home.actions.completeSetup'), to: '/prvni-nastaveni' }}
          />
        )}

        {viewModel.weaknessItems.length > 0 ? (
          <WeaknessHeatmap title={tString('home.sections.weaknessTitle')} cells={viewModel.weaknessItems} columns={2} />
        ) : (
          <EmptyState
            title={tString('home.empty.weaknessTitle')}
            description={tString('home.empty.weaknessText')}
          />
        )}
      </div>
    </AppShell>
  );
}

function modeToPath(mode: 'atlas' | 'cases' | 'lab'): string {
  switch (mode) {
    case 'atlas':
      return '/atlas';
    case 'cases':
      return '/detektivni-spisy';
    case 'lab':
      return '/laborator-rozliseni';
  }
}

function routeIdFromMode(mode: 'atlas' | 'cases' | 'lab') {
  return mode;
}

function resolvePlanReason(
  resumeAvailable: boolean,
  dueTodayCount: number,
  isFirstRun: boolean | undefined
): StudySessionPlan['reason'] {
  if (isFirstRun) {
    return 'first-run';
  }

  if (resumeAvailable) {
    return 'resume';
  }

  return dueTodayCount > 0 ? 'daily-review' : 'discipline-focus';
}
