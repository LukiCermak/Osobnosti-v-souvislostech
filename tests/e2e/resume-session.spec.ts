import { expect, test, type Page } from '@playwright/test';

async function resetDatabase(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    const database = indexedDB.open('osobnosti-v-souvislostech');
    await new Promise<void>((resolve, reject) => {
      database.onsuccess = () => {
        const db = database.result;
        const names = Array.from(db.objectStoreNames);
        const tx = db.transaction(names, 'readwrite');
        for (const name of names) {
          tx.objectStore(name).clear();
        }
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      database.onerror = () => reject(database.error);
      database.onblocked = () => resolve();
    });
  });
}

async function seedResumeSession(page: Page) {
  await resetDatabase(page);
  await page.evaluate(async () => {
    const request = indexedDB.open('osobnosti-v-souvislostech');
    await new Promise<void>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['userProfiles', 'sessionStates', 'meta'], 'readwrite');
        tx.objectStore('userProfiles').put({ id: 'default-user', createdAt: '2026-04-22T08:00:00.000Z', lastActiveAt: '2026-04-22T09:00:00.000Z', preferredDisciplineIds: ['diagnostika'], preferredDailyIntensity: 'standard', isFirstRun: false });
        tx.objectStore('sessionStates').put({ id: 'session-atlas-1', mode: 'atlas', startedAt: '2026-04-22T09:55:00.000Z', updatedAt: '2026-04-22T10:00:00.000Z', planId: 'atlas-plan', currentTaskId: 'atlas-task:1:rel-binet-preceded-terman', remainingTaskIds: ['atlas-task:2', 'atlas-task:3'], completedTaskIds: [], status: 'paused' });
        tx.objectStore('meta').put({ key: 'content:version', value: 'test-fixture-1', updatedAt: '2026-04-22T10:00:00.000Z' });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
}

test('vracející se uživatel vidí rozpracované studium', async ({ page }) => {
  await seedResumeSession(page);
  await page.reload();
  await expect(page.getByText('Můžeš navázat tam, kde jsi skončil')).toBeVisible();
  await expect(page.getByText(/Zbývající úkoly: 3/)).toBeVisible();
  await expect(page.getByText(/Režim: Atlas souvislostí/)).toBeVisible();
});
