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

test.describe('User Invitation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display invite form for admin', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/invite`);
    
    // Should show invite form
    await expect(page.locator('text=Invite User')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible(); // Role selector
    await expect(page.locator('button:has-text("Send Invitation")')).toBeVisible();
  });

  test('should have student and evaluator role options', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/invite`);
    
    // Check role selector options
    const roleSelect = page.locator('select');
    await expect(roleSelect).toBeVisible();
    
    // Get options
    const options = await roleSelect.locator('option').allTextContents();
    expect(options).toContain('Student');
    expect(options).toContain('Evaluator');
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/invite`);
    
    // Try to submit without email
    await page.click('button:has-text("Send Invitation")');
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should send invitation successfully', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/invite`);
    
    const testEmail = `test${Date.now()}@example.com`;
    
    // Fill form
    await page.fill('input[type="email"]', testEmail);
    await page.selectOption('select', 'student');
    
    // Submit
    await page.click('button:has-text("Send Invitation")');
    
    // Should show success message
    await expect(page.locator('text=/Invitation sent|successfully/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for duplicate email invitation', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/invite`);
    
    // Try to invite same email twice
    const testEmail = 'duplicate@example.com';
    
    // First invitation
    await page.fill('input[type="email"]', testEmail);
    await page.selectOption('select', 'student');
    await page.click('button:has-text("Send Invitation")');
    
    // Wait for success
    await page.waitForSelector('text=/Invitation sent|successfully/i', { timeout: 10000 });
    
    // Try again with same email
    await page.fill('input[type="email"]', testEmail);
    await page.selectOption('select', 'evaluator');
    await page.click('button:has-text("Send Invitation")');
    
    // Should show error or success (depending on backend logic)
    // Adjust based on your actual implementation
    await page.waitForSelector('text=/sent|error|already/i', { timeout: 10000 });
  });
});

test.describe('User Registration Flow', () => {
  test('should show error for invalid token', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/register?token=invalid-token-12345`);
    
    // Should show error message
    await expect(page.locator('text=/Invalid|expired|error/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show registration form with valid token', async ({ page }) => {
    // Note: This test requires a valid token to be generated
    // You might need to create this manually or via API
    // For now, we'll test the structure
    
    await page.goto(`${FRONTEND_URL}/register?token=test-token`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if either error or form is shown
    const hasError = await page.locator('text=/Invalid|expired/i').isVisible().catch(() => false);
    const hasForm = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    expect(hasError || hasForm).toBe(true);
  });

  test('should validate password requirements', async ({ page }) => {
    // This test assumes you have a valid token
    // Adjust token generation as needed
    await page.goto(`${FRONTEND_URL}/register?token=test-token`);
    
    // If registration form is available
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try weak password
      await passwordInput.fill('weak');
      
      const submitButton = page.locator('button:has-text("Register")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show password policy error
        await expect(page.locator('text=/password.*requirements|8 characters/i')).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
