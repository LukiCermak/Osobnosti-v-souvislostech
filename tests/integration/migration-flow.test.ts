import Dexie from 'dexie';
import { openDatabase, getMetaValue } from '@/db/database';
import { DATABASE_NAME, migrations } from '@/db/migrations';

describe('migration flow', () => {
  it('migruje starší databázi do verze 2 a normalizuje data', async () => {
    const legacy = new Dexie(DATABASE_NAME);
    legacy.version(1).stores(migrations[0].tables);
    await legacy.open();
    await legacy.table('userProfiles').put({ id: 'default-user', createdAt: '2026-04-22T08:00:00.000Z', lastActiveAt: '2026-04-22T09:00:00.000Z', preferredDisciplineIds: ['diagnostika','diagnostika'], preferredDailyIntensity: undefined, isFirstRun: 0 });
    await legacy.table('knowledgeStates').put({ id: 'legacy-state', unitKind: 'relation', relationId: 'rel-binet-developed-scale', entityIds: ['alfred-binet','alfred-binet','binet-simonova-skala'], masteryScore: 2, stabilityScore: -1, successCount: -3, errorCount: 2.9, studyPriority: 'core' });
    await legacy.table('confusions').put({ id: 'legacy-confusion', sourceEntityId: 'alfred-binet', confusedWithEntityId: 'lewis-terman', count: 0, lastOccurredAt: '2026-04-22T10:00:00.000Z', disciplineIds: ['diagnostika','diagnostika'], problemType: 'similar-person-confusion' });
    await legacy.table('sessionStates').put({ id: 'legacy-session', mode: 'atlas', startedAt: '2026-04-22T09:00:00.000Z', updatedAt: '2026-04-22T09:30:00.000Z', planId: 'legacy-plan', currentTaskId: '', remainingTaskIds: ['task-1','task-1'], completedTaskIds: ['task-0','task-0'] });
    legacy.close();
    const database = await openDatabase();
    expect((await database.knowledgeStates.get('legacy-state'))?.entityIds).toEqual(['alfred-binet','binet-simonova-skala']);
    expect((await database.knowledgeStates.get('legacy-state'))?.masteryScore).toBe(1);
    expect((await database.knowledgeStates.get('legacy-state'))?.stabilityScore).toBe(0);
    expect((await database.knowledgeStates.get('legacy-state'))?.successCount).toBe(0);
    expect((await database.knowledgeStates.get('legacy-state'))?.errorCount).toBe(2);
    expect((await database.confusions.get('legacy-confusion'))?.count).toBe(1);
    expect((await database.confusions.get('legacy-confusion'))?.disciplineIds).toEqual(['diagnostika']);
    expect((await database.userProfiles.get('default-user'))?.preferredDailyIntensity).toBe('standard');
    expect((await database.userProfiles.get('default-user'))?.isFirstRun).toBe(false);
    expect((await database.sessionStates.get('legacy-session'))?.remainingTaskIds).toEqual(['task-1']);
    expect((await database.sessionStates.get('legacy-session'))?.completedTaskIds).toEqual(['task-0']);
    expect((await database.sessionStates.get('legacy-session'))?.status).toBe('active');
    expect(await getMetaValue('db:schema-version')).toBe('2');
  });
});
