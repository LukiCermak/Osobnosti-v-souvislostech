import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNavigationItems } from '@/app/navigation';
import { DisciplineBars } from '@/components/charts/DisciplineBars';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { WeaknessHeatmap } from '@/components/charts/WeaknessHeatmap';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { NextStepCard } from '@/components/study/NextStepCard';
import { ResumeCard } from '@/components/study/ResumeCard';
import { createHomePageViewModel, describeHomeCoverage } from '@/features/home/home.presenter';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { useStudyStore } from '@/state/studyStore';
import { useUiStore } from '@/state/uiStore';
import type { StudySessionPlan } from '@/types/study';

export function HomePage() {
  const navigate = useNavigate();
  const { tString } = useI18n();
  const appState = useAppStore();
  const startSession = useStudyStore((state) => state.startSession);
  const resumeSession = useStudyStore((state) => state.resumeSession);
  const setLastVisitedRoute = useUiStore((state) => state.setLastVisitedRoute);

  const navigationItems = useMemo(
    () => createNavigationItems(tString),
    [tString]
  );
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
      navigationItems={navigationItems}
      actions={
        <div className="button-row">
          <Button variant="secondary" to={viewModel.dueTodayCount > 0 ? '/opakovani' : '/pokrok'}>
            {viewModel.dueTodayCount > 0 ? 'Otevřít dnešní opakování' : 'Otevřít přehled pokroku'}
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
          subtitle={coverageText}
        >
          <div className="home-progress-card">
            <ProgressRing value={viewModel.completionRatio} max={1} caption={tString('home.cards.progress.caption')} />
            <ul className="feature-list">
              <li>{`${tString('home.cards.progress.totalUnits')}: ${viewModel.totalUnits}`}</li>
              <li>{`${tString('home.cards.progress.dueToday')}: ${viewModel.dueTodayCount}`}</li>
              <li>{`${tString('home.cards.progress.recommendedMode')}: ${viewModel.recommendedModeLabel}`}</li>
            </ul>
            <div className="button-row">
              <Button variant="secondary" to="/pokrok">Přejít do pokroku</Button>
              {viewModel.dueTodayCount > 0 ? <Button to="/opakovani">Navázat dnešním blokem</Button> : null}
            </div>
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
            action={{ label: 'Dokončit první nastavení', to: '/prvni-nastaveni' }}
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
