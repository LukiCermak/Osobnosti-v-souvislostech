import { useEffect, useMemo, useState } from 'react';
import { createModeNavigationItems, createNavigationItems } from '@/app/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import { AnswerFeedback } from '@/components/study/AnswerFeedback';
import { NextStepCard } from '@/components/study/NextStepCard';
import { ResumeCard } from '@/components/study/ResumeCard';
import { StudySessionHeader } from '@/components/study/StudySessionHeader';
import { createLabTask, generateLabTasks } from '@/core/generators/labTaskGenerator';
import { confusionRepository } from '@/db/repositories/confusionRepository';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { sessionRepository } from '@/db/repositories/sessionRepository';
import { ContrastDrill } from '@/features/lab/ContrastDrill';
import { createLabPageViewModel } from '@/features/lab/lab.presenter';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { useStudyStore } from '@/state/studyStore';
import { useUiStore } from '@/state/uiStore';
import { selectCurrentTask, selectRemainingTaskCount, selectSessionProgressRatio } from '@/state/selectors/studySelectors';
import type { SessionStateRow } from '@/types/database';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import type { LabTask, StudyAnswer, StudyTask } from '@/types/study';

export function LabPage() {
  const { tString } = useI18n();
  const appState = useAppStore();
  const studyStore = useStudyStore();
  const setActiveMode = useAppStore((state) => state.setActiveMode);
  const setLastVisitedRoute = useUiStore((state) => state.setLastVisitedRoute);
  const labUiState = useUiStore((state) => state.labUiState);
  const updateLabUiState = useUiStore((state) => state.updateLabUiState);
  const currentTask = useStudyStore(selectCurrentTask) as LabTask | undefined;
  const remainingCount = useStudyStore(selectRemainingTaskCount);
  const progressRatio = useStudyStore(selectSessionProgressRatio);

  const [knowledgeStates, setKnowledgeStates] = useState<KnowledgeState[]>([]);
  const [confusions, setConfusions] = useState<ConfusionRecord[]>([]);
  const [selectedContrastSetId, setSelectedContrastSetId] = useState<string | undefined>();
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [revealedHintIds, setRevealedHintIds] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<StudyAnswer['confidence']>(3);
  const [taskStartedAt, setTaskStartedAt] = useState<number>(() => Date.now());
  const navigationItems = useMemo(
    () => createNavigationItems(tString, { includeSettings: true }),
    [tString]
  );
  const modeNavigationItems = useMemo(
    () => createModeNavigationItems(tString),
    [tString]
  );

  useEffect(() => {
    setActiveMode('lab');
    setLastVisitedRoute('lab');
  }, [setActiveMode, setLastVisitedRoute]);

  useEffect(() => {
    void loadSupportData();
  }, [appState.latestSnapshot?.id, studyStore.session?.id]);

  useEffect(() => {
    setTaskStartedAt(Date.now());
    if (currentTask?.contrastSetId) {
      setSelectedContrastSetId(currentTask.contrastSetId);
    }
  }, [currentTask?.id, currentTask?.contrastSetId]);

  const viewModel = useMemo(
    () => createLabPageViewModel({
      appState,
      knowledgeStates,
      confusions,
      currentTask: currentTask?.mode === 'lab' ? currentTask : undefined
    }),
    [appState, knowledgeStates, confusions, currentTask]
  );

  useEffect(() => {
    if (!selectedContrastSetId && viewModel?.recommendedContrastSetId) {
      setSelectedContrastSetId(viewModel.recommendedContrastSetId);
    }
  }, [selectedContrastSetId, viewModel?.recommendedContrastSetId]);

  async function loadSupportData() {
    const [stateRows, confusionRows] = await Promise.all([
      knowledgeRepository.listAll(),
      confusionRepository.listTop(30)
    ]);

    setKnowledgeStates(stateRows as unknown as KnowledgeState[]);
    setConfusions(confusionRows as unknown as ConfusionRecord[]);
  }

  async function ensureAppReady() {
    if (!useAppStore.getState().contentIndex) {
      await useAppStore.getState().initializeApp();
    }

    if (!useAppStore.getState().contentIndex) {
      throw new Error('Obsah aplikace není připravený.');
    }
  }

  async function handleStartLabSession(contrastSetId?: string) {
    await ensureAppReady();

    const freshAppState = useAppStore.getState();
    const index = freshAppState.contentIndex;
    if (!index) {
      return;
    }

    const desiredTaskCount = resolveTaskCount(labUiState.preferredTempo);
    const generatedTasks = generateLabTasks({
      index,
      confusions,
      knowledgeStates,
      limit: desiredTaskCount
    });

    const selectedRecord = contrastSetId ? index.contrastSets.get(contrastSetId) : undefined;
    const selectedTask = selectedRecord ? createLabTask(index, selectedRecord, 1) : undefined;

    const orderedTasks = [
      ...(selectedTask ? [selectedTask] : []),
      ...generatedTasks.filter((task) => task.contrastSetId !== selectedTask?.contrastSetId)
    ]
      .slice(0, desiredTaskCount)
      .map((task, taskIndex) => ({
        ...task,
        id: `lab-task:${taskIndex + 1}:${task.contrastSetId}`
      }));

    if (orderedTasks.length === 0) {
      return;
    }

    const createdAt = new Date().toISOString();
    const sessionRow: SessionStateRow = {
      id: `lab-${createdAt}`,
      mode: 'lab',
      startedAt: createdAt,
      updatedAt: createdAt,
      planId: `lab-plan-${createdAt}`,
      plan: {
        id: `lab-plan-${createdAt}`,
        mode: 'lab',
        createdAt,
        targetDisciplineIds: Array.from(new Set(orderedTasks.flatMap((task) => task.unit.disciplineIds))),
        taskIds: orderedTasks.map((task) => task.id),
        plannedTaskCount: orderedTasks.length,
        reason: confusions.length > 0 ? 'weakness-focus' : freshAppState.userProfile?.isFirstRun ? 'first-run' : 'daily-review'
      },
      currentTaskId: orderedTasks[0].id,
      currentTask: orderedTasks[0],
      remainingTaskIds: orderedTasks.slice(1).map((task) => task.id),
      completedTaskIds: [],
      status: 'active',
      context: {
        contrastSetId: orderedTasks[0].contrastSetId,
        labContrastSetIds: orderedTasks.map((task) => task.contrastSetId),
        revealedHintIds: [],
        selectedOptionId: undefined
      }
    };

    const persisted = await sessionRepository.save(sessionRow);

    useStudyStore.setState({
      isBusy: false,
      error: undefined,
      session: persisted,
      tasks: orderedTasks,
      currentTaskIndex: 0,
      lastAnswer: undefined,
      lastFeedback: undefined
    });

    setSelectedContrastSetId(orderedTasks[0].contrastSetId);
    setSelectedOptionId(undefined);
    setRevealedHintIds([]);
    setConfidence(3);
    setTaskStartedAt(Date.now());
    await freshAppState.refreshDerivedState();
  }

  async function handleResumeLabSession(sessionId?: string) {
    await ensureAppReady();

    const freshAppState = useAppStore.getState();
    const index = freshAppState.contentIndex;
    if (!index) {
      return;
    }

    const persisted = sessionId
      ? await sessionRepository.getById(sessionId)
      : freshAppState.resumeSession?.mode === 'lab'
        ? freshAppState.resumeSession
        : await sessionRepository.getResumeCandidate();

    if (!persisted || persisted.mode !== 'lab') {
      return;
    }

    const contrastSetIds = persisted.context?.labContrastSetIds?.length
      ? persisted.context.labContrastSetIds
      : persisted.context?.contrastSetId
        ? [persisted.context.contrastSetId]
        : [];

    const tasks = buildLabTasksFromContext(index, contrastSetIds, persisted.currentTask);
    if (tasks.length === 0) {
      return;
    }

    const currentTaskId = persisted.currentTaskId ?? tasks[0].id;
    const currentTaskIndex = Math.max(0, tasks.findIndex((task) => task.id === currentTaskId || task.contrastSetId === persisted.context?.contrastSetId));
    const sessionTasks = tasks.map((task, taskIndex) => ({ ...task, id: `lab-task:${taskIndex + 1}:${task.contrastSetId}` }));
    const activeTask = sessionTasks[currentTaskIndex] ?? sessionTasks[0];

    useStudyStore.setState({
      isBusy: false,
      error: undefined,
      session: {
        ...persisted,
        currentTaskId: activeTask.id,
        currentTask: activeTask,
        remainingTaskIds: sessionTasks.slice(currentTaskIndex + 1).map((task) => task.id)
      },
      tasks: sessionTasks,
      currentTaskIndex,
      lastAnswer: undefined,
      lastFeedback: undefined
    });

    setSelectedContrastSetId(activeTask.contrastSetId);
    setSelectedOptionId(persisted.context?.selectedOptionId);
    setRevealedHintIds(persisted.context?.revealedHintIds ?? []);
    setConfidence(3);
    setTaskStartedAt(Date.now());
  }

  async function persistLabContext(nextPatch: {
    selectedOptionId?: string;
    revealedHintIds?: string[];
    contrastSetId?: string;
  }) {
    const session = useStudyStore.getState().session;
    if (!session || session.mode !== 'lab') {
      return;
    }

    await sessionRepository.updateProgress(session.id, {
      context: {
        ...session.context,
        contrastSetId: nextPatch.contrastSetId ?? session.context?.contrastSetId,
        labContrastSetIds: session.context?.labContrastSetIds,
        revealedHintIds: nextPatch.revealedHintIds ?? session.context?.revealedHintIds ?? [],
        selectedOptionId: nextPatch.selectedOptionId ?? session.context?.selectedOptionId
      }
    });
  }

  async function handleRevealHint() {
    if (!currentTask) {
      return;
    }

    const nextHint = currentTask.hints.find((hint) => !revealedHintIds.includes(hint.id));
    if (!nextHint) {
      return;
    }

    const nextHintIds = [...revealedHintIds, nextHint.id];
    setRevealedHintIds(nextHintIds);
    await persistLabContext({
      revealedHintIds: nextHintIds,
      contrastSetId: currentTask.contrastSetId,
      selectedOptionId
    });
  }

  async function handleSelectOption(optionId: string) {
    setSelectedOptionId(optionId);
    await persistLabContext({
      selectedOptionId: optionId,
      contrastSetId: currentTask?.contrastSetId,
      revealedHintIds
    });
  }

  async function handleSubmit() {
    if (!currentTask || !selectedOptionId) {
      return;
    }

    const selected = currentTask.options.find((option) => option.id === selectedOptionId);
    const accuracy: StudyAnswer['accuracy'] = selected?.isCorrect
      ? (revealedHintIds.length > 0 ? 'correct-after-hint' : 'correct')
      : 'incorrect';

    await studyStore.submitAnswer({
      accuracy,
      selectedOptionIds: [selectedOptionId],
      usedHintIds: revealedHintIds,
      responseTimeMs: Math.max(800, Date.now() - taskStartedAt),
      confidence
    });

    setSelectedOptionId(undefined);
    setRevealedHintIds([]);
    setConfidence(3);
    await loadSupportData();
    await appState.refreshDerivedState();
  }

  async function handleSkip() {
    if (!currentTask) {
      return;
    }

    await studyStore.submitAnswer({
      accuracy: 'skipped',
      selectedOptionIds: [],
      usedHintIds: revealedHintIds,
      responseTimeMs: Math.max(800, Date.now() - taskStartedAt),
      confidence
    });

    setSelectedOptionId(undefined);
    setRevealedHintIds([]);
    setConfidence(3);
    await loadSupportData();
    await appState.refreshDerivedState();
  }

  if (appState.bootstrapStatus === 'error') {
    return (
      <AppShell
        title={tString('lab.page.title')}
        subtitle={tString('lab.page.subtitle')}
        eyebrow={tString('lab.page.eyebrow')}
        navigationItems={navigationItems}
        modeNavigationItems={modeNavigationItems}
      >
        <ErrorState
          title={tString('lab.errors.loadTitle')}
          description={tString('lab.errors.loadText')}
          details={appState.lastError}
          actionLabel={tString('lab.actions.reloadContent')}
          onRetry={() => void appState.initializeApp(true)}
        />
      </AppShell>
    );
  }

  if (!viewModel) {
    return null;
  }

  const activeLabSession = studyStore.session?.mode === 'lab' ? studyStore.session : undefined;
  const hasTaskInProgress = Boolean(activeLabSession && activeLabSession.status !== 'completed' && currentTask?.mode === 'lab');
  const selectedSummary = viewModel.contrastSets.find((item) => item.id === selectedContrastSetId) ?? viewModel.contrastSets[0];

  return (
    <AppShell
      title={tString('lab.page.title')}
      subtitle={tString('lab.page.subtitle')}
      eyebrow={tString('lab.page.eyebrow')}
      navigationItems={navigationItems}
      modeNavigationItems={modeNavigationItems}
      sidebar={
        <>
          <Card as="section" eyebrow={tString('lab.settings.eyebrow')} title={tString('lab.settings.tempoTitle')} subtitle={tString('lab.settings.tempoText')}>
            <div className="lab-tempo-row">
              {(['slow', 'standard', 'fast'] as const).map((tempo) => (
                <button
                  key={tempo}
                  type="button"
                  className={['lab-tempo-button', labUiState.preferredTempo === tempo ? 'is-selected' : ''].filter(Boolean).join(' ')}
                  onClick={() => updateLabUiState({ preferredTempo: tempo })}
                >
                  {mapTempoLabel(tempo)}
                </button>
              ))}
            </div>
          </Card>

          <Card as="section" eyebrow={tString('lab.history.eyebrow')} title={tString('lab.history.title')} subtitle={tString('lab.history.subtitle')}>
            {viewModel.topConfusions.length > 0 ? (
              <ul className="feature-list">
                {viewModel.topConfusions.map((item) => (
                  <li key={item.id}>{`${item.sourceLabel} x ${item.confusedWithLabel} - ${item.count}x - ${item.problemType}`}</li>
                ))}
              </ul>
            ) : (
              <p className="text-body">{tString('lab.history.empty')}</p>
            )}
          </Card>
        </>
      }
      sidebarTitle={tString('lab.sidebar.title')}
      sidebarFooter={
        <div className="stack gap-sm text-body">
          <p>{tString('lab.sidebar.dueToday', { params: { count: viewModel.dueTodayCount } })}</p>
          <p>{tString('lab.sidebar.tempo', { params: { value: mapTempoLabel(labUiState.preferredTempo) } })}</p>
        </div>
      }
      actions={
        <div className="button-row">
          <Button variant="secondary" onClick={() => updateLabUiState({ showDifferenceHints: !labUiState.showDifferenceHints })}>
            {labUiState.showDifferenceHints ? tString('lab.actions.hideHints') : tString('lab.actions.showHints')}
          </Button>
          <Button onClick={() => void handleStartLabSession(selectedContrastSetId)}>
            {hasTaskInProgress ? tString('lab.actions.startNewBlock') : tString('lab.actions.startBlock')}
          </Button>
        </div>
      }
    >
      <NextStepCard
        title={viewModel.recommendedTitle}
        description={viewModel.recommendedDescription}
        actionLabel={hasTaskInProgress ? tString('lab.actions.continueBlock') : tString('lab.actions.startBlock')}
        onContinue={() => void (hasTaskInProgress ? handleResumeLabSession() : handleStartLabSession(selectedContrastSetId))}
        detailItems={selectedSummary ? [
          tString('lab.summary.confusions', { params: { count: selectedSummary.matchedConfusionCount } }),
          tString('lab.summary.dueKnowledge', { params: { count: selectedSummary.dueKnowledgeCount } }),
          tString('lab.summary.taskType', { params: { value: selectedSummary.microtaskLabel } })
        ] : []}
      />

      {appState.resumeSession?.mode === 'lab' && !hasTaskInProgress ? (
        <ResumeCard
          session={appState.resumeSession}
          onResume={() => void handleResumeLabSession(appState.resumeSession?.id)}
          onStartNew={() => void handleStartLabSession(selectedContrastSetId)}
        />
      ) : null}

      <section className="grid grid-2 lab-config-grid">
        <Card as="section" eyebrow={tString('lab.settings.eyebrow')} title={tString('lab.settings.tempoTitle')} subtitle={tString('lab.settings.tempoText')}>
          <div className="lab-tempo-row">
            {(['slow', 'standard', 'fast'] as const).map((tempo) => (
              <button
                key={tempo}
                type="button"
                className={['lab-tempo-button', labUiState.preferredTempo === tempo ? 'is-selected' : ''].filter(Boolean).join(' ')}
                onClick={() => updateLabUiState({ preferredTempo: tempo })}
              >
                {mapTempoLabel(tempo)}
              </button>
            ))}
          </div>
        </Card>

        <Card as="section" eyebrow={tString('lab.history.eyebrow')} title={tString('lab.history.title')} subtitle={tString('lab.history.subtitle')}>
          {viewModel.topConfusions.length > 0 ? (
            <ul className="feature-list">
              {viewModel.topConfusions.map((item) => (
                <li key={item.id}>{`${item.sourceLabel} × ${item.confusedWithLabel} · ${item.count}× · ${item.problemType}`}</li>
              ))}
            </ul>
          ) : (
            <p className="text-body">{tString('lab.history.empty')}</p>
          )}
        </Card>
      </section>

      {hasTaskInProgress && activeLabSession && currentTask ? (
        <div className="stack gap-lg">
          <StudySessionHeader
            mode="lab"
            title={tString('lab.study.headerTitle')}
            completedCount={activeLabSession.completedTaskIds.length}
            totalCount={studyStore.tasks.length}
            remainingCount={remainingCount}
          />

          {studyStore.lastFeedback ? <AnswerFeedback feedback={studyStore.lastFeedback} /> : null}

          <ContrastDrill
            task={currentTask}
            selectedOptionId={selectedOptionId}
            confidence={confidence}
            revealedHintIds={revealedHintIds}
            showDifferenceHints={labUiState.showDifferenceHints}
            onSelect={(optionId) => void handleSelectOption(optionId)}
            onConfidenceChange={setConfidence}
            onRevealHint={() => void handleRevealHint()}
            onSubmit={() => void handleSubmit()}
            onSkip={() => void handleSkip()}
          />

          <div className="grid grid-2">
            <Card as="section" eyebrow={tString('lab.study.focusEyebrow')} title={selectedSummary?.title ?? tString('lab.study.focusTitle')} subtitle={selectedSummary?.confusionReason ?? tString('lab.study.focusFallback')}>
              {selectedSummary ? (
                <>
                  <ul className="feature-list">
                    <li>{tString('lab.study.peopleLabel', { params: { value: selectedSummary.personLabels.join(', ') } })}</li>
                    <li>{tString('lab.study.relatedLabel', { params: { value: selectedSummary.relatedLabels.join(', ') || tString('lab.study.noRelated') } })}</li>
                  </ul>
                  <p className="text-body">{selectedSummary.distinguishingFeature}</p>
                </>
              ) : null}
            </Card>

            <Card as="section" eyebrow={tString('lab.study.progressEyebrow')} title={tString('lab.study.progressTitle')} subtitle={tString('lab.study.progressText')}>
              <div className="atlas-focus-meta">
                <ProgressBadge label={tString('lab.study.completed')} value={activeLabSession.completedTaskIds.length} tone="mastered" />
                <ProgressBadge label={tString('lab.study.remaining')} value={remainingCount} tone="needs-review" />
                <ProgressBadge label={tString('lab.study.coverage')} value={`${Math.round(progressRatio * 100)} %`} tone="growing" />
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {!hasTaskInProgress ? (
        viewModel.contrastSets.length > 0 ? (
          <section className="stack gap-md">
            <h2 className="section-title">{tString('lab.queue.title')}</h2>
            <div className="lab-set-grid">
              {viewModel.contrastSets.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={['lab-set-card', selectedContrastSetId === item.id ? 'is-selected' : ''].filter(Boolean).join(' ')}
                  onClick={() => setSelectedContrastSetId(item.id)}
                >
                  <div className="stack gap-sm">
                    <div className="atlas-focus-meta">
                      <ProgressBadge label={tString('lab.summary.confusionsShort')} value={item.matchedConfusionCount} tone="at-risk" />
                      <ProgressBadge label={tString('lab.summary.dueKnowledgeShort')} value={item.dueKnowledgeCount} tone="needs-review" />
                    </div>
                    <h3 className="subsection-title">{item.title}</h3>
                    <p className="text-body">{item.confusionReason}</p>
                    <p className="text-body text-muted">{item.distinguishingFeature}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            eyebrow={tString('lab.empty.eyebrow')}
            title={tString('lab.empty.title')}
            description={viewModel.hasHistory ? tString('lab.empty.noContrasts') : tString('lab.empty.noHistory')}
            action={{
              label: tString('lab.empty.action'),
              onAction: () => void handleStartLabSession()
            }}
          />
        )
      ) : null}
    </AppShell>
  );
}

function resolveTaskCount(tempo: 'slow' | 'standard' | 'fast'): number {
  switch (tempo) {
    case 'slow':
      return 4;
    case 'standard':
      return 6;
    case 'fast':
      return 8;
  }
}

function mapTempoLabel(tempo: 'slow' | 'standard' | 'fast'): string {
  switch (tempo) {
    case 'slow':
      return 'Pomalé bloky';
    case 'standard':
      return 'Standardní tempo';
    case 'fast':
      return 'Rychlé bloky';
  }
}

function buildLabTasksFromContext(index: NonNullable<ReturnType<typeof useAppStore.getState>['contentIndex']>, contrastSetIds: string[], currentTask?: StudyTask): LabTask[] {
  const tasks: LabTask[] = [];

  for (const [taskIndex, contrastSetId] of contrastSetIds.entries()) {
    if (currentTask?.mode === 'lab' && currentTask.contrastSetId === contrastSetId) {
      tasks.push({ ...currentTask, id: `lab-task:${taskIndex + 1}:${contrastSetId}` });
      continue;
    }

    const record = index.contrastSets.get(contrastSetId);
    if (record) {
      tasks.push(createLabTask(index, record, taskIndex + 1));
    }
  }

  return tasks;
}
