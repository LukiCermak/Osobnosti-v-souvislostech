export type EntityId = string;
export type PersonId = EntityId;
export type ConceptId = EntityId;
export type RelationId = EntityId;
export type PathId = EntityId;
export type CaseId = EntityId;
export type ContrastSetId = EntityId;
export type DisciplineId = string;
export type EraId = string;
export type TagId = string;

export type StudyPriority = 'core' | 'important' | 'context';
export type LearningDifficulty = 'introductory' | 'intermediate' | 'advanced';

export interface SourceReference {
  sourceDocumentId: string;
  section?: string;
  locator?: string;
  excerpt?: string;
  note?: string;
}

export interface LifeSpan {
  birthYear?: number | null;
  deathYear?: number | null;
  displayLabel?: string;
}

export interface DisciplineDefinition {
  id: DisciplineId;
  label: string;
  shortLabel?: string;
  description?: string;
  order: number;
  tags?: TagId[];
}

export interface EraDefinition {
  id: EraId;
  label: string;
  sortKey: number;
  startYear?: number | null;
  endYear?: number | null;
  description?: string;
}

export interface TagDefinition {
  id: TagId;
  label: string;
  description?: string;
  category?: 'topic' | 'institution' | 'method' | 'assessment' | 'historical' | 'comparison' | 'other';
}

export interface PersonRecord {
  id: PersonId;
  displayName: string;
  alternativeNames: string[];
  lifeSpan?: LifeSpan;
  eraId: EraId;
  periodLabel: string;
  nationalContext: string;
  disciplines: DisciplineId[];
  significanceSummary: string;
  mainAnchors: string[];
  relationTargets: EntityId[];
  studyPriority: StudyPriority;
  confusionTags: TagId[];
  tags: TagId[];
  sourceReferences: SourceReference[];
}

export type ConceptType =
  | 'discipline'
  | 'institution'
  | 'method'
  | 'test'
  | 'scale'
  | 'work'
  | 'publication'
  | 'system'
  | 'term'
  | 'event'
  | 'approach'
  | 'diagnostic-class'
  | 'communication-system';

export interface ConceptRecord {
  id: ConceptId;
  type: ConceptType;
  label: string;
  alternativeLabels: string[];
  significanceSummary: string;
  disciplineIds: DisciplineId[];
  tags: TagId[];
  sourceReferences: SourceReference[];
}

export type RelationType =
  | 'associated-with'
  | 'founded'
  | 'developed'
  | 'revised'
  | 'co-authored'
  | 'influenced'
  | 'introduced'
  | 'led'
  | 'worked-at'
  | 'studied'
  | 'taught'
  | 'belongs-to-discipline'
  | 'represents-approach'
  | 'contrasts-with'
  | 'preceded'
  | 'succeeded'
  | 'inspired'
  | 'treated'
  | 'diagnosed'
  | 'used-method'
  | 'created-system'
  | 'related-to';

export type RelationStrength = 'primary' | 'secondary' | 'contextual';
export type RelationDirection = 'forward' | 'reverse' | 'bidirectional';

export interface RelationRecord {
  id: RelationId;
  fromId: EntityId;
  toId: EntityId;
  type: RelationType;
  strength: RelationStrength;
  direction: RelationDirection;
  studyPriority: StudyPriority;
  suitableForContrast: boolean;
  explanation: string;
  tags: TagId[];
  sourceReferences: SourceReference[];
}

export interface PathStep {
  id: string;
  entityId: EntityId;
  role: 'entry' | 'bridge' | 'contrast' | 'milestone' | 'target';
  prompt?: string;
}

export interface ContrastMoment {
  id: string;
  title: string;
  focusEntityIds: EntityId[];
  question: string;
}

export interface PathRecord {
  id: PathId;
  title: string;
  didacticGoal: string;
  disciplineIds: DisciplineId[];
  eraIds: EraId[];
  steps: PathStep[];
  requiredNodeIds: EntityId[];
  contrastMoments: ContrastMoment[];
  recommendedDifficulty: LearningDifficulty;
  sourceReferences: SourceReference[];
}

export interface CaseClue {
  id: string;
  title: string;
  text: string;
  unlockAfterClueIds: string[];
  focusEntityIds: EntityId[];
  weight: number;
}

export interface CaseQuestionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  rationale?: string;
}

export interface CaseQuestion {
  id: string;
  prompt: string;
  answerMode: 'single-choice' | 'multi-choice' | 'short-text';
  unlockAfterClueIds: string[];
  relatedEntityIds: EntityId[];
  options?: CaseQuestionOption[];
  expectedAnswer?: string;
}

export interface EvaluationRule {
  minimumCorrectQuestions?: number;
  requiredQuestionIds?: string[];
  allowHintRecovery?: boolean;
}

export interface CaseRecord {
  id: CaseId;
  title: string;
  targetEntityIds: EntityId[];
  targetRelationIds: RelationId[];
  goal: string;
  difficulty: LearningDifficulty;
  clues: CaseClue[];
  questions: CaseQuestion[];
  evaluation: EvaluationRule;
  followUpExplanation: string;
  sourceReferences: SourceReference[];
}

export type ContrastMicrotaskType =
  | 'two-names-one-attribute'
  | 'one-institution-two-people'
  | 'one-scale-three-authors'
  | 'historical-sequence'
  | 'incorrect-link-detection'
  | 'definition-discrimination';

export interface ContrastSetRecord {
  id: ContrastSetId;
  title: string;
  personIds: PersonId[];
  relatedEntityIds: EntityId[];
  confusionReason: string;
  distinguishingFeature: string;
  microtaskTypes: ContrastMicrotaskType[];
  sourceReferences: SourceReference[];
}

export interface ContentBundleVersion {
  version: string;
  createdAt: string;
  sourceDigest: string;
}
