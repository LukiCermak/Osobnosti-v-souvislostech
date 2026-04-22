import { test, expect, type Page } from '@playwright/test';

async function seedDailyReview(page: Page) {
  await page.evaluate(async () => {
    const request = indexedDB.open('osobnosti-v-souvislostech', 2);
    await new Promise<void>((resolve, reject) => {
      request.onupgradeneeded = () => {
        const db = request.result;
        const add = (name: string, keyPath: string, indexes: Array<[string,string,boolean?]>) => {
          if (db.objectStoreNames.contains(name)) return;
          const store = db.createObjectStore(name, { keyPath });
          for (const [idx, field, multi] of indexes) store.createIndex(idx, field, multi ? { multiEntry: true } : undefined);
        };
        add('userProfiles','id',[['lastActiveAt','lastActiveAt'],['isFirstRun','isFirstRun'],['preferredDisciplineIds','preferredDisciplineIds',true]]);
        add('knowledgeStates','id',[['unitKind','unitKind'],['dueAt','dueAt'],['lastAttemptAt','lastAttemptAt'],['activeProblemType','activeProblemType'],['lastMode','lastMode'],['studyPriority','studyPriority'],['relationId','relationId'],['contrastSetId','contrastSetId'],['pathId','pathId'],['entityIds','entityIds',true]]);
        add('confusions','id',[['sourceEntityId','sourceEntityId'],['confusedWithEntityId','confusedWithEntityId'],['lastOccurredAt','lastOccurredAt'],['problemType','problemType']]);
        add('sessionStates','id',[['mode','mode'],['status','status'],['updatedAt','updatedAt'],['startedAt','startedAt'],['planId','planId'],['currentTaskId','currentTaskId']]);
        add('progressSnapshots','id',[['capturedAt','capturedAt']]);
        add('meta','key',[['updatedAt','updatedAt']]);
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['userProfiles','knowledgeStates','confusions','meta'],'readwrite');
        tx.objectStore('userProfiles').put({ id: 'default-user', createdAt: '2026-04-22T08:00:00.000Z', lastActiveAt: '2026-04-22T09:00:00.000Z', preferredDisciplineIds: ['diagnostika'], preferredDailyIntensity: 'standard', isFirstRun: false });
        tx.objectStore('knowledgeStates').put({ id: 'atlas-unit:rel-binet-preceded-terman', unitKind: 'relation', relationId: 'rel-binet-preceded-terman', entityIds: ['alfred-binet','lewis-terman'], masteryScore: 0.3, stabilityScore: 0.25, successCount: 0, errorCount: 2, dueAt: '2026-04-22T10:00:00.000Z', activeProblemType: 'historical-sequence', lastMode: 'atlas', studyPriority: 'important' });
        tx.objectStore('confusions').put({ id: 'confusion:alfred-binet:lewis-terman', sourceEntityId: 'alfred-binet', confusedWithEntityId: 'lewis-terman', count: 4, lastOccurredAt: '2026-04-22T10:00:00.000Z', disciplineIds: ['diagnostika'], problemType: 'similar-person-confusion' });
        tx.objectStore('meta').put({ key: 'content:version', value: 'test-fixture-1', updatedAt: '2026-04-22T10:00:00.000Z' });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
}

test('domovská obrazovka ukáže dnešní opakování', async ({ page }) => {
  await page.goto('/');
  await seedDailyReview(page);
  await page.reload();
  await expect(page.getByText('Dnešní opakování')).toBeVisible();
  await expect(page.getByText(/K opakování dnes: 1/)).toBeVisible();
});
