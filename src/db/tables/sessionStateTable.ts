import type { SessionStateRow } from '@/types/database';

export const sessionStateTable = {
  name: 'sessionStates',
  schema: '&id, mode, status, updatedAt, startedAt, planId, currentTaskId'
} as const;

export function normalizeSessionStateRow(row: SessionStateRow): SessionStateRow {
  return {
    ...row,
    remainingTaskIds: Array.from(new Set(row.remainingTaskIds)),
    completedTaskIds: Array.from(new Set(row.completedTaskIds)),
    currentTaskId: row.currentTaskId || row.currentTask?.id,
    context: row.context
      ? {
          pathId: row.context.pathId,
          caseId: row.context.caseId,
          contrastSetId: row.context.contrastSetId,
          reviewBlockId: row.context.reviewBlockId,
          revealedClueIds: row.context.revealedClueIds ? Array.from(new Set(row.context.revealedClueIds)) : undefined,
          revealedQuestionIds: row.context.revealedQuestionIds ? Array.from(new Set(row.context.revealedQuestionIds)) : undefined,
          selectedOptionIdsByQuestion: row.context.selectedOptionIdsByQuestion,
          textAnswersByQuestion: row.context.textAnswersByQuestion,
          synthesisDraft: row.context.synthesisDraft,
          labContrastSetIds: row.context.labContrastSetIds ? Array.from(new Set(row.context.labContrastSetIds)) : undefined,
          revealedHintIds: row.context.revealedHintIds ? Array.from(new Set(row.context.revealedHintIds)) : undefined,
          selectedOptionId: row.context.selectedOptionId
        }
      : undefined
  };
}
