import { test, expect } from '@playwright/test';

test('první spuštění zobrazí přehled a hlavní režimy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Jedna aplikace, tři studijní režimy/i })).toBeVisible();
  await expect(page.getByText('První spuštění')).toBeVisible();
  await expect(page.getByText('Atlas souvislostí').first()).toBeVisible();
  await expect(page.getByText('Detektivní spisy').first()).toBeVisible();
  await expect(page.getByText('Laboratoř rozlišení').first()).toBeVisible();
});
