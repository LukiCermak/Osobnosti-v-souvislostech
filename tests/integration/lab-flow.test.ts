import { createSampleContentIndex } from '../fixtures/sample-content';
import { createSampleConfusions, createSampleKnowledgeStates } from '../fixtures/sample-progress';
import { planStudySession } from '@/core/learning/sessionPlanner';
import { evaluateStudyAnswer } from '@/core/learning/masteryEngine';
import { buildDailyReviewPlan } from '@/core/progress/dailyPlanBuilder';

describe('lab flow', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-04-22T10:00:00.000Z')); });
  afterEach(() => { vi.useRealTimers(); });

  it('vybere sadu se záměnou a po chybě doporučí další práci v Laboratoři', () => {
    const index = createSampleContentIndex();
    const states = createSampleKnowledgeStates();
    const confusions = createSampleConfusions();
    const session = planStudySession({ index, mode: 'lab', knowledgeStates: states, confusions, desiredTaskCount: 1, reason: 'daily-review' });
    const result = evaluateStudyAnswer(index, session.tasks[0], { taskId: session.tasks[0].id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'incorrect', selectedOptionIds: ['person-2'], usedHintIds: [], responseTimeMs: 3000, confidence: 2 }, states[2]);
    const plan = buildDailyReviewPlan([states[0], states[1], result.nextKnowledgeState], confusions);
    expect(result.shouldCreateConfusionRecord).toBe(true);
    expect(result.detectedProblemType).toBe('similar-person-confusion');
    expect(plan.recommendedModes).toContain('lab');
  });
});
