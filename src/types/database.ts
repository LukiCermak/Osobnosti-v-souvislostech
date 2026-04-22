import type { ProgressSnapshot, UserProfile } from '@/types/progress';
import type { StudyMode, StudySessionPlan, StudyTask } from '@/types/study';

export type TableName =
  | 'userProfiles'
  | 'knowledgeStates'
  | 'confusions'
  | 'sessionStates'
  | 'progressSnapshots'
  | 'meta';

export type UserProfileRow = UserProfile;

export interface KnowledgeStateRow {
  id: string;
  unitKind: string;
  relationId?: string;
  contrastSetId?: string;
  pathId?: string;
  entityIds: string[];
  masteryScore: number;
  stabilityScore: number;
  successCount: number;
  errorCount: number;
  lastAttemptAt?: string;
  dueAt?: string;
  averageResponseTimeMs?: number;
  confidenceAverage?: number;
  activeProblemType?: string;
  lastMode?: string;
  studyPriority: string;
}

export interface ConfusionRow {
  id: string;
  sourceEntityId: string;
  confusedWithEntityId: string;
  count: number;
  lastOccurredAt: string;
  disciplineIds: string[];
  problemType: string;
}

export interface SessionStateRow {
  id: string;
  mode: StudyMode;
  startedAt: string;
  updatedAt: string;
  planId: string;
  plan?: StudySessionPlan;
  currentTaskId?: string;
  currentTask?: StudyTask;
  remainingTaskIds: string[];
  completedTaskIds: string[];
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  context?: {
    pathId?: string;
    caseId?: string;
    contrastSetId?: string;
    reviewBlockId?: string;
    revealedClueIds?: string[];
    revealedQuestionIds?: string[];
    selectedOptionIdsByQuestion?: Record<string, string[]>;
    textAnswersByQuestion?: Record<string, string>;
    synthesisDraft?: string;
    labContrastSetIds?: string[];
    revealedHintIds?: string[];
    selectedOptionId?: string;
  };
  lastAnswerAt?: string;
}

export type ProgressSnapshotRow = ProgressSnapshot;

export interface MetaRow {
  key: string;
  value: string;
  updatedAt: string;
}

export interface AppDatabaseSchema {
  userProfiles: UserProfileRow;
  knowledgeStates: KnowledgeStateRow;
  confusions: ConfusionRow;
  sessionStates: SessionStateRow;
  progressSnapshots: ProgressSnapshotRow;
  meta: MetaRow;
}

export interface MigrationDefinition {
  version: number;
  description: string;
  tables: Partial<Record<TableName, string>>;
}

export interface ExportedDatabasePayload {
  exportedAt: string;
  schemaVersion: number;
  contentVersion?: string;
  appVersion?: string;
  data: {
    userProfiles: UserProfileRow[];
    knowledgeStates: KnowledgeStateRow[];
    confusions: ConfusionRow[];
    sessionStates: SessionStateRow[];
    progressSnapshots: ProgressSnapshotRow[];
    meta: MetaRow[];
  };
}

export interface DatabaseHealth {
  isOpen: boolean;
  schemaVersion: number;
  tableCounts: Record<TableName, number>;
  lastError?: string;
}
