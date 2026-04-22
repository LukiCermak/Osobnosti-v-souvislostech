import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNavigationItems } from '@/app/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { NextStepCard } from '@/components/study/NextStepCard';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { DueTodayList } from '@/features/review/DueTodayList';
import { createReviewPageViewModel } from '@/features/review/review.presenter';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { useStudyStore } from '@/state/studyStore';
import type { KnowledgeStateRow } from '@/types/database';
import type { StudyMode, StudySessionPlan } from '@/types/study';

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const { tString } = useI18n();
  const appState = useAppStore();
  const startSession = useStudyStore((state) => state.startSession);
  const [dueRows, setDueRows] = useState<KnowledgeStateRow[]>([]);
  const [loadError, setLoadError] = useState<string>();

  useEffect(() => {
    void loadDueRows();
  }, [appState.dailyReviewPlan?.createdAt, appState.latestSnapshot?.id]);

  async function loadDueRows() {
    try {
      setLoadError(undefined);
      const rows = await knowledgeRepository.listDue(new Date().toISOString(), 24);
      setDueRows(rows);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Nepodařilo se načíst dnešní frontu opakování.');
    }
  }

  const navigationItems = useMemo(
    () => createNavigationItems(tString),
    [tString]
  );
  const viewModel = useMemo(
    () => createReviewPageViewModel(appState, appState.contentIndex, dueRows, navigationItems),
    [appState, dueRows, navigationItems]
  );

  const handleStartDailyReview = async (mode: StudyMode) => {
    const reason: StudySessionPlan['reason'] = 'daily-review';
    await startSession({ mode, reason, desiredTaskCount: Math.max(6, Math.min(12, dueRows.length || 6)) });
    navigate(modeToPath(mode));
  };

  return (
    <AppShell
      title={tString('review.page.title')}
      subtitle={tString('review.page.subtitle')}
      navigationItems={viewModel.navigationItems}
    >
      {loadError ? (
        <ErrorState
          title={tString('review.errors.title')}
          description={tString('review.errors.text')}
          details={loadError}
          actionLabel={tString('common.actions.refresh')}
          onRetry={() => void loadDueRows()}
        />
      ) : null}

      <NextStepCard
        title={tString('review.next.title', { params: { mode: viewModel.recommendedModeLabel } })}
        description={tString('review.next.text', { params: { count: String(viewModel.dueCount) } })}
        actionLabel={tString('review.actions.start')}
        onContinue={() => void handleStartDailyReview(viewModel.recommendedMode)}
        detailItems={[
          `${tString('review.summary.dueCount')}: ${viewModel.dueCount}`,
          `${tString('review.summary.recommendedMode')}: ${viewModel.recommendedModeLabel}`
        ]}
      />

      {viewModel.queueItems.length > 0 ? (
        <DueTodayList
          title={tString('review.queue.title')}
          subtitle={tString('review.queue.subtitle')}
          items={viewModel.queueItems}
        />
      ) : (
        <EmptyState
          eyebrow={tString('review.empty.eyebrow')}
          title={tString('review.empty.title')}
          description={tString('review.empty.text')}
          action={{ label: tString('review.actions.openProgress'), to: '/pokrok', variant: 'secondary' }}
        />
      )}
    </AppShell>
  );
}

function modeToPath(mode: StudyMode): string {
  switch (mode) {
    case 'atlas':
      return '/atlas';
    case 'cases':
      return '/detektivni-spisy';
    case 'lab':
      return '/laborator-rozliseni';
  }
}
