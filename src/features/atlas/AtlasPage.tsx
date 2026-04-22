import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createModeNavigationItems, createNavigationItems } from '@/app/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { AnswerFeedback } from '@/components/study/AnswerFeedback';
import { NextStepCard } from '@/components/study/NextStepCard';
import { ResumeCard } from '@/components/study/ResumeCard';
import { StudySessionHeader } from '@/components/study/StudySessionHeader';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { confusionRepository } from '@/db/repositories/confusionRepository';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { sessionRepository } from '@/db/repositories/sessionRepository';
import { AtlasFilters } from '@/features/atlas/AtlasFilters';
import { AtlasMap } from '@/features/atlas/AtlasMap';
import { AtlasPathPanel } from '@/features/atlas/AtlasPathPanel';
import { createAtlasPageViewModel } from '@/features/atlas/atlas.presenter';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { useStudyStore } from '@/state/studyStore';
import { useUiStore } from '@/state/uiStore';
import { selectCurrentTask, selectRemainingTaskCount, selectSessionProgressRatio } from '@/state/selectors/studySelectors';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import type { AtlasTask, StudyAnswer } from '@/types/study';
import { formatRelativeDate } from '@/utils/dates';
import { joinLabels } from '@/utils/text';

export function AtlasPage() {
  const navigate = useNavigate();
  const { tString } = useI18n();
  const appState = useAppStore();
  const setActiveMode = useAppStore((state) => state.setActiveMode);
  const atlasFilters = useUiStore((state) => state.atlasFilters);
  const updateAtlasFilters = useUiStore((state) => state.updateAtlasFilters);
  const resetAtlasFilters = useUiStore((state) => state.resetAtlasFilters);
  const setLastVisitedRoute = useUiStore((state) => state.setLastVisitedRoute);
  const studyStore = useStudyStore();
  const currentTask = useStudyStore(selectCurrentTask) as AtlasTask | undefined;
  const remainingCount = useStudyStore(selectRemainingTaskCount);
  const sessionProgressRatio = useStudyStore(selectSessionProgressRatio);

  const [knowledgeStates, setKnowledgeStates] = useState<KnowledgeState[]>([]);
  const [confusions, setConfusions] = useState<ConfusionRecord[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | undefined>();
  const [focusEntityId, setFocusEntityId] = useState<string | undefined>();
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
    setActiveMode('atlas');
    setLastVisitedRoute('atlas');
  }, [setActiveMode, setLastVisitedRoute]);

  useEffect(() => {
    void loadAtlasSupportData();
  }, [appState.latestSnapshot?.id, studyStore.session?.id]);

  useEffect(() => {
    setSelectedOptionId(undefined);
    setRevealedHintIds([]);
    setTaskStartedAt(Date.now());
  }, [currentTask?.id]);

  async function loadAtlasSupportData() {
    const [stateRows, confusionRows] = await Promise.all([knowledgeRepository.listAll(), confusionRepository.listTop(30)]);
    setKnowledgeStates(stateRows as unknown as KnowledgeState[]);
    setConfusions(confusionRows as unknown as ConfusionRecord[]);
  }

  const viewModel = useMemo(
    () => createAtlasPageViewModel({
      appState,
      filters: atlasFilters,
      knowledgeStates,
      confusions,
      focusEntityId,
      task: currentTask?.mode === 'atlas' ? currentTask : undefined
    }),
    [appState, atlasFilters, knowledgeStates, confusions, focusEntityId, currentTask]
  );

  useEffect(() => {
    if (!focusEntityId && viewModel?.summary.focusedNode?.id) {
      setFocusEntityId(viewModel.summary.focusedNode.id);
    }
  }, [focusEntityId, viewModel?.summary.focusedNode?.id]);

  if (appState.bootstrapStatus === 'error') {
    return (
      <AppShell
        title={tString('atlas.page.title')}
        subtitle={tString('atlas.page.subtitle')}
        eyebrow={tString('atlas.page.eyebrow')}
        navigationItems={navigationItems}
        modeNavigationItems={modeNavigationItems}
      >
        <ErrorState
          title={tString('atlas.errors.loadTitle')}
          description={tString('atlas.errors.loadText')}
          details={appState.lastError}
          actionLabel={tString('atlas.actions.reloadContent')}
          onRetry={() => void appState.initializeApp(true)}
        />
      </AppShell>
    );
  }

  if (!viewModel) {
    return null;
  }

  const activeAtlasSession = studyStore.session?.mode === 'atlas' ? studyStore.session : undefined;
  const hasTaskInProgress = Boolean(activeAtlasSession && activeAtlasSession.status !== 'completed' && currentTask?.mode === 'atlas');
  const completedSession = Boolean(activeAtlasSession && activeAtlasSession.status === 'completed');
  const recommendedPath = selectedPathId ? viewModel.paths.find((path) => path.id === selectedPathId) : undefined;

  const handleStartAtlasSession = async (pathId?: string) => {
    const path = pathId ? viewModel.paths.find((item) => item.id === pathId) : undefined;
    const targetDisciplineIds = path?.disciplineIds.length ? path.disciplineIds : atlasFilters.disciplineIds.length > 0 ? atlasFilters.disciplineIds : appState.userProfile?.preferredDisciplineIds;

    await studyStore.startSession({
      mode: 'atlas',
      targetDisciplineIds,
      reason: appState.resumeSession?.mode === 'atlas' ? 'resume' : appState.userProfile?.isFirstRun ? 'first-run' : 'discipline-focus',
      desiredTaskCount: 8
    });

    const sessionId = useStudyStore.getState().session?.id;
    if (sessionId) {
      await sessionRepository.updateProgress(sessionId, {
        context: pathId ? { pathId } : undefined
      });
    }

    await appState.refreshDerivedState();
  };

  const handleResumeAtlasSession = async () => {
    await studyStore.resumeSession(appState.resumeSession?.mode === 'atlas' ? appState.resumeSession.id : undefined);
  };

  const handleSubmitAnswer = async () => {
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
      responseTimeMs: Math.max(1000, Date.now() - taskStartedAt),
      confidence
    });

    await loadAtlasSupportData();
  };

  const handleSkip = async () => {
    if (!currentTask) {
      return;
    }

    await studyStore.submitAnswer({
      accuracy: 'skipped',
      selectedOptionIds: [],
      usedHintIds: revealedHintIds,
      responseTimeMs: Math.max(1000, Date.now() - taskStartedAt),
      confidence
    });

    await loadAtlasSupportData();
  };

  const preferredDisciplineText = appState.userProfile?.preferredDisciplineIds?.length
    ? joinLabels(appState.userProfile.preferredDisciplineIds)
    : tString('atlas.page.allDisciplines');

  return (
    <AppShell
      title={tString('atlas.page.title')}
      subtitle={tString('atlas.page.subtitle')}
      eyebrow={tString('atlas.page.eyebrow')}
      navigationItems={navigationItems}
      modeNavigationItems={modeNavigationItems}
      sidebar={
        <AtlasFilters
          filters={atlasFilters}
          disciplineOptions={viewModel.disciplineOptions}
          eraOptions={viewModel.eraOptions}
          relationTypeOptions={viewModel.relationTypeOptions}
          tagOptions={viewModel.tagOptions}
          onToggleDiscipline={(id) => toggleSelection('disciplineIds', id, atlasFilters, updateAtlasFilters)}
          onToggleEra={(id) => toggleSelection('eraIds', id, atlasFilters, updateAtlasFilters)}
          onToggleRelationType={(id) => toggleSelection('relationTypes', id, atlasFilters, updateAtlasFilters)}
          onToggleTag={(id) => toggleSelection('tagIds', id, atlasFilters, updateAtlasFilters)}
          onToggleWeakOnly={() => updateAtlasFilters({ showOnlyWeakAreas: !atlasFilters.showOnlyWeakAreas })}
          onReset={() => resetAtlasFilters()}
        />
      }
      sidebarTitle={tString('atlas.sidebar.title')}
      sidebarFooter={
        <div className="stack gap-sm text-body">
          <p>{tString('atlas.sidebar.filtersActive', { params: { count: viewModel.filtersActiveCount } })}</p>
          <p>{tString('atlas.sidebar.preferredDisciplines', { params: { value: preferredDisciplineText } })}</p>
        </div>
      }
      actions={
        <div className="button-row">
          <Button variant="secondary" onClick={() => void appState.refreshDerivedState()}>
            {tString('atlas.actions.refresh')}
          </Button>
          <Button onClick={() => void handleStartAtlasSession(selectedPathId)}>
            {hasTaskInProgress ? tString('atlas.actions.startNewBlock') : tString('atlas.actions.startBlock')}
          </Button>
        </div>
      }
    >
      <NextStepCard
        title={viewModel.recommendedTitle}
        description={viewModel.recommendedDescription}
        actionLabel={hasTaskInProgress ? tString('atlas.actions.continueBlock') : tString('atlas.actions.startBlock')}
        onContinue={() => void (hasTaskInProgress ? handleResumeAtlasSession() : handleStartAtlasSession(selectedPathId))}
        detailItems={[
          tString('atlas.summary.visibleNodes', { params: { count: viewModel.summary.totalNodeCount } }),
          tString('atlas.summary.visibleRelations', { params: { count: viewModel.summary.totalRelationCount } }),
          tString('atlas.summary.weakNodes', { params: { count: viewModel.summary.weakNodeCount } })
        ]}
      />

      {appState.resumeSession?.mode === 'atlas' && !hasTaskInProgress ? (
        <ResumeCard session={appState.resumeSession} onResume={() => void handleResumeAtlasSession()} onStartNew={() => void handleStartAtlasSession(selectedPathId)} />
      ) : null}

      {hasTaskInProgress && activeAtlasSession ? (
        <div className="stack gap-lg">
          <StudySessionHeader
            mode="atlas"
            title={tString('atlas.study.headerTitle')}
            completedCount={activeAtlasSession.completedTaskIds.length}
            totalCount={studyStore.tasks.length}
            remainingCount={remainingCount}
          />

          {studyStore.lastFeedback ? <AnswerFeedback feedback={studyStore.lastFeedback} /> : null}

          {currentTask ? (
            <Card as="section" eyebrow={tString('atlas.study.taskEyebrow')} title={currentTask.prompt} subtitle={currentTask.expectedOutcome}>
              <div className="atlas-task-layout">
                <div className="stack gap-md">
                  <div className="atlas-focus-meta">
                    <ProgressBadge label={tString('atlas.study.progress')} value={`${Math.round(sessionProgressRatio * 100)} %`} tone="growing" />
                    <ProgressBadge label={tString('atlas.study.taskType')} value={taskTypeLabel(currentTask.taskType)} tone="mastered" />
                  </div>

                  <div className="atlas-option-grid">
                    {currentTask.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={[ 'atlas-option-button', selectedOptionId === option.id ? 'is-selected' : '' ].filter(Boolean).join(' ')}
                        onClick={() => setSelectedOptionId(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <aside className="stack gap-md atlas-task-sidebar">
                  <Card as="section" title={tString('atlas.study.hintsTitle')} subtitle={tString('atlas.study.hintsSubtitle')}>
                    {revealedHintIds.length > 0 ? (
                      <ul className="feature-list">
                        {currentTask.hints
                          .filter((hint) => revealedHintIds.includes(hint.id))
                          .map((hint) => (
                            <li key={hint.id}>{hint.text}</li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-body">{tString('atlas.study.noHintsYet')}</p>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const nextHint = currentTask.hints.find((hint) => !revealedHintIds.includes(hint.id));
                        if (nextHint) {
                          setRevealedHintIds((state) => [...state, nextHint.id]);
                        }
                      }}
                      disabled={revealedHintIds.length >= currentTask.hints.length}
                    >
                      {tString('atlas.actions.showHint')}
                    </Button>
                  </Card>

                  <Card as="section" title={tString('atlas.study.confidenceTitle')} subtitle={tString('atlas.study.confidenceSubtitle')}>
                    <div className="atlas-confidence-row">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={[ 'atlas-confidence-button', confidence === value ? 'is-selected' : '' ].filter(Boolean).join(' ')}
                          onClick={() => setConfidence(value as StudyAnswer['confidence'])}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </Card>
                </aside>
              </div>

              <div className="button-row">
                <Button onClick={() => void handleSubmitAnswer()} disabled={!selectedOptionId || studyStore.isBusy}>
                  {tString('atlas.actions.submitAnswer')}
                </Button>
                <Button variant="secondary" onClick={() => void handleSkip()} disabled={studyStore.isBusy}>
                  {tString('atlas.actions.skipTask')}
                </Button>
                <Button variant="ghost" onClick={() => void studyStore.pauseSession()}>
                  {tString('atlas.actions.pauseBlock')}
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      {completedSession ? (
        <Card as="section" highlight eyebrow={tString('atlas.study.completedEyebrow')} title={tString('atlas.study.completedTitle')} subtitle={tString('atlas.study.completedText')}>
          <div className="button-row">
            <Button onClick={() => void handleStartAtlasSession(selectedPathId)}>{tString('atlas.actions.startNextBlock')}</Button>
            <Button variant="secondary" onClick={() => navigate('/')}>{tString('atlas.actions.goHome')}</Button>
          </div>
        </Card>
      ) : null}

      {studyStore.error ? (
        <ErrorState title={tString('atlas.errors.sessionTitle')} description={tString('atlas.errors.sessionText')} details={studyStore.error} />
      ) : null}

      <div className="stack gap-lg atlas-main-grid">
        <AtlasPathPanel
          paths={viewModel.paths}
          selectedPathId={selectedPathId}
          onSelectPath={(pathId) => setSelectedPathId(pathId)}
          onApplyPath={(pathId) => {
            const selectedPath = viewModel.paths.find((path) => path.id === pathId);
            setSelectedPathId(pathId);
            if (selectedPath) {
              updateAtlasFilters({ disciplineIds: selectedPath.disciplineIds });
            }
          }}
        />
      </div>

      <SectionTitle title={tString('atlas.page.mapTitle')} subtitle={tString('atlas.page.mapSubtitle')} />
      <AtlasMap summary={viewModel.summary} onFocusEntity={(entityId) => setFocusEntityId(entityId)} />

      {recommendedPath ? (
        <Card as="section" eyebrow={tString('atlas.page.pathEyebrow')} title={recommendedPath.title} subtitle={recommendedPath.didacticGoal}>
          <ul className="feature-list">
            <li>{tString('atlas.page.pathFocus', { params: { value: recommendedPath.nextUnmasteredStepLabel ?? recommendedPath.stepLabels[0]?.label ?? '—' } })}</li>
            <li>{tString('atlas.page.pathUpdated', { params: { value: formatRelativeDate(new Date().toISOString()) } })}</li>
          </ul>
          <div className="button-row">
            <Button onClick={() => void handleStartAtlasSession(recommendedPath.id)}>{tString('atlas.actions.startPathBlock')}</Button>
            <Button variant="secondary" onClick={() => updateAtlasFilters({ disciplineIds: recommendedPath.disciplineIds })}>
              {tString('atlas.actions.applyPathFilter')}
            </Button>
          </div>
        </Card>
      ) : null}

      {!hasTaskInProgress && !completedSession ? (
        <EmptyState
          title={tString('atlas.empty.studyTitle')}
          description={tString('atlas.empty.studyText')}
          action={{ label: tString('atlas.actions.startBlock'), onAction: () => void handleStartAtlasSession(selectedPathId) }}
        />
      ) : null}
    </AppShell>
  );
}

function toggleSelection<Key extends 'disciplineIds' | 'eraIds' | 'relationTypes' | 'tagIds'>(
  key: Key,
  id: string,
  filters: ReturnType<typeof useUiStore.getState>['atlasFilters'],
  updateAtlasFilters: ReturnType<typeof useUiStore.getState>['updateAtlasFilters']
) {
  const currentValues = filters[key] as string[];
  updateAtlasFilters({
    [key]: currentValues.includes(id) ? currentValues.filter((item) => item !== id) : [...currentValues, id]
  });
}

function taskTypeLabel(taskType: AtlasTask['taskType']): string {
  switch (taskType) {
    case 'match-person-to-institution':
      return 'osobnost a instituce';
    case 'fill-historical-link':
      return 'historická návaznost';
    case 'match-person-to-method':
      return 'osobnost a metoda';
    case 'assign-discipline':
      return 'oborové zařazení';
    case 'identify-missing-node':
      return 'doplnění chybějícího uzlu';
  }
}
