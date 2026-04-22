import type {
  CaseId,
  ContrastMicrotaskType,
  ContrastSetId,
  DisciplineId,
  EntityId,
  PathId,
  RelationId,
} from '@/types/content';

export type StudyMode = 'atlas' | 'cases' | 'lab';

export type StudyUnitKind =
  | 'relation'
  | 'contrast-set'
  | 'path-step'
  | 'case'
  | 'question-template';

export interface StudyUnitRef {
  id: string;
  kind: StudyUnitKind;
  relationId?: RelationId;
  contrastSetId?: ContrastSetId;
  pathId?: PathId;
  caseId?: CaseId;
  entityIds: EntityId[];
  disciplineIds: DisciplineId[];
}

export interface StudyHint {
  id: string;
  title: string;
  text: string;
  unlockOrder: number;
}

export interface BaseTask {
  id: string;
  mode: StudyMode;
  unit: StudyUnitRef;
  prompt: string;
  expectedOutcome: string;
  hints: StudyHint[];
  explanationSeedIds: EntityId[];
}

export interface AtlasTaskOption {
  id: string;
  label: string;
  entityId?: EntityId;
  isCorrect: boolean;
}

export interface AtlasTask extends BaseTask {
  mode: 'atlas';
  taskType:
    | 'match-person-to-institution'
    | 'fill-historical-link'
    | 'match-person-to-method'
    | 'assign-discipline'
    | 'identify-missing-node';
  relationIds: RelationId[];
  options: AtlasTaskOption[];
}

export interface CaseTask extends BaseTask {
  mode: 'cases';
  caseId: CaseId;
  clueSequence: string[];
  questionIds: string[];
  synthesisPrompt: string;
}

export interface LabTaskOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface LabTask extends BaseTask {
  mode: 'lab';
  contrastSetId: ContrastSetId;
  microtaskType: ContrastMicrotaskType;
  options: LabTaskOption[];
}

export type StudyTask = AtlasTask | CaseTask | LabTask;

export type AnswerAccuracy = 'correct' | 'incorrect' | 'correct-after-hint' | 'skipped';

export interface StudyAnswer {
  taskId: string;
  submittedAt: string;
  accuracy: AnswerAccuracy;
  selectedOptionIds?: string[];
  freeTextAnswer?: string;
  usedHintIds: string[];
  responseTimeMs: number;
  confidence: 1 | 2 | 3 | 4 | 5;
}

export interface StudySessionPlan {
  id: string;
  mode: StudyMode;
  createdAt: string;
  targetDisciplineIds: DisciplineId[];
  taskIds: string[];
  plannedTaskCount: number;
  reason:
    | 'first-run'
    | 'resume'
    | 'daily-review'
    | 'weakness-focus'
    | 'discipline-focus';
}

export interface StudySessionResult {
  sessionId: string;
  mode: StudyMode;
  startedAt: string;
  completedAt?: string;
  taskIds: string[];
  completedTaskCount: number;
  correctTaskCount: number;
  hintRecoveries: number;
  weakRelationIds: RelationId[];
  generatedFollowUpModes: StudyMode[];
}
