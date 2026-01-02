import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://survey-bot-flame.vercel.app';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'Admin123!';

// Helper function to login
async function login(page) {
  await page.goto(FRONTEND_URL);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/profile|\/$/);
}

test.describe('Navigation - Admin User', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to profile from header', async ({ page }) => {
    // Click on app title/logo
    await page.click('text=Medical Evaluation System');
    
    // Should go to profile
    await page.waitForURL(/\/profile/);
    await expect(page.locator('text=System Admin')).toBeVisible({ timeout: 5000 });
  });

  test('should show admin-specific navigation links', async ({ page }) => {
    // Admin should see "Invite User" link
    await expect(page.locator('text=Invite User')).toBeVisible();
    
    // Should show user email and role
    await expect(page.locator(`text=${ADMIN_EMAIL}`)).toBeVisible();
    await expect(page.locator('text=(admin)')).toBeVisible();
  });

  test('should navigate to invite page', async ({ page }) => {
    await page.click('text=Invite User');
    
    await page.waitForURL(`${FRONTEND_URL}/invite`);
    await expect(page.locator('text=Invite User')).toBeVisible();
    await expect(page.locator('select')).toBeVisible(); // Role selector
  });

  test('should display profile information', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/profile`);
    
    // Should show user details
    await expect(page.locator(`text=${ADMIN_EMAIL}`)).toBeVisible();
    await expect(page.locator('text=System Admin')).toBeVisible();
    await expect(page.locator('text=/Role.*admin/i')).toBeVisible();
  });

  test('should handle 404 for invalid routes', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/non-existent-route`);
    
    // Should either show 404 or redirect to dashboard
    const url = page.url();
    expect(url).toMatch(/404|login|profile|\/$/)
  });
});

test.describe('Breadcrumb Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show breadcrumbs on user management page', async ({ page }) => {
    // Navigate to user management (if power_user/admin has access)
    // This test might need adjustment based on actual role permissions
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Check for breadcrumbs or navigation indicators
    const hasBreadcrumbs = await page.locator('nav').count() > 0;
    expect(hasBreadcrumbs).toBeTruthy();
  });
});

test.describe('Protected Routes', () => {
  test('should block access to admin routes when logged out', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/invite`);
    
    // Should redirect to login
    await page.waitForURL(`${FRONTEND_URL}/login`);
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should block access to user management when logged out', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Should redirect to login
    await page.waitForURL(`${FRONTEND_URL}/login`);
  });

  test('should block access to evaluation routes when logged out', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/start-evaluation`);
    
    // Should redirect to login
    await page.waitForURL(`${FRONTEND_URL}/login`);
  });
});

test.describe('Public Routes Access', () => {
  test('should access login page without authentication', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should access password reset page without authentication', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/request-password-reset`);
    await expect(page.locator('text=/Reset.*Password/i')).toBeVisible();
  });
});
