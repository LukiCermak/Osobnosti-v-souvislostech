import { expect, test } from '@playwright/test';

async function resetDatabase(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    const database = indexedDB.open('osobnosti-v-souvislostech');
    await new Promise<void>((resolve, reject) => {
      database.onsuccess = () => {
        const db = database.result;
        const names = Array.from(db.objectStoreNames);
        if (names.length === 0) {
          db.close();
          resolve();
          return;
        }

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
      database.onupgradeneeded = () => {
        database.result.close();
        resolve();
      };
      database.onblocked = () => resolve();
    });
  });
}

test('první spuštění zobrazí přehled a hlavní režimy', async ({ page }) => {
  await resetDatabase(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Pokračuj tam, kde má další studium největší smysl/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Začít studijní blok|Dokončit první nastavení/i }).first()).toBeVisible();
  await expect(page.getByText('Atlas souvislostí').first()).toBeVisible();
  await expect(page.getByText('Detektivní spisy').first()).toBeVisible();
  await expect(page.getByText('Laboratoř rozlišení').first()).toBeVisible();
});
