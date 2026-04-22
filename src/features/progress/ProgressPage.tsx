import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { WeaknessHeatmap } from '@/components/charts/WeaknessHeatmap';
import { ProgressOverview } from '@/features/progress/ProgressOverview';
import { DisciplineProgress } from '@/features/progress/DisciplineProgress';
import { WeaknessList } from '@/features/progress/WeaknessList';
import { createProgressPageViewModel } from '@/features/progress/progress.presenter';
import { analyzeWeaknesses } from '@/core/progress/weaknessAnalyzer';
import { confusionRepository } from '@/db/repositories/confusionRepository';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import type { NavigationItem } from '@/types/ui';
import type { ConfusionRecord, KnowledgeState, WeaknessFocus } from '@/types/progress';

export function ProgressPage() {
  const { tString } = useI18n();
  const appState = useAppStore();
  const [knowledgeStates, setKnowledgeStates] = useState<KnowledgeState[]>([]);
  const [confusions, setConfusions] = useState<ConfusionRecord[]>([]);
  const [loadError, setLoadError] = useState<string>();

  useEffect(() => {
    void loadProgressSupportData();
  }, [appState.latestSnapshot?.id]);

  async function loadProgressSupportData() {
    try {
      setLoadError(undefined);
      const [stateRows, confusionRows] = await Promise.all([
        knowledgeRepository.listAll(),
        confusionRepository.listTop(40)
      ]);
      setKnowledgeStates(stateRows as unknown as KnowledgeState[]);
      setConfusions(confusionRows as unknown as ConfusionRecord[]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Nepodařilo se načíst přehled pokroku.');
    }
  }

  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: 'home', path: '/', label: tString('common.navigation.home') },
    { id: 'atlas', path: '/atlas', label: tString('common.navigation.atlas'), mode: 'atlas' },
    { id: 'cases', path: '/detektivni-spisy', label: tString('common.navigation.cases'), mode: 'cases' },
    { id: 'lab', path: '/laborator-rozliseni', label: tString('common.navigation.lab'), mode: 'lab' },
    { id: 'progress', path: '/pokrok', label: tString('common.navigation.progress') },
    { id: 'review', path: '/opakovani', label: tString('common.navigation.review') },
    { id: 'settings', path: '/nastaveni', label: tString('common.navigation.settings') }
  ], [tString]);

  const weaknesses: WeaknessFocus[] = useMemo(
    () => analyzeWeaknesses(knowledgeStates, confusions),
    [knowledgeStates, confusions]
  );

  const viewModel = useMemo(
    () => createProgressPageViewModel(appState, appState.contentIndex, weaknesses, navigationItems),
    [appState, weaknesses, navigationItems]
  );

  return (
    <AppShell
      title={tString('progress.page.title')}
      subtitle={tString('progress.page.subtitle')}
      eyebrow={tString('progress.page.eyebrow')}
      navigationItems={viewModel.navigationItems}
      sidebarTitle={tString('progress.sidebar.title')}
      sidebarFooter={<p className="text-body">{tString('progress.sidebar.footer')}</p>}
    >
      {loadError ? (
        <ErrorState
          title={tString('progress.errors.title')}
          description={tString('progress.errors.text')}
          details={loadError}
          actionLabel={tString('common.actions.refresh')}
          onRetry={() => void loadProgressSupportData()}
        />
      ) : null}

      {!viewModel.hasData ? (
        <EmptyState
          eyebrow={tString('progress.empty.eyebrow')}
          title={tString('progress.empty.title')}
          description={tString('progress.empty.text')}
          action={{ label: tString('progress.actions.openAtlas'), to: '/atlas' }}
        />
      ) : (
        <>
          <ProgressOverview
            title={tString('progress.overview.title')}
            subtitle={tString('progress.overview.subtitle')}
            completionRatio={viewModel.metrics.completionRatio}
            totalUnits={viewModel.metrics.totalUnits}
            masteredUnits={viewModel.metrics.masteredUnits}
            unstableUnits={viewModel.metrics.unstableUnits}
            dueToday={viewModel.metrics.dueToday}
            latestSnapshotLabel={viewModel.latestSnapshotLabel}
          />

          <div className="grid grid-2 progress-page-grid">
            <DisciplineProgress title={tString('progress.disciplines.title')} items={viewModel.disciplineSummaries} />
            {viewModel.confusionSummaries.length > 0 ? (
              <WeaknessHeatmap title={tString('progress.confusions.title')} cells={viewModel.confusionSummaries} columns={2} />
            ) : (
              <EmptyState
                title={tString('progress.confusions.emptyTitle')}
                description={tString('progress.confusions.emptyText')}
              />
            )}
          </div>

          <SectionTitle title={tString('progress.weaknesses.title')} subtitle={tString('progress.weaknesses.subtitle')} />
          {viewModel.weaknessSummaries.length > 0 ? (
            <WeaknessList
              title={tString('progress.weaknesses.title')}
              subtitle={tString('progress.weaknesses.subtitle')}
              items={viewModel.weaknessSummaries}
            />
          ) : (
            <EmptyState
              title={tString('progress.weaknesses.emptyTitle')}
              description={tString('progress.weaknesses.emptyText')}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
