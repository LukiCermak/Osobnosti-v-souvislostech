import { createSampleContentIndex } from '../fixtures/sample-content';
import { createSampleConfusions, createSampleKnowledgeStates } from '../fixtures/sample-progress';
import { planStudySession } from '@/core/learning/sessionPlanner';
import { evaluateStudyAnswer } from '@/core/learning/masteryEngine';
import { buildDailyReviewPlan } from '@/core/progress/dailyPlanBuilder';

describe('cases flow', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-04-22T10:00:00.000Z')); });
  afterEach(() => { vi.useRealTimers(); });

  it('naplánuje případový blok a po nápovědě udrží režim cases v doporučeních', () => {
    const index = createSampleContentIndex();
    const states = createSampleKnowledgeStates();
    const confusions = createSampleConfusions();
    const session = planStudySession({ index, mode: 'cases', knowledgeStates: states, confusions, desiredTaskCount: 1, reason: 'weakness-focus' });
    const result = evaluateStudyAnswer(index, session.tasks[0], { taskId: session.tasks[0].id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'correct-after-hint', usedHintIds: [session.tasks[0].hints[0].id], responseTimeMs: 11000, confidence: 3 });
    const plan = buildDailyReviewPlan([result.nextKnowledgeState, ...states], confusions);
    expect(result.detectedProblemType).toBe('needed-hint');
    expect(plan.recommendedModes).toContain('cases');
    expect(plan.weaknessFocusIds.length).toBeGreaterThan(0);
  });
});
