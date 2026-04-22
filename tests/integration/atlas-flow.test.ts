import { createSampleContentIndex } from '../fixtures/sample-content';
import { createSampleConfusions, createSampleKnowledgeStates } from '../fixtures/sample-progress';
import { planStudySession } from '@/core/learning/sessionPlanner';
import { evaluateStudyAnswer } from '@/core/learning/masteryEngine';
import { buildProgressSnapshot } from '@/core/progress/snapshotBuilder';

describe('atlas flow', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-04-22T10:00:00.000Z')); });
  afterEach(() => { vi.useRealTimers(); });

  it('naplánuje atlasový blok, vyhodnotí odpověď a vytvoří snapshot', () => {
    const index = createSampleContentIndex();
    const states = createSampleKnowledgeStates();
    const confusions = createSampleConfusions();
    const session = planStudySession({ index, mode: 'atlas', targetDisciplineIds: ['diagnostika'], knowledgeStates: states, confusions, desiredTaskCount: 2, reason: 'daily-review' });
    expect(session.plan.mode).toBe('atlas');
    expect(session.tasks[0].relationIds[0]).toBe('rel-binet-preceded-terman');
    const result = evaluateStudyAnswer(index, session.tasks[0], { taskId: session.tasks[0].id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'correct', selectedOptionIds: ['correct'], usedHintIds: [], responseTimeMs: 5500, confidence: 4 }, states[1]);
    const snapshot = buildProgressSnapshot(index, [result.nextKnowledgeState, states[0], states[2]], confusions);
    expect(result.detectedProblemType).toBe('historical-sequence');
    expect(snapshot.totalUnits).toBe(3);
    expect(snapshot.dueToday).toBe(1);
  });
});
