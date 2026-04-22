import { createSampleContentIndex } from '../fixtures/sample-content';
import { createSampleConfusions, createSampleKnowledgeStates } from '../fixtures/sample-progress';
import { createLabTask, generateLabTasks } from '@/core/generators/labTaskGenerator';

describe('labTaskGenerator', () => {
  it('upřednostní kontrastní sadu s častou záměnou a splatnou znalostí', () => {
    const index = createSampleContentIndex();
    const tasks = generateLabTasks({ index, confusions: createSampleConfusions(), knowledgeStates: createSampleKnowledgeStates(), limit: 1 });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].contrastSetId).toBe('contrast-binet-terman');
    expect(tasks[0].prompt).toContain('Rozliš');
  });

  it('vytváří rozlišovací úlohu s nápovědami a správnou první volbou', () => {
    const index = createSampleContentIndex();
    const task = createLabTask(index, index.contrastSets.get('contrast-binet-terman')!, 1);
    expect(task.options[0]).toMatchObject({ label: 'Alfred Binet', isCorrect: true });
    expect(task.hints[0].text).toContain('často pletou');
    expect(task.unit.disciplineIds).toContain('diagnostika');
  });
});
