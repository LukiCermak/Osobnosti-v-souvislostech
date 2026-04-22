import { createSampleContentIndex } from '../fixtures/sample-content';
import { classifyAnswerError } from '@/core/learning/errorClassifier';
import { createAtlasTask } from '@/core/generators/atlasTaskGenerator';
import { createCaseTask } from '@/core/generators/caseGenerator';
import { createLabTask } from '@/core/generators/labTaskGenerator';

describe('errorClassifier', () => {
  it('atlasová vazba pracoviště se klasifikuje jako institucionální problém', () => {
    const index = createSampleContentIndex();
    const task = createAtlasTask(index, index.relations.get('rel-binet-worked-at')!, 1);
    const result = classifyAnswerError(index, task, { taskId: task.id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'incorrect', selectedOptionIds: ['o1'], usedHintIds: [], responseTimeMs: 4000, confidence: 2 });
    expect(result.problemType).toBe('institution-link');
    expect(result.recommendedMode).toBe('atlas');
    expect(result.shouldTriggerContrast).toBe(false);
  });

  it('historická návaznost doporučuje případový follow-up', () => {
    const index = createSampleContentIndex();
    const task = createAtlasTask(index, index.relations.get('rel-binet-preceded-terman')!, 1);
    const result = classifyAnswerError(index, task, { taskId: task.id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'incorrect', selectedOptionIds: ['o1'], usedHintIds: [], responseTimeMs: 4000, confidence: 2 });
    expect(result.problemType).toBe('historical-sequence');
    expect(result.recommendedMode).toBe('cases');
    expect(result.shouldTriggerCaseFollowUp).toBe(true);
  });

  it('chyba v Laboratoři rozlišení zůstává v režimu lab', () => {
    const index = createSampleContentIndex();
    const task = createLabTask(index, index.contrastSets.get('contrast-binet-terman')!, 1);
    const result = classifyAnswerError(index, task, { taskId: task.id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'incorrect', selectedOptionIds: ['person-2'], usedHintIds: [], responseTimeMs: 3000, confidence: 2 });
    expect(result.problemType).toBe('similar-person-confusion');
    expect(result.recommendedMode).toBe('lab');
    expect(result.shouldTriggerContrast).toBe(true);
  });

  it('odpověď s nápovědou v případovém režimu vrací problem needed-hint', () => {
    const index = createSampleContentIndex();
    const task = createCaseTask(index, index.cases.get('case-binet-terman')!, 1);
    const result = classifyAnswerError(index, task, { taskId: task.id, submittedAt: '2026-04-22T10:00:00.000Z', accuracy: 'correct-after-hint', usedHintIds: ['case-binet-terman:hint:clue-1'], responseTimeMs: 7000, confidence: 3 });
    expect(result.problemType).toBe('needed-hint');
    expect(result.recommendedMode).toBe('cases');
  });
});
