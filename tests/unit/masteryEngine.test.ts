import { createSampleContentIndex } from '../fixtures/sample-content';
import { createInitialKnowledgeState, evaluateStudyAnswer } from '@/core/learning/masteryEngine';
import { createAtlasTask } from '@/core/generators/atlasTaskGenerator';

describe('masteryEngine', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-04-22T10:00:00.000Z')); });
  afterEach(() => { vi.useRealTimers(); });

  it('u chybné atlasové odpovědi vytvoří záměnu a okamžité opakování', () => {
    const index = createSampleContentIndex();
    const task = createAtlasTask(index, index.relations.get('rel-binet-worked-at')!, 1);
    const wrongOption = task.options.find((option) => !option.isCorrect)!;
    const result = evaluateStudyAnswer(index, task, { taskId: task.id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'incorrect', selectedOptionIds: [wrongOption.id], usedHintIds: [], responseTimeMs: 12000, confidence: 2 });
    expect(result.detectedProblemType).toBe('institution-link');
    expect(result.shouldCreateConfusionRecord).toBe(true);
    expect(result.confusionPair).toEqual({ sourceEntityId: 'parizska-laborator', confusedWithEntityId: wrongOption.entityId });
    expect(result.nextKnowledgeState.errorCount).toBe(1);
    expect(result.nextKnowledgeState.masteryScore).toBeLessThan(createInitialKnowledgeState(task).masteryScore);
    expect(result.nextReviewAt).toBe('2026-04-22T10:30:00.000Z');
  });

  it('u správné odpovědi zvyšuje zvládnutí a nehlásí záměnu', () => {
    const index = createSampleContentIndex();
    const task = createAtlasTask(index, index.relations.get('rel-binet-developed-scale')!, 1);
    const current = { ...createInitialKnowledgeState(task), masteryScore: 0.5, stabilityScore: 0.4, successCount: 2, errorCount: 1, dueAt: '2026-04-22T10:00:00.000Z' };
    const result = evaluateStudyAnswer(index, task, { taskId: task.id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'correct', selectedOptionIds: ['correct'], usedHintIds: [], responseTimeMs: 8000, confidence: 4 }, current);
    expect(result.detectedProblemType).toBe('test-link');
    expect(result.shouldCreateConfusionRecord).toBe(false);
    expect(result.nextKnowledgeState.successCount).toBe(3);
    expect(result.nextKnowledgeState.masteryScore).toBeGreaterThan(current.masteryScore);
    expect(result.nextKnowledgeState.dueAt).toBe('2026-04-27T10:00:00.000Z');
  });
});
