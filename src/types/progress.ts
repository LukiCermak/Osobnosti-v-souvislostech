import type {
  ContrastSetId,
  DisciplineId,
  EntityId,
  PathId,
  RelationId,
  StudyPriority,
  TagId,
} from '@/types/content';
import type { AnswerAccuracy, StudyMode, StudyUnitKind } from '@/types/study';

export interface UserProfile {
  id: string;
  pseudonym?: string;
  createdAt: string;
  lastActiveAt: string;
  preferredDisciplineIds: DisciplineId[];
  preferredDailyIntensity: 'light' | 'standard' | 'deep';
  isFirstRun: boolean;
}

export type KnowledgeProblemType =
  | 'discipline-assignment'
  | 'institution-link'
  | 'test-link'
  | 'historical-sequence'
  | 'similar-person-confusion'
  | 'active-recall-gap'
  | 'needed-hint';

export interface KnowledgeState {
  id: string;
  unitKind: StudyUnitKind;
  relationId?: RelationId;
  contrastSetId?: ContrastSetId;
  pathId?: PathId;
  entityIds: EntityId[];
  masteryScore: number;
  stabilityScore: number;
  successCount: number;
  errorCount: number;
  lastAttemptAt?: string;
  dueAt?: string;
  averageResponseTimeMs?: number;
  confidenceAverage?: number;
  activeProblemType?: KnowledgeProblemType;
  lastMode?: StudyMode;
  studyPriority: StudyPriority;
}

export interface ConfusionRecord {
  id: string;
  sourceEntityId: EntityId;
  confusedWithEntityId: EntityId;
  count: number;
  lastOccurredAt: string;
  disciplineIds: DisciplineId[];
  problemType: KnowledgeProblemType;
}

export interface AnswerEvent {
  id: string;
  occurredAt: string;
  unitStateId: string;
  mode: StudyMode;
  accuracy: AnswerAccuracy;
  responseTimeMs: number;
  confidence: number;
}

export interface ProgressSnapshot {
  id: string;
  capturedAt: string;
  totalUnits: number;
  masteredUnits: number;
  unstableUnits: number;
  dueToday: number;
  disciplineCoverage: Array<{
    disciplineId: DisciplineId;
    total: number;
    mastered: number;
    unstable: number;
  }>;
  topConfusions: Array<{
    sourceEntityId: EntityId;
    confusedWithEntityId: EntityId;
    count: number;
  }>;
}

export interface WeaknessFocus {
  id: string;
  title: string;
  disciplineId?: DisciplineId;
  tagIds: TagId[];
  relationIds: RelationId[];
  entityIds?: EntityId[];
  contrastSetId?: ContrastSetId;
  pathId?: PathId;
  problemType: KnowledgeProblemType;
  urgency: 'low' | 'medium' | 'high';
}

export interface DailyReviewPlan {
  createdAt: string;
  recommendedModes: StudyMode[];
  dueStateIds: string[];
  focusDisciplineIds: DisciplineId[];
  weaknessFocusIds: string[];
}
