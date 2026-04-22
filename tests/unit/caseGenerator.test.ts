import { createSampleContentIndex } from '../fixtures/sample-content';
import { createCaseTask, generateCaseTasks } from '@/core/generators/caseGenerator';

describe('caseGenerator', () => {
  it('řadí indicie podle váhy a vytváří syntetickou otázku', () => {
    const index = createSampleContentIndex();
    const task = createCaseTask(index, index.cases.get('case-binet-terman')!, 1);
    expect(task.clueSequence).toEqual(['clue-1','clue-3','clue-2']);
    expect(task.questionIds).toEqual(['question-1','question-2']);
    expect(task.synthesisPrompt).toContain('Alfred Binet');
    expect(task.synthesisPrompt).toContain('Lewis Terman');
  });

  it('umí vygenerovat jen cílený případ', () => {
    const index = createSampleContentIndex();
    const tasks = generateCaseTasks({ index, targetCaseId: 'case-binet-terman', limit: 1 });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].caseId).toBe('case-binet-terman');
  });
});
