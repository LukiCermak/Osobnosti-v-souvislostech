import { expect, test } from '@playwright/test';

test('offline fallback zůstane po prvním načtení dostupný i bez sítě', async ({ page, context }) => {
  await page.goto('/offline/offline-fallback.html');
  await expect(page.getByText('Aplikace je dočasně offline')).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByText('Aplikace je dočasně offline')).toBeVisible();
  await expect(page.getByText('Jakmile se připojení obnoví')).toBeVisible();
});
