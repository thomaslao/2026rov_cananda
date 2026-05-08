import { expect, test } from '@playwright/test';

test('loads dashboard and switches locale', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation')).toContainText('ROV');
  await expect(page.locator('#page-dashboard')).toBeVisible();

  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.locator('#page-dashboard')).toContainText('Dashboard');

  await page.getByRole('button', { name: '繁中' }).click();
  await expect(page.locator('#page-dashboard')).toContainText('總覽');
});

test('navigates core pages', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /任務|Tasks/ }).click();
  await expect(page.locator('#page-tasks')).toBeVisible();

  await page.getByRole('button', { name: /備戰|Prep/ }).click();
  await expect(page.locator('#page-prep')).toBeVisible();

  await page.getByRole('button', { name: /比賽|Competition/ }).click();
  await expect(page.locator('#page-competition')).toBeVisible();

  await page.getByRole('button', { name: /設置|Settings/ }).click();
  await expect(page.locator('#page-settings')).toBeVisible();
});

test('task create flow persists in local UI', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /任務|Tasks/ }).click();

  const taskName = `PW task ${Date.now()}`;
  await page.locator('[name="name"]').fill(taskName);
  await page.locator('[name="owner"]').fill('Playwright');
  await page.getByRole('button', { name: /新增任務|Add task/ }).click();

  await expect(page.locator('#page-tasks')).toContainText(taskName);
  await expect(page.locator('#page-tasks')).toContainText('Playwright');
});

test('settings safety panels are present', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /設置|Settings/ }).click();

  await expect(page.locator('#settings-db-section')).toBeVisible();
  await expect(page.locator('#settings-schema-section')).toBeVisible();
  await expect(page.locator('#settings-sync-section')).toBeVisible();
  await expect(page.locator('#settings-write-section')).toBeVisible();
  await expect(page.locator('#settings-audit-section')).toBeVisible();
  await expect(page.locator('#settings-rollback-section')).toBeVisible();
});
