import { useEffect, useMemo, useState } from 'react';
import { createModeNavigationItems, createNavigationItems } from '@/app/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ErrorState } from '@/components/shared/ErrorState';
import { NextStepCard } from '@/components/study/NextStepCard';
import { ResumeCard } from '@/components/study/ResumeCard';
import { AnswerFeedback } from '@/components/study/AnswerFeedback';
import { StudySessionHeader } from '@/components/study/StudySessionHeader';
import { createCaseTask } from '@/core/generators/caseGenerator';
import { getEntityLabel } from '@/core/content/contentIndex';
import { sessionRepository } from '@/db/repositories/sessionRepository';
import { confusionRepository } from '@/db/repositories/confusionRepository';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { CaseBoard } from '@/features/cases/CaseBoard';
import { createCasesPageViewModel } from '@/features/cases/cases.presenter';
import {
  createInitialRevealedClues,
  createInitialVisibleQuestionIds,
  evaluateCaseDraft,
  selectCaseRecord,
  selectNextRevealableClue,
  selectRevealedClues,
  selectVisibleQuestions,
  type CaseAnswerDraftMap
} from '@/features/cases/cases.selectors';
import { useI18n } from '@/locale/i18n';
import { useAppStore } from '@/state/appStore';
import { useStudyStore } from '@/state/studyStore';
import { useUiStore } from '@/state/uiStore';
import { selectCurrentTask, selectRemainingTaskCount } from '@/state/selectors/studySelectors';
import type { SessionStateRow } from '@/types/database';
import type { StudyAnswer, CaseTask } from '@/types/study';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';

export function CasesPage() {
  const { tString } = useI18n();
  const appState = useAppStore();
  const studyStore = useStudyStore();
  const setActiveMode = useAppStore((state) => state.setActiveMode);
  const caseUiState = useUiStore((state) => state.caseUiState);
  const updateCaseUiState = useUiStore((state) => state.updateCaseUiState);
  const setLastVisitedRoute = useUiStore((state) => state.setLastVisitedRoute);
  const currentTask = useStudyStore(selectCurrentTask) as CaseTask | undefined;
  const remainingCount = useStudyStore(selectRemainingTaskCount);

  const [knowledgeStates, setKnowledgeStates] = useState<KnowledgeState[]>([]);
  const [confusions, setConfusions] = useState<ConfusionRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [drafts, setDrafts] = useState<CaseAnswerDraftMap>({});
  const [synthesisDraft, setSynthesisDraft] = useState('');
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
    setActiveMode('cases');
    setLastVisitedRoute('cases');
  }, [setActiveMode, setLastVisitedRoute]);

  useEffect(() => {
    void loadSupportData();
  }, [appState.latestSnapshot?.id, studyStore.session?.id]);

  const viewModel = useMemo(
    () => createCasesPageViewModel({
      appState,
      knowledgeStates,
      confusions
    }),
    [appState, knowledgeStates, confusions]
  );

  useEffect(() => {
    if (!selectedCaseId && viewModel?.recommendedCaseId) {
      setSelectedCaseId(viewModel.recommendedCaseId);
    }
  }, [selectedCaseId, viewModel?.recommendedCaseId]);

  const activeCaseSession = studyStore.session?.mode === 'cases' ? studyStore.session : undefined;
  const currentRecord = appState.contentIndex && currentTask?.caseId
    ? selectCaseRecord(appState.contentIndex, currentTask.caseId)
    : undefined;

  const revealedClues = currentRecord ? selectRevealedClues(currentRecord, caseUiState.expandedClueIds) : [];
  const nextClue = currentRecord ? selectNextRevealableClue(currentRecord, caseUiState.expandedClueIds) : undefined;
  const questionViews = currentRecord ? selectVisibleQuestions(currentRecord, caseUiState.expandedClueIds, drafts) : [];
  const evaluation = currentRecord ? evaluateCaseDraft(currentRecord, drafts) : undefined;
  const targetLabels = currentRecord && appState.contentIndex
    ? currentRecord.targetEntityIds.map((entityId) => getEntityLabel(appState.contentIndex!, entityId))
    : [];

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

  async function handleStartCaseSession(caseId?: string) {
    await ensureAppReady();

    const freshAppState = useAppStore.getState();
    const index = freshAppState.contentIndex;
    if (!index) {
      return;
    }

    const targetCaseId = caseId ?? selectedCaseId ?? viewModel?.recommendedCaseId;
    const record = targetCaseId ? index.cases.get(targetCaseId) : [...index.cases.values()][0];
    if (!record) {
      return;
    }

    const task = createCaseTask(index, record, 1);
    const createdAt = new Date().toISOString();
    const revealedClueIds = createInitialRevealedClues(record);
    const revealedQuestionIds = createInitialVisibleQuestionIds(record, revealedClueIds);
    const sessionRow: SessionStateRow = {
      id: `cases-${record.id}-${createdAt}`,
      mode: 'cases',
      startedAt: createdAt,
      updatedAt: createdAt,
      planId: `cases-plan-${record.id}-${createdAt}`,
      plan: {
        id: `cases-plan-${record.id}-${createdAt}`,
        mode: 'cases',
        createdAt,
        targetDisciplineIds: task.unit.disciplineIds,
        taskIds: [task.id],
        plannedTaskCount: 1,
        reason: freshAppState.userProfile?.isFirstRun ? 'first-run' : 'weakness-focus'
      },
      currentTaskId: task.id,
      currentTask: task,
      remainingTaskIds: [],
      completedTaskIds: [],
      status: 'active',
      context: {
        caseId: record.id,
        revealedClueIds,
        revealedQuestionIds,
        selectedOptionIdsByQuestion: {},
        textAnswersByQuestion: {},
        synthesisDraft: ''
      }
    };

    const persisted = await sessionRepository.save(sessionRow);

    useStudyStore.setState({
      isBusy: false,
      error: undefined,
      session: persisted,
      tasks: [task],
      currentTaskIndex: 0,
      lastAnswer: undefined,
      lastFeedback: undefined
    });

    updateCaseUiState({
      expandedClueIds: revealedClueIds,
      revealedQuestionIds,
      showSynthesis: false
    });
    setSelectedCaseId(record.id);
    setDrafts({});
    setSynthesisDraft('');
    setConfidence(3);
    setTaskStartedAt(Date.now());
    await freshAppState.refreshDerivedState();
  }

  async function handleResumeCaseSession(sessionId?: string) {
    await ensureAppReady();

    const freshAppState = useAppStore.getState();
    const index = freshAppState.contentIndex;
    if (!index) {
      return;
    }

    const persisted = sessionId
      ? await sessionRepository.getById(sessionId)
      : freshAppState.resumeSession?.mode === 'cases'
        ? freshAppState.resumeSession
        : await sessionRepository.getResumeCandidate();

    if (!persisted || persisted.mode !== 'cases') {
      return;
    }

    const existingTask = persisted.currentTask && persisted.currentTask.mode === 'cases'
      ? persisted.currentTask
      : undefined;
    const caseId = existingTask?.caseId ?? persisted.context?.caseId;
    const record = caseId ? index.cases.get(caseId) : undefined;
    if (!record) {
      return;
    }

    const task = existingTask ?? createCaseTask(index, record, 1);
    const revealedClueIds = persisted.context?.revealedClueIds?.length
      ? persisted.context.revealedClueIds
      : createInitialRevealedClues(record);
    const revealedQuestionIds = persisted.context?.revealedQuestionIds?.length
      ? persisted.context.revealedQuestionIds
      : createInitialVisibleQuestionIds(record, revealedClueIds);

    const nextDrafts = createDraftsFromContext(persisted.context?.selectedOptionIdsByQuestion, persisted.context?.textAnswersByQuestion);

    useStudyStore.setState({
      isBusy: false,
      error: undefined,
      session: {
        ...persisted,
        currentTask: task,
        currentTaskId: task.id
      },
      tasks: [task],
      currentTaskIndex: 0,
      lastAnswer: undefined,
      lastFeedback: undefined
    });

    updateCaseUiState({
      expandedClueIds: revealedClueIds,
      revealedQuestionIds,
      showSynthesis: Boolean(persisted.context?.synthesisDraft)
    });
    setSelectedCaseId(record.id);
    setDrafts(nextDrafts);
    setSynthesisDraft(persisted.context?.synthesisDraft ?? '');
    setConfidence(3);
    setTaskStartedAt(Date.now());
  }

  async function persistDraftContext(nextDrafts: CaseAnswerDraftMap, nextSynthesisDraft: string, revealedQuestionIds?: string[]) {
    const session = useStudyStore.getState().session;
    if (!session || session.mode !== 'cases') {
      return;
    }

    const selectedOptionIdsByQuestion = Object.fromEntries(
      Object.entries(nextDrafts)
        .filter(([, value]) => (value.selectedOptionIds?.length ?? 0) > 0)
        .map(([questionId, value]) => [questionId, value.selectedOptionIds ?? []])
    );
    const textAnswersByQuestion = Object.fromEntries(
      Object.entries(nextDrafts)
        .filter(([, value]) => Boolean(value.textAnswer?.trim()))
        .map(([questionId, value]) => [questionId, value.textAnswer?.trim() ?? ''])
    );

    const persisted = await sessionRepository.updateProgress(session.id, {
      context: {
        ...session.context,
        caseId: currentTask?.caseId ?? session.context?.caseId,
        revealedClueIds: caseUiState.expandedClueIds,
        revealedQuestionIds: revealedQuestionIds ?? caseUiState.revealedQuestionIds,
        selectedOptionIdsByQuestion,
        textAnswersByQuestion,
        synthesisDraft: nextSynthesisDraft
      }
    });

    if (persisted) {
      useStudyStore.setState({ session: persisted });
    }
  }

  async function handleRevealNextClue() {
    if (!currentRecord || !nextClue) {
      return;
    }

    const nextClueIds = Array.from(new Set([...caseUiState.expandedClueIds, nextClue.id]));
    const nextQuestionIds = createInitialVisibleQuestionIds(currentRecord, nextClueIds);

    updateCaseUiState({
      expandedClueIds: nextClueIds,
      revealedQuestionIds: nextQuestionIds,
      showSynthesis: caseUiState.showSynthesis
    });
    await persistDraftContext(drafts, synthesisDraft, nextQuestionIds);
  }

  async function handleToggleOption(questionId: string, optionId: string, multiple: boolean) {
    const currentDraft = drafts[questionId];
    const currentSelected = new Set(currentDraft?.selectedOptionIds ?? []);

    if (multiple) {
      if (currentSelected.has(optionId)) {
        currentSelected.delete(optionId);
      } else {
        currentSelected.add(optionId);
      }
    } else {
      currentSelected.clear();
      currentSelected.add(optionId);
    }

    const nextDrafts: CaseAnswerDraftMap = {
      ...drafts,
      [questionId]: {
        ...currentDraft,
        selectedOptionIds: [...currentSelected]
      }
    };

    setDrafts(nextDrafts);
    await persistDraftContext(nextDrafts, synthesisDraft);
  }

  async function handleTextAnswerChange(questionId: string, value: string) {
    const nextDrafts: CaseAnswerDraftMap = {
      ...drafts,
      [questionId]: {
        ...drafts[questionId],
        textAnswer: value
      }
    };

    setDrafts(nextDrafts);
    await persistDraftContext(nextDrafts, synthesisDraft);
  }

  async function handleChangeSynthesis(value: string) {
    setSynthesisDraft(value);
    await persistDraftContext(drafts, value);
  }

  async function handleToggleSynthesis() {
    updateCaseUiState({
      ...caseUiState,
      showSynthesis: !caseUiState.showSynthesis
    });

    await persistDraftContext(drafts, synthesisDraft);
  }

  async function handleSubmitCase() {
    if (!currentTask || !currentRecord || !evaluation) {
      return;
    }

    const accuracy: StudyAnswer['accuracy'] = evaluation.isSolved
      ? (caseUiState.expandedClueIds.length > 1 ? 'correct-after-hint' : 'correct')
      : 'incorrect';

    await useStudyStore.getState().submitAnswer({
      accuracy,
      selectedOptionIds: [],
      freeTextAnswer: synthesisDraft.trim() || undefined,
      usedHintIds: caseUiState.expandedClueIds.slice(1),
      responseTimeMs: Math.max(1000, Date.now() - taskStartedAt),
      confidence
    });

    updateCaseUiState({
      ...caseUiState,
      showSynthesis: true
    });
    await loadSupportData();
  }

  async function handleSkipCase() {
    if (!currentTask) {
      return;
    }

    await useStudyStore.getState().submitAnswer({
      accuracy: 'skipped',
      selectedOptionIds: [],
      freeTextAnswer: synthesisDraft.trim() || undefined,
      usedHintIds: caseUiState.expandedClueIds.slice(1),
      responseTimeMs: Math.max(1000, Date.now() - taskStartedAt),
      confidence
    });

    await loadSupportData();
  }

  async function handlePauseSession() {
    if (!activeCaseSession) {
      return;
    }

    await useStudyStore.getState().pauseSession();
    await persistDraftContext(drafts, synthesisDraft);
  }

  async function handleAbandonSession() {
    if (!activeCaseSession) {
      return;
    }

    await useStudyStore.getState().abandonSession();
    updateCaseUiState({
      expandedClueIds: [],
      revealedQuestionIds: [],
      showSynthesis: false
    });
    setDrafts({});
    setSynthesisDraft('');
  }

  if (appState.bootstrapStatus === 'error') {
    return (
      <AppShell
        title={tString('cases.page.title')}
        subtitle={tString('cases.page.subtitle')}
        eyebrow={tString('cases.page.eyebrow')}
        navigationItems={navigationItems}
        modeNavigationItems={modeNavigationItems}
      >
        <ErrorState
          title={tString('cases.errors.loadTitle')}
          description={tString('cases.errors.loadText')}
          details={appState.lastError}
          actionLabel={tString('cases.actions.reloadContent')}
          onRetry={() => void appState.initializeApp(true)}
        />
      </AppShell>
    );
  }

  if (!viewModel) {
    return null;
  }

  return (
    <AppShell
      title={tString('cases.page.title')}
      subtitle={tString('cases.page.subtitle')}
      eyebrow={tString('cases.page.eyebrow')}
      navigationItems={navigationItems}
      modeNavigationItems={modeNavigationItems}
      sidebarTitle={tString('cases.sidebar.title')}
      sidebar={
        <>
          <Card
            as="section"
            eyebrow={tString('cases.preview.eyebrow')}
            title={selectedCaseId && appState.contentIndex ? selectCaseRecord(appState.contentIndex, selectedCaseId)?.title ?? tString('cases.preview.title') : tString('cases.preview.title')}
            subtitle={selectedCaseId && appState.contentIndex ? selectCaseRecord(appState.contentIndex, selectedCaseId)?.goal : tString('cases.preview.subtitle')}
          >
            <div className="button-row">
              <Button onClick={() => void handleStartCaseSession(selectedCaseId ?? viewModel.recommendedCaseId)}>
                {tString('cases.actions.startSelected')}
              </Button>
            </div>
          </Card>

          <Card as="section" eyebrow={tString('cases.sidebar.title')} title={tString('cases.summary.availableCases', { params: { count: viewModel.caseItems.length } })}>
            <ul className="feature-list">
              <li>{tString('cases.sidebar.caseCount', { params: { count: viewModel.caseItems.length } })}</li>
              <li>{tString('cases.sidebar.reviewCount', { params: { count: viewModel.dueTodayCount } })}</li>
            </ul>
          </Card>
        </>
      }
      actions={
        <div className="button-row">
          <Button variant="secondary" onClick={() => void appState.refreshDerivedState()}>
            {tString('cases.actions.refresh')}
          </Button>
          <Button onClick={() => void handleStartCaseSession(selectedCaseId)}>
            {activeCaseSession && activeCaseSession.status !== 'completed'
              ? tString('cases.actions.startNewCase')
              : tString('cases.actions.startRecommended')}
          </Button>
        </div>
      }
    >
      <NextStepCard
        title={viewModel.recommendedTitle}
        description={viewModel.recommendedDescription}
        actionLabel={activeCaseSession && activeCaseSession.status !== 'completed'
          ? tString('cases.actions.continueCase')
          : tString('cases.actions.startRecommended')}
        onContinue={() => void (
          activeCaseSession && activeCaseSession.status !== 'completed'
            ? handleResumeCaseSession(activeCaseSession.id)
            : handleStartCaseSession(viewModel.recommendedCaseId)
        )}
        detailItems={[
          tString('cases.summary.availableCases', { params: { count: viewModel.caseItems.length } }),
          tString('cases.summary.reviewCount', { params: { count: viewModel.dueTodayCount } }),
          viewModel.recommendedCaseId
            ? tString('cases.summary.recommendedId', { params: { value: viewModel.recommendedCaseId } })
            : tString('cases.summary.recommendedFallback')
        ]}
      />

      {appState.resumeSession?.mode === 'cases' && (!activeCaseSession || activeCaseSession.status === 'completed') ? (
        <ResumeCard
          session={appState.resumeSession}
          onResume={() => void handleResumeCaseSession(appState.resumeSession?.id)}
          onStartNew={() => void handleStartCaseSession(selectedCaseId)}
        />
      ) : null}

      {activeCaseSession && currentRecord && currentTask ? (
        <div className="stack gap-lg">
          <StudySessionHeader
            mode="cases"
            title={tString('cases.study.headerTitle')}
            completedCount={activeCaseSession.completedTaskIds.length}
            totalCount={studyStore.tasks.length}
            remainingCount={remainingCount}
          />

          {studyStore.lastFeedback ? <AnswerFeedback feedback={studyStore.lastFeedback} /> : null}

          {evaluation ? (
            <CaseBoard
              record={currentRecord}
              task={currentTask}
              targetLabels={targetLabels}
              revealedClues={revealedClues}
              nextClue={nextClue}
              questionViews={questionViews}
              drafts={drafts}
              synthesisDraft={synthesisDraft}
              showSynthesis={caseUiState.showSynthesis}
              isCompleted={activeCaseSession.status === 'completed'}
              evaluation={evaluation}
              confidence={confidence}
              onRevealNextClue={() => void handleRevealNextClue()}
              onToggleOption={(questionId, optionId, multiple) => void handleToggleOption(questionId, optionId, multiple)}
              onTextAnswerChange={(questionId, value) => void handleTextAnswerChange(questionId, value)}
              onConfidenceChange={setConfidence}
              onToggleSynthesis={() => void handleToggleSynthesis()}
              onChangeSynthesis={(value) => void handleChangeSynthesis(value)}
              onSubmitCase={() => void handleSubmitCase()}
              onSkipCase={() => void handleSkipCase()}
              onPauseSession={() => void handlePauseSession()}
              onAbandonSession={() => void handleAbandonSession()}
            />
          ) : null}
        </div>
      ) : (
        <section className="cases-main-grid">
          <Card
            as="section"
            eyebrow={tString('cases.list.eyebrow')}
            title={tString('cases.list.title')}
            subtitle={tString('cases.list.subtitle')}
          >
            <div className="case-library-grid">
              {viewModel.caseItems.map((item) => {
                const isSelected = selectedCaseId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={['case-library-card', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ')}
                    onClick={() => setSelectedCaseId(item.id)}
                  >
                    <p className="eyebrow">{item.difficulty}</p>
                    <h3 className="subsection-title">{item.title}</h3>
                    <p className="text-body">{item.goal}</p>
                    <ul className="feature-list">
                      <li>{tString('cases.list.clues', { params: { count: item.clueCount } })}</li>
                      <li>{tString('cases.list.questions', { params: { count: item.questionCount } })}</li>
                      <li>{tString('cases.list.weaknessScore', { params: { count: item.weaknessScore } })}</li>
                    </ul>
                  </button>
                );
              })}
            </div>
          </Card>
        </section>
      )}
    </AppShell>
  );
}

function createDraftsFromContext(
  selectedOptionIdsByQuestion: Record<string, string[]> | undefined,
  textAnswersByQuestion: Record<string, string> | undefined
): CaseAnswerDraftMap {
  const drafts: CaseAnswerDraftMap = {};

  for (const [questionId, selectedOptionIds] of Object.entries(selectedOptionIdsByQuestion ?? {})) {
    drafts[questionId] = {
      ...drafts[questionId],
      selectedOptionIds
    };
  }

  for (const [questionId, textAnswer] of Object.entries(textAnswersByQuestion ?? {})) {
    drafts[questionId] = {
      ...drafts[questionId],
      textAnswer
    };
  }

  return drafts;
}
