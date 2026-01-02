import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://survey-bot-flame.vercel.app';

// Note: These tests assume you have evaluator and student accounts set up
// You may need to adjust credentials or create test accounts

test.describe('Evaluation Flow - Evaluator', () => {
  test.skip('should show start evaluation button for evaluator', async ({ page }) => {
    // Skip if you don't have evaluator account
    // Replace with actual evaluator credentials
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL(/\/$/);
    
    // Should see start evaluation button
    await expect(page.locator('text=Start New Evaluation')).toBeVisible({ timeout: 5000 });
  });

  test.skip('should navigate to student selection page', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    // Click start evaluation
    await page.click('text=Start New Evaluation');
    
    // Should navigate to start evaluation page
    await page.waitForURL(`${FRONTEND_URL}/start-evaluation`);
    await expect(page.locator('text=Start Evaluation')).toBeVisible();
    await expect(page.locator('select')).toBeVisible(); // Student selector
  });

  test.skip('should display list of students to evaluate', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto(`${FRONTEND_URL}/start-evaluation`);
    
    // Should have student dropdown with options
    const studentSelect = page.locator('select');
    await expect(studentSelect).toBeVisible();
    
    // Should have at least the placeholder option
    const options = await studentSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);
  });

  test.skip('should start evaluation after selecting student', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto(`${FRONTEND_URL}/start-evaluation`);
    
    // Select a student (adjust based on your test data)
    const studentSelect = page.locator('select');
    const options = await studentSelect.locator('option').count();
    
    if (options > 1) { // More than just placeholder
      await studentSelect.selectOption({ index: 1 });
      
      // Click begin evaluation
      await page.click('button:has-text("Begin Evaluation")');
      
      // Should navigate to evaluation chat
      await page.waitForURL(/\/evaluation\/\d+/);
      await expect(page.locator('text=Evaluation Chat')).toBeVisible();
    }
  });

  test.skip('should display chat interface in evaluation', async ({ page }) => {
    // This test requires an active evaluation
    // You may need to create one first
    
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    // Navigate to an evaluation (you'll need a valid ID)
    await page.goto(`${FRONTEND_URL}/evaluation/1`);
    
    // Should show chat interface
    await expect(page.locator('textarea').or(page.locator('input[type="text"]'))).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test.skip('should send and receive messages in evaluation', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto(`${FRONTEND_URL}/evaluation/1`);
    
    // Type a message
    const messageInput = page.locator('textarea').or(page.locator('input[type="text"]')).first();
    await messageInput.fill('This is a test message');
    
    // Send message
    await page.click('button:has-text("Send")');
    
    // Should see the message in chat
    await expect(page.locator('text=This is a test message')).toBeVisible({ timeout: 5000 });
    
    // Should receive AI response (wait up to 10 seconds)
    await page.waitForSelector('text=/./i', { timeout: 10000 }); // Any text response
  });

  test.skip('should have generate summary button', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto(`${FRONTEND_URL}/evaluation/1`);
    
    // Should have generate summary button
    await expect(page.locator('button:has-text("Generate Summary")')).toBeVisible();
  });

  test.skip('should generate and display summary', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto(`${FRONTEND_URL}/evaluation/1`);
    
    // Click generate summary
    await page.click('button:has-text("Generate Summary")');
    
    // Should show loading state
    await expect(page.locator('text=/Generating|Loading/i')).toBeVisible({ timeout: 2000 });
    
    // Should show summary (wait up to 15 seconds for AI)
    await expect(page.locator('text=/Summary|Recommendation/i')).toBeVisible({ timeout: 15000 });
  });

  test.skip('should have save and exit button', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'evaluator@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto(`${FRONTEND_URL}/evaluation/1`);
    
    // Should have save and exit button
    await expect(page.locator('button:has-text("Save and Exit")')).toBeVisible();
  });
});

test.describe('Student Dashboard', () => {
  test.skip('should show evaluations for student', async ({ page }) => {
    // Skip if you don't have student account
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL(/\/$/);
    
    // Should see evaluations title
    await expect(page.locator('text=My Evaluations')).toBeVisible({ timeout: 5000 });
  });

  test.skip('should display completed evaluations', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    // Check for evaluation cards/list
    const hasEvaluations = await page.locator('text=/Completed|In Progress|No evaluations/i').isVisible({ timeout: 5000 });
    expect(hasEvaluations).toBe(true);
  });

  test.skip('should be able to view evaluation summary', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    // Look for view summary button/link
    const viewButtons = page.locator('button:has-text("View Summary")').or(page.locator('text=View Summary'));
    const count = await viewButtons.count();
    
    if (count > 0) {
      await viewButtons.first().click();
      
      // Should show summary content
      await expect(page.locator('text=/Summary|Recommendation|Rating/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test.skip('should not have access to evaluator features', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    
    // Should NOT see start evaluation button
    const hasStartButton = await page.locator('text=Start New Evaluation').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasStartButton).toBe(false);
    
    // Should NOT see invite user link
    const hasInviteLink = await page.locator('text=Invite User').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasInviteLink).toBe(false);
  });
});

// Note about skipped tests:
// The evaluation tests are marked as .skip() because they require:
// 1. Evaluator account credentials
// 2. Student account credentials  
// 3. Existing evaluation data
// 
// To enable these tests:
// 1. Create test accounts in your database
// 2. Update the credentials in each test
// 3. Remove .skip() from the tests
// 4. Adjust selectors if needed based on your actual UI
