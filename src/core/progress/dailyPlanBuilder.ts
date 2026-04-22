import type { DailyReviewPlan, ConfusionRecord, KnowledgeState, WeaknessFocus } from '@/types/progress';
import { recommendedModeForProblem } from '@/core/learning/learningPolicy';
import { analyzeWeaknesses } from '@/core/progress/weaknessAnalyzer';

export function buildDailyReviewPlan(states: KnowledgeState[], confusions: ConfusionRecord[]): DailyReviewPlan {
  const dueStates = states.filter((state) => state.dueAt && state.dueAt <= new Date().toISOString());
  const weaknesses = analyzeWeaknesses(states, confusions);
  const recommendedModes = deriveRecommendedModes(dueStates, weaknesses);
  const focusDisciplineIds = deriveFocusDisciplineIds(confusions, weaknesses);

  return {
    createdAt: new Date().toISOString(),
    recommendedModes,
    dueStateIds: dueStates.map((state) => state.id),
    focusDisciplineIds,
    weaknessFocusIds: weaknesses.slice(0, 8).map((item) => item.id)
  };
}

function deriveRecommendedModes(states: KnowledgeState[], weaknesses: WeaknessFocus[]) {
  const modes = new Set(states.map((state) => recommendedModeForProblem(state.activeProblemType)));
  for (const weakness of weaknesses.slice(0, 3)) {
    modes.add(recommendedModeForProblem(weakness.problemType));
  }
  return [...modes];
}

function deriveFocusDisciplineIds(confusions: ConfusionRecord[], weaknesses: WeaknessFocus[]): string[] {
  const disciplineIds = new Set<string>();

  for (const confusion of confusions.slice().sort((left, right) => right.count - left.count).slice(0, 5)) {
    for (const disciplineId of confusion.disciplineIds) {
      disciplineIds.add(disciplineId);
    }
  }

  for (const weakness of weaknesses.slice(0, 5)) {
    if (weakness.disciplineId) {
      disciplineIds.add(weakness.disciplineId);
    }
  }

  return [...disciplineIds];
}
