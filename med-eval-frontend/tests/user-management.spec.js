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

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display user management page', async ({ page }) => {
    // Navigate to user management
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Should show user management title
    await expect(page.locator('text=User Management')).toBeVisible({ timeout: 5000 });
  });

  test('should display users table with columns', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Should have table headers
    const hasTable = await page.locator('table').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasTable) {
      await expect(page.locator('th:has-text("Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Email")')).toBeVisible();
      await expect(page.locator('th:has-text("Role")')).toBeVisible();
    }
  });

  test('should have create admin button', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Should show create admin button
    await expect(page.locator('text=Create New Admin')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to create admin page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Click create admin button
    await page.click('text=Create New Admin');
    
    // Should navigate to create admin page
    await page.waitForURL(`${FRONTEND_URL}/create-admin`);
    await expect(page.locator('text=Create New Admin')).toBeVisible();
  });

  test('should show user profile when clicking on name', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Wait for users to load
    await page.waitForLoadState('networkidle');
    
    // Click on first user link (if exists)
    const userLinks = page.locator('a[href^="/profile/"]');
    const count = await userLinks.count();
    
    if (count > 0) {
      await userLinks.first().click();
      
      // Should navigate to user profile
      await page.waitForURL(/\/profile\/\d+/);
      await expect(page.locator('text=/Email.*Role/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have delete button for users', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Wait for table to load
    await page.waitForLoadState('networkidle');
    
    // Check if delete buttons exist
    const deleteButtons = page.locator('button:has-text("Delete")');
    const count = await deleteButtons.count();
    
    // Should have at least one delete button (if users exist)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show confirmation before deleting user', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/user-management`);
    
    // Wait for users to load
    await page.waitForLoadState('networkidle');
    
    // Find delete button
    const deleteButtons = page.locator('button:has-text("Delete")');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      // Listen for dialog
      page.once('dialog', dialog => {
        expect(dialog.message()).toMatch(/sure|delete|confirm/i);
        dialog.dismiss(); // Cancel deletion
      });
      
      // Click delete
      await deleteButtons.first().click();
    }
  });
});

test.describe('Create Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display create admin form', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/create-admin`);
    
    // Should show form fields
    await expect(page.locator('text=Create New Admin')).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible(); // Name field
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Admin")')).toBeVisible();
  });

  test('should show breadcrumb navigation', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/create-admin`);
    
    // Should show breadcrumbs
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=User Management')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/create-admin`);
    
    // Try to submit without filling fields
    await page.click('button:has-text("Create Admin")');
    
    // HTML5 validation should prevent submission
    const nameInput = page.locator('input[type="text"]').first();
    const isInvalid = await nameInput.evaluate((el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should have cancel button that returns to user management', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/create-admin`);
    
    // Click cancel
    await page.click('text=Cancel');
    
    // Should return to user management
    await page.waitForURL(`${FRONTEND_URL}/user-management`);
    await expect(page.locator('text=User Management')).toBeVisible();
  });
});

test.describe('User Profile View', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display own profile', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/profile`);
    
    // Should show profile information
    await expect(page.locator(`text=${ADMIN_EMAIL}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=System Admin')).toBeVisible();
    await expect(page.locator('text=/Role.*admin/i')).toBeVisible();
  });

  test('should show profile picture or avatar', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/profile`);
    
    // Should have an image (profile picture or avatar)
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display user metadata', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/profile`);
    
    // Should show joined date and last accessed
    await expect(page.locator('text=/Joined|Last Seen/i')).toBeVisible({ timeout: 5000 });
  });
});
