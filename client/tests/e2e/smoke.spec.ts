import { test, expect } from '@playwright/test';

test.describe('Biz Plus Smoke Tests', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    // Check for some text that should be on the landing page
    // Based on App.tsx, the Landing page is at "/"
    await expect(page).toHaveTitle(/Biz Plus|Business Health/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    // Look for login button or heading
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('text=Register')).toBeVisible();
  });

  test('should redirect unauthenticated dashboard access to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
