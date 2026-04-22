import { create } from 'zustand';
import { buildAnswerFeedback } from '@/core/generators/explanationBuilder';
import { evaluateStudyAnswer } from '@/core/learning/masteryEngine';
import { planStudySession } from '@/core/learning/sessionPlanner';
import { confusionRepository } from '@/db/repositories/confusionRepository';
import { knowledgeRepository } from '@/db/repositories/knowledgeRepository';
import { sessionRepository } from '@/db/repositories/sessionRepository';
import { snapshotRepository } from '@/db/repositories/snapshotRepository';
import { useAppStore } from '@/state/appStore';
import type { SessionStateRow } from '@/types/database';
import type { StudyAnswer, StudyMode, StudySessionPlan, StudyTask } from '@/types/study';
import { buildProgressSnapshot } from '@/core/progress/snapshotBuilder';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';


export interface StudyFeedbackState {
  accuracy: StudyAnswer['accuracy'];
  problemType: string;
  nextReviewAt: string;
  explanation: string;
}

export interface StartSessionInput {
  mode?: StudyMode;
  targetDisciplineIds?: string[];
  reason?: StudySessionPlan['reason'];
  desiredTaskCount?: number;
}

export interface StudyStoreState {
  isBusy: boolean;
  session?: SessionStateRow;
  tasks: StudyTask[];
  currentTaskIndex: number;
  lastAnswer?: StudyAnswer;
  lastFeedback?: StudyFeedbackState;
  error?: string;
  startSession: (input?: StartSessionInput) => Promise<void>;
  resumeSession: (sessionId?: string) => Promise<void>;
  submitAnswer: (answer: Omit<StudyAnswer, 'taskId' | 'submittedAt'>) => Promise<void>;
  pauseSession: () => Promise<void>;
  abandonSession: () => Promise<void>;
  clearSessionState: () => void;
}

export const useStudyStore = create<StudyStoreState>((set, get) => ({
  isBusy: false,
  tasks: [],
  currentTaskIndex: 0,

  async startSession(input = {}) {
    set({ isBusy: true, error: undefined });

    try {
      const appState = useAppStore.getState();
      if (!appState.contentIndex) {
        await appState.initializeApp();
      }

      const freshAppState = useAppStore.getState();
      const index = freshAppState.contentIndex;
      if (!index) {
        throw new Error('Obsah aplikace není připravený.');
      }

      const [knowledgeStates, confusions] = await Promise.all([
        knowledgeRepository.listAll(),
        confusionRepository.listTop(50)
      ]);

      const planned = planStudySession({
        index,
        mode: input.mode ?? freshAppState.activeMode,
        targetDisciplineIds: input.targetDisciplineIds ?? freshAppState.userProfile?.preferredDisciplineIds,
        knowledgeStates: toKnowledgeStates(knowledgeStates),
        confusions: toConfusionRecords(confusions),
        reason: input.reason ?? (freshAppState.userProfile?.isFirstRun ? 'first-run' : 'discipline-focus'),
        desiredTaskCount: input.desiredTaskCount
      });

      const sessionRow = await sessionRepository.save({
        id: planned.plan.id,
        mode: planned.plan.mode,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        planId: planned.plan.id,
        plan: planned.plan,
        currentTaskId: planned.tasks[0]?.id,
        currentTask: planned.tasks[0],
        remainingTaskIds: planned.tasks.slice(1).map((task) => task.id),
        completedTaskIds: [],
        status: 'active'
      });

      useAppStore.getState().setActiveMode(planned.plan.mode);
      await useAppStore.getState().refreshDerivedState();

      set({
        isBusy: false,
        session: sessionRow,
        tasks: planned.tasks,
        currentTaskIndex: 0,
        lastAnswer: undefined,
        lastFeedback: undefined
      });
    } catch (error) {
      set({
        isBusy: false,
        error: error instanceof Error ? error.message : 'Nepodařilo se spustit studijní relaci.'
      });
    }
  },

  async resumeSession(sessionId) {
    set({ isBusy: true, error: undefined });

    try {
      const appState = useAppStore.getState();
      if (!appState.contentIndex) {
        await appState.initializeApp();
      }

      const freshAppState = useAppStore.getState();
      const index = freshAppState.contentIndex;
      if (!index) {
        throw new Error('Obsah aplikace není připravený.');
      }

      const persisted = sessionId
        ? await sessionRepository.getById(sessionId)
        : freshAppState.resumeSession ?? (await sessionRepository.getResumeCandidate());

      if (!persisted) {
        set({ isBusy: false, session: undefined, tasks: [], currentTaskIndex: 0 });
        return;
      }

      const [knowledgeStates, confusions] = await Promise.all([
        knowledgeRepository.listAll(),
        confusionRepository.listTop(50)
      ]);

      const regenerated = planStudySession({
        index,
        mode: persisted.mode,
        targetDisciplineIds: persisted.plan?.targetDisciplineIds,
        knowledgeStates: toKnowledgeStates(knowledgeStates),
        confusions: toConfusionRecords(confusions),
        reason: persisted.plan?.reason ?? 'resume',
        desiredTaskCount: persisted.plan?.plannedTaskCount
      }).tasks;

      const taskMap = new Map(regenerated.map((task) => [task.id, task]));
      const orderedIds = [persisted.currentTaskId, ...persisted.remainingTaskIds, ...persisted.completedTaskIds].filter(isDefined);
      const orderedTasks = orderedIds.map((id) => taskMap.get(id)).filter(isDefined);
      const tasks = orderedTasks.length > 0 ? orderedTasks : regenerated;
      const currentTaskId = persisted.currentTaskId ?? tasks[0]?.id;
      const currentTaskIndex = Math.max(0, tasks.findIndex((task) => task.id === currentTaskId));

      set({
        isBusy: false,
        session: {
          ...persisted,
          currentTask: tasks[currentTaskIndex] ?? persisted.currentTask
        },
        tasks,
        currentTaskIndex,
        lastAnswer: undefined,
        lastFeedback: undefined
      });
    } catch (error) {
      set({
        isBusy: false,
        error: error instanceof Error ? error.message : 'Nepodařilo se obnovit rozpracované studium.'
      });
    }
  },

  async submitAnswer(answerInput) {
    const state = get();
    const session = state.session;
    const task = state.tasks[state.currentTaskIndex];
    const index = useAppStore.getState().contentIndex;

    if (!session || !task || !index) {
      set({ error: 'Není aktivní studijní relace.' });
      return;
    }

    set({ isBusy: true, error: undefined });

    try {
      const submittedAt = new Date().toISOString();
      const answer: StudyAnswer = {
        ...answerInput,
        taskId: task.id,
        submittedAt
      };

      const currentState = await knowledgeRepository.getById(task.unit.id);
      const evaluation = evaluateStudyAnswer(index, task, answer, currentState as KnowledgeState | undefined);

      await knowledgeRepository.save({
        ...evaluation.nextKnowledgeState,
        unitKind: evaluation.nextKnowledgeState.unitKind,
        studyPriority: evaluation.nextKnowledgeState.studyPriority,
        relationId: evaluation.nextKnowledgeState.relationId,
        contrastSetId: evaluation.nextKnowledgeState.contrastSetId,
        pathId: evaluation.nextKnowledgeState.pathId,
        lastMode: evaluation.nextKnowledgeState.lastMode,
        activeProblemType: evaluation.nextKnowledgeState.activeProblemType
      });

      if (evaluation.shouldCreateConfusionRecord && evaluation.confusionPair) {
        await confusionRepository.record({
          sourceEntityId: evaluation.confusionPair.sourceEntityId,
          confusedWithEntityId: evaluation.confusionPair.confusedWithEntityId,
          disciplineIds: task.unit.disciplineIds,
          problemType: evaluation.detectedProblemType,
          occurredAt: submittedAt
        });
      }

      const nextTaskIndex = Math.min(state.currentTaskIndex + 1, state.tasks.length);
      const nextTask = state.tasks[nextTaskIndex];
      const completedTaskIds = Array.from(new Set([...session.completedTaskIds, task.id]));
      const remainingTaskIds = state.tasks.slice(nextTaskIndex + 1).map((item) => item.id);
      const status: SessionStateRow['status'] = nextTask ? 'active' : 'completed';

      const persisted = await sessionRepository.updateProgress(session.id, {
        currentTaskId: nextTask?.id,
        currentTask: nextTask,
        remainingTaskIds,
        completedTaskIds,
        status,
        lastAnswerAt: submittedAt
      });

      const [allStates, confusions] = await Promise.all([
        knowledgeRepository.listAll(),
        confusionRepository.listTop(20)
      ]);
      const snapshot = buildProgressSnapshot(index, toKnowledgeStates(allStates), toConfusionRecords(confusions));
      await snapshotRepository.save(snapshot);
      await useAppStore.getState().refreshDerivedState();

      set({
        isBusy: false,
        session: persisted,
        currentTaskIndex: nextTask ? nextTaskIndex : state.tasks.length - 1,
        lastAnswer: answer,
        lastFeedback: {
          accuracy: answer.accuracy,
          problemType: evaluation.detectedProblemType,
          nextReviewAt: evaluation.nextReviewAt,
          explanation: buildAnswerFeedback(index, task, answer.accuracy)
        }
      });
    } catch (error) {
      set({
        isBusy: false,
        error: error instanceof Error ? error.message : 'Nepodařilo se zpracovat odpověď.'
      });
    }
  },

  async pauseSession() {
    const session = get().session;
    if (!session) {
      return;
    }

    await sessionRepository.pause(session.id);
    await useAppStore.getState().refreshDerivedState();
    set((state) => ({
      session: state.session ? { ...state.session, status: 'paused' } : state.session
    }));
  },

  async abandonSession() {
    const session = get().session;
    if (!session) {
      return;
    }

    await sessionRepository.abandon(session.id);
    await useAppStore.getState().refreshDerivedState();
    set({
      session: undefined,
      tasks: [],
      currentTaskIndex: 0,
      lastAnswer: undefined,
      lastFeedback: undefined
    });
  },

  clearSessionState() {
    set({
      session: undefined,
      tasks: [],
      currentTaskIndex: 0,
      lastAnswer: undefined,
      lastFeedback: undefined,
      error: undefined
    });
  }
}));

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function toKnowledgeStates(rows: Awaited<ReturnType<typeof knowledgeRepository.listAll>>): KnowledgeState[] {
  return rows as unknown as KnowledgeState[];
}

function toConfusionRecords(rows: Awaited<ReturnType<typeof confusionRepository.listTop>>): ConfusionRecord[] {
  return rows as unknown as ConfusionRecord[];
}
