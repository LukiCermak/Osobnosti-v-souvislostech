import { getEntityLabel, type ContentIndex } from '@/core/content/contentIndex';
import type { CaseRecord, EntityId } from '@/types/content';
import type { AppStoreState } from '@/state/appStore';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';

export interface CaseAnswerDraft {
  selectedOptionIds?: string[];
  textAnswer?: string;
}

export type CaseAnswerDraftMap = Record<string, CaseAnswerDraft>;

export interface CaseListItem {
  id: string;
  title: string;
  goal: string;
  difficulty: CaseRecord['difficulty'];
  targetLabels: string[];
  clueCount: number;
  questionCount: number;
  disciplineIds: string[];
  weaknessScore: number;
}

export interface CaseQuestionView {
  id: string;
  prompt: string;
  answerMode: CaseRecord['questions'][number]['answerMode'];
  options: CaseRecord['questions'][number]['options'];
  expectedAnswer?: string;
  isAnswered: boolean;
  isCorrect: boolean;
}

export interface CaseEvaluationSummary {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  minimumCorrectQuestions: number;
  requiredQuestionIds: string[];
  allRequiredAnsweredCorrectly: boolean;
  canSubmit: boolean;
  isSolved: boolean;
}

export function selectCaseList(input: {
  index: ContentIndex;
  knowledgeStates?: KnowledgeState[];
  confusions?: ConfusionRecord[];
  preferredDisciplineIds?: string[];
}): CaseListItem[] {
  return [...input.index.cases.values()]
    .map((record) => ({
      id: record.id,
      title: record.title,
      goal: record.goal,
      difficulty: record.difficulty,
      targetLabels: record.targetEntityIds.map((entityId) => getEntityLabel(input.index, entityId)),
      clueCount: record.clues.length,
      questionCount: record.questions.length,
      disciplineIds: extractDisciplineIds(input.index, record.targetEntityIds),
      weaknessScore: scoreCase(record, input.knowledgeStates, input.confusions, input.preferredDisciplineIds)
    }))
    .sort((left, right) => {
      if (right.weaknessScore !== left.weaknessScore) {
        return right.weaknessScore - left.weaknessScore;
      }

      return left.title.localeCompare(right.title, 'cs');
    });
}

export function selectRecommendedCaseId(input: {
  appState: AppStoreState;
  knowledgeStates?: KnowledgeState[];
  confusions?: ConfusionRecord[];
}): string | undefined {
  const index = input.appState.contentIndex;
  if (!index) {
    return undefined;
  }

  const caseList = selectCaseList({
    index,
    knowledgeStates: input.knowledgeStates,
    confusions: input.confusions,
    preferredDisciplineIds: input.appState.userProfile?.preferredDisciplineIds
  });

  return caseList[0]?.id;
}

export function selectCaseRecord(index: ContentIndex, caseId?: string): CaseRecord | undefined {
  if (!caseId) {
    return undefined;
  }

  return index.cases.get(caseId);
}

export function selectRevealedClues(record: CaseRecord, revealedClueIds: string[]): CaseRecord['clues'] {
  const revealedSet = new Set(revealedClueIds);
  return sortedClues(record).filter((clue) => revealedSet.has(clue.id));
}

export function selectNextRevealableClue(record: CaseRecord, revealedClueIds: string[]): CaseRecord['clues'][number] | undefined {
  const revealedSet = new Set(revealedClueIds);

  return sortedClues(record).find((clue) => {
    if (revealedSet.has(clue.id)) {
      return false;
    }

    return clue.unlockAfterClueIds.every((clueId) => revealedSet.has(clueId));
  });
}

export function selectVisibleQuestions(record: CaseRecord, revealedClueIds: string[], drafts: CaseAnswerDraftMap): CaseQuestionView[] {
  const revealedSet = new Set(revealedClueIds);

  return record.questions
    .filter((question) => question.unlockAfterClueIds.every((clueId) => revealedSet.has(clueId)))
    .map((question) => {
      const draft = drafts[question.id];
      const isCorrect = evaluateQuestion(question, draft);

      return {
        id: question.id,
        prompt: question.prompt,
        answerMode: question.answerMode,
        options: question.options,
        expectedAnswer: question.expectedAnswer,
        isAnswered: Boolean(
          question.answerMode === 'short-text'
            ? draft?.textAnswer?.trim()
            : (draft?.selectedOptionIds?.length ?? 0) > 0
        ),
        isCorrect
      };
    });
}

export function evaluateCaseDraft(record: CaseRecord, drafts: CaseAnswerDraftMap): CaseEvaluationSummary {
  let answeredCount = 0;
  let correctCount = 0;
  const correctIds = new Set<string>();

  for (const question of record.questions) {
    const draft = drafts[question.id];
    const answered = question.answerMode === 'short-text'
      ? Boolean(draft?.textAnswer?.trim())
      : (draft?.selectedOptionIds?.length ?? 0) > 0;

    if (answered) {
      answeredCount += 1;
    }

    if (evaluateQuestion(question, draft)) {
      correctCount += 1;
      correctIds.add(question.id);
    }
  }

  const minimumCorrectQuestions = record.evaluation.minimumCorrectQuestions ?? record.questions.length;
  const requiredQuestionIds = record.evaluation.requiredQuestionIds ?? [];
  const allRequiredAnsweredCorrectly = requiredQuestionIds.every((questionId) => correctIds.has(questionId));
  const canSubmit = answeredCount > 0;
  const isSolved = correctCount >= minimumCorrectQuestions && allRequiredAnsweredCorrectly;

  return {
    totalQuestions: record.questions.length,
    answeredCount,
    correctCount,
    minimumCorrectQuestions,
    requiredQuestionIds,
    allRequiredAnsweredCorrectly,
    canSubmit,
    isSolved
  };
}

export function createInitialRevealedClues(record: CaseRecord): string[] {
  const first = sortedClues(record)[0];
  return first ? [first.id] : [];
}

export function createInitialVisibleQuestionIds(record: CaseRecord, revealedClueIds: string[]): string[] {
  const revealedSet = new Set(revealedClueIds);
  return record.questions
    .filter((question) => question.unlockAfterClueIds.every((clueId) => revealedSet.has(clueId)))
    .map((question) => question.id);
}

function scoreCase(
  record: CaseRecord,
  knowledgeStates: KnowledgeState[] | undefined,
  confusions: ConfusionRecord[] | undefined,
  preferredDisciplineIds: string[] | undefined
): number {
  const entitySet = new Set(record.targetEntityIds);
  const confusionHits = (confusions ?? []).filter((item) => entitySet.has(item.sourceEntityId) || entitySet.has(item.confusedWithEntityId)).length;
  const weakKnowledgeHits = (knowledgeStates ?? [])
    .filter((item) => item.entityIds.some((entityId) => entitySet.has(entityId)))
    .filter((item) => item.masteryScore < 0.65 || item.errorCount > item.successCount)
    .length;
  const disciplineBoost = preferredDisciplineIds?.some((disciplineId) => extractDisciplineIdsFromRecord(record).includes(disciplineId)) ? 2 : 0;
  const difficultyBoost = record.difficulty === 'advanced' ? 0 : record.difficulty === 'intermediate' ? 1 : 2;

  return confusionHits * 5 + weakKnowledgeHits * 3 + disciplineBoost + difficultyBoost;
}

function extractDisciplineIds(index: ContentIndex, entityIds: EntityId[]): string[] {
  const ids = new Set<string>();

  for (const entityId of entityIds) {
    const entity = index.entities.get(entityId);
    if (!entity) {
      continue;
    }

    if ('disciplines' in entity) {
      for (const disciplineId of entity.disciplines) {
        ids.add(disciplineId);
      }
    } else {
      for (const disciplineId of entity.disciplineIds) {
        ids.add(disciplineId);
      }
    }
  }

  return [...ids];
}

function extractDisciplineIdsFromRecord(record: CaseRecord): string[] {
  return record.targetEntityIds.map((entityId) => entityId.split(':')[0]).filter(Boolean);
}

function evaluateQuestion(
  question: CaseRecord['questions'][number],
  draft: CaseAnswerDraft | undefined
): boolean {
  if (!draft) {
    return false;
  }

  if (question.answerMode === 'short-text') {
    const candidate = normalizeText(draft.textAnswer ?? '');
    const expected = normalizeText(question.expectedAnswer ?? '');
    return candidate.length > 0 && expected.length > 0 && candidate === expected;
  }

  const selected = new Set(draft.selectedOptionIds ?? []);
  const correct = new Set((question.options ?? []).filter((option) => option.isCorrect).map((option) => option.id));

  if (selected.size === 0 || correct.size === 0) {
    return false;
  }

  if (selected.size !== correct.size) {
    return false;
  }

  for (const id of correct) {
    if (!selected.has(id)) {
      return false;
    }
  }

  return true;
}

function sortedClues(record: CaseRecord): CaseRecord['clues'] {
  return record.clues.slice().sort((left, right) => left.weight - right.weight || left.title.localeCompare(right.title, 'cs'));
}

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('cs')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}
