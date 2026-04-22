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

async function seedDailyReview(page: Page) {
  await resetDatabase(page);
  await page.evaluate(async () => {
    const request = indexedDB.open('osobnosti-v-souvislostech');
    await new Promise<void>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['userProfiles', 'knowledgeStates', 'confusions', 'meta'], 'readwrite');
        tx.objectStore('userProfiles').put({
          id: 'default-user',
          createdAt: '2026-04-22T08:00:00.000Z',
          lastActiveAt: '2026-04-22T09:00:00.000Z',
          preferredDisciplineIds: ['diagnostika'],
          preferredDailyIntensity: 'standard',
          isFirstRun: false
        });
        tx.objectStore('knowledgeStates').put({
          id: 'atlas-unit:rel-binet-preceded-terman',
          unitKind: 'relation',
          relationId: 'rel-binet-preceded-terman',
          entityIds: ['alfred-binet', 'lewis-terman'],
          masteryScore: 0.3,
          stabilityScore: 0.25,
          successCount: 0,
          errorCount: 2,
          dueAt: '2020-04-22T10:00:00.000Z',
          activeProblemType: 'historical-sequence',
          lastMode: 'atlas',
          studyPriority: 'important'
        });
        tx.objectStore('confusions').put({
          id: 'confusion:alfred-binet:lewis-terman',
          sourceEntityId: 'alfred-binet',
          confusedWithEntityId: 'lewis-terman',
          count: 4,
          lastOccurredAt: '2020-04-22T10:00:00.000Z',
          disciplineIds: ['diagnostika'],
          problemType: 'similar-person-confusion'
        });
        tx.objectStore('meta').put({
          key: 'content:version',
          value: 'test-fixture-1',
          updatedAt: '2020-04-22T10:00:00.000Z'
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
}

test('domovska obrazovka ukaze dnesni opakovani', async ({ page }) => {
  await seedDailyReview(page);
  await page.reload();

  await expect(page.getByRole('link', { name: 'Otevrit dnesni opakovani' }).first()).toBeVisible();
  await expect(page.getByText(/Dnes k opakovani: 1/).first()).toBeVisible();
});
