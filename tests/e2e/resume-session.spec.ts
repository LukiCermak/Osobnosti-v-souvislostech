import { test, expect, type Page } from '@playwright/test';

async function seedResumeSession(page: Page) {
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
        const tx = db.transaction(['userProfiles','sessionStates','meta'],'readwrite');
        tx.objectStore('userProfiles').put({ id: 'default-user', createdAt: '2026-04-22T08:00:00.000Z', lastActiveAt: '2026-04-22T09:00:00.000Z', preferredDisciplineIds: ['diagnostika'], preferredDailyIntensity: 'standard', isFirstRun: false });
        tx.objectStore('sessionStates').put({ id: 'session-atlas-1', mode: 'atlas', startedAt: '2026-04-22T09:55:00.000Z', updatedAt: '2026-04-22T10:00:00.000Z', planId: 'atlas-plan', currentTaskId: 'atlas-task:1:rel-binet-preceded-terman', remainingTaskIds: ['atlas-task:2','atlas-task:3'], completedTaskIds: [], status: 'paused' });
        tx.objectStore('meta').put({ key: 'content:version', value: 'test-fixture-1', updatedAt: '2026-04-22T10:00:00.000Z' });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
}

test('vracející se uživatel vidí rozpracované studium', async ({ page }) => {
  await page.goto('/');
  await seedResumeSession(page);
  await page.reload();
  await expect(page.getByText('Pokračovat tam, kde jste skončili')).toBeVisible();
  await expect(page.getByText(/Zbývá úloh: 3/)).toBeVisible();
  await expect(page.getByText(/Poslední režim: Atlas souvislostí/)).toBeVisible();
});
