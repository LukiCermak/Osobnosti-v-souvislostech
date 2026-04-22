import { createSampleContentIndex } from '../fixtures/sample-content';
import { createSampleKnowledgeStates } from '../fixtures/sample-progress';
import { createAtlasTask, generateAtlasTasks } from '@/core/generators/atlasTaskGenerator';

describe('atlasTaskGenerator', () => {
  it('upřednostní splatnou vazbu a respektuje filtr disciplíny', () => {
    const index = createSampleContentIndex();
    const tasks = generateAtlasTasks({ index, targetDisciplineIds: ['diagnostika'], knowledgeStates: createSampleKnowledgeStates(), limit: 3 });
    expect(tasks).toHaveLength(3);
    expect(tasks[0].relationIds[0]).toBe('rel-binet-preceded-terman');
    expect(tasks.every((task) => task.unit.disciplineIds.includes('diagnostika'))).toBe(true);
  });

  it('vytvoří atlasovou úlohu s korektní odpovědí mezi možnostmi', () => {
    const index = createSampleContentIndex();
    const task = createAtlasTask(index, index.relations.get('rel-binet-belongs-diagnostics')!, 1);
    const correct = task.options.find((option) => option.isCorrect);
    expect(task.taskType).toBe('assign-discipline');
    expect(task.prompt).toContain('Alfred Binet');
    expect(correct?.entityId).toBe('diagnostika-discipliny');
    expect(task.hints).toHaveLength(2);
  });
});
