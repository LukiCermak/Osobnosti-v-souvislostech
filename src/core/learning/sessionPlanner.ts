import type { DisciplineId } from '@/types/content';
import type { ContentIndex } from '@/core/content/contentIndex';
import { generateAtlasTasks } from '@/core/generators/atlasTaskGenerator';
import { generateCaseTasks } from '@/core/generators/caseGenerator';
import { generateLabTasks } from '@/core/generators/labTaskGenerator';
import { DEFAULT_SESSION_TASK_COUNT, recommendedModeForProblem } from '@/core/learning/learningPolicy';
import type { ConfusionRecord, KnowledgeState } from '@/types/progress';
import type { StudyMode, StudySessionPlan, StudyTask } from '@/types/study';

export interface SessionPlannerInput {
  index: ContentIndex;
  mode?: StudyMode;
  targetDisciplineIds?: DisciplineId[];
  knowledgeStates?: KnowledgeState[];
  confusions?: ConfusionRecord[];
  reason?: StudySessionPlan['reason'];
  desiredTaskCount?: number;
}

export interface PlannedSession {
  plan: StudySessionPlan;
  tasks: StudyTask[];
}

export function planStudySession(input: SessionPlannerInput): PlannedSession {
  const mode = input.mode ?? deriveModeFromKnowledge(input.knowledgeStates ?? []);
  const desiredTaskCount = Math.max(1, input.desiredTaskCount ?? DEFAULT_SESSION_TASK_COUNT);
  const tasks = generateTasksForMode({ ...input, mode, desiredTaskCount });

  const plan: StudySessionPlan = {
    id: createSessionId(mode),
    mode,
    createdAt: new Date().toISOString(),
    targetDisciplineIds: input.targetDisciplineIds ?? inferDisciplinesFromTasks(tasks),
    taskIds: tasks.map((task) => task.id),
    plannedTaskCount: tasks.length,
    reason: input.reason ?? 'discipline-focus'
  };

  return { plan, tasks };
}

export function generateTasksForMode(input: SessionPlannerInput & { mode: StudyMode; desiredTaskCount: number }): StudyTask[] {
  switch (input.mode) {
    case 'atlas':
      return generateAtlasTasks({
        index: input.index,
        targetDisciplineIds: input.targetDisciplineIds,
        knowledgeStates: input.knowledgeStates,
        limit: input.desiredTaskCount
      });
    case 'cases':
      return generateCaseTasks({
        index: input.index,
        limit: input.desiredTaskCount
      });
    case 'lab':
      return generateLabTasks({
        index: input.index,
        confusions: input.confusions,
        knowledgeStates: input.knowledgeStates,
        limit: input.desiredTaskCount
      });
  }
}

function deriveModeFromKnowledge(states: KnowledgeState[]): StudyMode {
  const activeProblems = states
    .filter((state) => state.activeProblemType)
    .slice()
    .sort((left, right) => (right.errorCount + right.successCount) - (left.errorCount + left.successCount));

  return recommendedModeForProblem(activeProblems[0]?.activeProblemType);
}

function inferDisciplinesFromTasks(tasks: StudyTask[]): DisciplineId[] {
  return Array.from(new Set(tasks.flatMap((task) => task.unit.disciplineIds)));
}

function createSessionId(mode: StudyMode): string {
  return `${mode}-${new Date().toISOString()}`;
}
