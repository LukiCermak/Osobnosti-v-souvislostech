import type { ContentIndex } from '@/core/content/contentIndex';
import { classifyAnswerError } from '@/core/learning/errorClassifier';
import {
  masteryDeltaForAccuracy,
  MIN_MASTERY_SCORE,
  MAX_MASTERY_SCORE,
  stabilityDeltaForAccuracy
} from '@/core/learning/learningPolicy';
import { scheduleNextReview } from '@/core/learning/repetitionScheduler';
import type { ConfusionRecord, KnowledgeProblemType, KnowledgeState } from '@/types/progress';
import type { StudyAnswer, StudyTask } from '@/types/study';

export interface MasteryEvaluationResult {
  nextKnowledgeState: KnowledgeState;
  detectedProblemType: KnowledgeProblemType;
  nextReviewAt: string;
  shouldCreateConfusionRecord: boolean;
  confusionPair?: Pick<ConfusionRecord, 'sourceEntityId' | 'confusedWithEntityId'>;
}

export function evaluateStudyAnswer(
  index: ContentIndex,
  task: StudyTask,
  answer: StudyAnswer,
  currentState?: KnowledgeState
): MasteryEvaluationResult {
  const classification = classifyAnswerError(index, task, answer);
  const baseState = currentState ?? createInitialKnowledgeState(task);
  const masteryScore = clamp(baseState.masteryScore + masteryDeltaForAccuracy(answer.accuracy), MIN_MASTERY_SCORE, MAX_MASTERY_SCORE);
  const stabilityScore = clamp(baseState.stabilityScore + stabilityDeltaForAccuracy(answer.accuracy), MIN_MASTERY_SCORE, MAX_MASTERY_SCORE);
  const nextReview = scheduleNextReview(
    {
      masteryScore,
      stabilityScore,
      successCount: baseState.successCount,
      errorCount: baseState.errorCount,
      dueAt: baseState.dueAt
    },
    answer
  );

  const nextKnowledgeState: KnowledgeState = {
    ...baseState,
    masteryScore,
    stabilityScore,
    successCount: baseState.successCount + (answer.accuracy === 'correct' || answer.accuracy === 'correct-after-hint' ? 1 : 0),
    errorCount: baseState.errorCount + (answer.accuracy === 'incorrect' || answer.accuracy === 'skipped' ? 1 : 0),
    averageResponseTimeMs: blendAverage(baseState.averageResponseTimeMs, answer.responseTimeMs, totalAttempts(baseState) + 1),
    confidenceAverage: blendAverage(baseState.confidenceAverage, answer.confidence, totalAttempts(baseState) + 1),
    activeProblemType: classification.problemType,
    lastMode: task.mode,
    lastAttemptAt: answer.submittedAt,
    dueAt: nextReview.dueAt
  };

  const confusionPair = inferConfusionPair(task, answer);

  return {
    nextKnowledgeState,
    detectedProblemType: classification.problemType,
    nextReviewAt: nextReview.dueAt,
    shouldCreateConfusionRecord: answer.accuracy === 'incorrect' && Boolean(confusionPair),
    confusionPair
  };
}

export function createInitialKnowledgeState(task: StudyTask): KnowledgeState {
  return {
    id: task.unit.id,
    unitKind: task.unit.kind,
    relationId: task.unit.relationId,
    contrastSetId: task.unit.contrastSetId,
    pathId: task.unit.pathId,
    entityIds: task.unit.entityIds,
    masteryScore: 0.35,
    stabilityScore: 0.2,
    successCount: 0,
    errorCount: 0,
    studyPriority: task.mode === 'atlas' ? 'important' : 'core'
  };
}

function inferConfusionPair(task: StudyTask, answer: StudyAnswer): Pick<ConfusionRecord, 'sourceEntityId' | 'confusedWithEntityId'> | undefined {
  if (answer.accuracy !== 'incorrect' || !answer.selectedOptionIds || answer.selectedOptionIds.length === 0) {
    return undefined;
  }

  if (task.mode === 'atlas') {
    const selectedOption = task.options.find((option) => answer.selectedOptionIds?.includes(option.id));
    const correctOption = task.options.find((option) => option.isCorrect);

    if (selectedOption?.entityId && correctOption?.entityId) {
      return {
        sourceEntityId: correctOption.entityId,
        confusedWithEntityId: selectedOption.entityId
      };
    }
  }

  if (task.mode === 'lab') {
    const selectedIndex = task.options.findIndex((option) => answer.selectedOptionIds?.includes(option.id));
    const selectedPersonId = selectedIndex >= 0 ? task.unit.entityIds[selectedIndex] : undefined;
    const correctPersonId = task.unit.entityIds[0];

    if (selectedPersonId && correctPersonId && selectedPersonId !== correctPersonId) {
      return {
        sourceEntityId: correctPersonId,
        confusedWithEntityId: selectedPersonId
      };
    }
  }

  return undefined;
}

function totalAttempts(state: Pick<KnowledgeState, 'successCount' | 'errorCount'>): number {
  return state.successCount + state.errorCount;
}

function blendAverage(current: number | undefined, next: number, count: number): number {
  if (current === undefined) {
    return next;
  }

  return (current * (count - 1) + next) / count;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
