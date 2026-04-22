import { isStateDueToday, scheduleNextReview } from '@/core/learning/repetitionScheduler';

describe('repetitionScheduler', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-04-22T10:00:00.000Z')); });
  afterEach(() => { vi.useRealTimers(); });

  it('vrací okamžité opakování po chybě', () => {
    const result = scheduleNextReview({ masteryScore: 0.3, stabilityScore: 0.2, successCount: 0, errorCount: 2, dueAt: '2026-04-22T10:00:00.000Z' }, { taskId: 'task-1', submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'incorrect', usedHintIds: [], responseTimeMs: 5000, confidence: 2 });
    expect(result.queue).toBe('immediate');
    expect(result.intervalDays).toBe(0);
    expect(result.dueAt).toBe('2026-04-22T10:30:00.000Z');
  });

  it('vrací dnešní opakování po správné odpovědi s nápovědou', () => {
    const result = scheduleNextReview({ masteryScore: 0.55, stabilityScore: 0.45, successCount: 2, errorCount: 1, dueAt: '2026-04-22T10:00:00.000Z' }, { taskId: 'task-2', submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'correct-after-hint', usedHintIds: ['hint-1'], responseTimeMs: 9000, confidence: 3 });
    expect(result.queue).toBe('today');
    expect(result.intervalDays).toBe(0);
    expect(result.dueAt).toBe('2026-04-22T16:00:00.000Z');
  });

  it('stabilní znalost plánuje do budoucna', () => {
    const result = scheduleNextReview({ masteryScore: 0.82, stabilityScore: 0.76, successCount: 4, errorCount: 1, dueAt: '2026-04-22T10:00:00.000Z' }, { taskId: 'task-3', submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'correct', usedHintIds: [], responseTimeMs: 6000, confidence: 5 });
    expect(result.queue).toBe('scheduled');
    expect(result.intervalDays).toBeGreaterThan(1);
    expect(result.dueAt.startsWith('2026-05-')).toBe(true);
  });

  it('správně rozpozná položku splatnou dnes', () => {
    expect(isStateDueToday('2026-04-22T09:59:59.000Z')).toBe(true);
    expect(isStateDueToday('2026-04-22T10:00:01.000Z')).toBe(false);
    expect(isStateDueToday(undefined)).toBe(false);
  });
});
