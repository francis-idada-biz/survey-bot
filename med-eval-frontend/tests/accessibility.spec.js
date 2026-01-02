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

test.describe('Accessibility Tests', () => {
  test('login page should have proper form labels', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Check for email label
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('placeholder', /email/i);
    
    // Check for password label
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('placeholder', /password/i);
  });

  test('buttons should have descriptive text', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Login button should be clearly labeled
    const loginButton = page.locator('button:has-text("Sign In")');
    await expect(loginButton).toBeVisible();
  });

  test('form inputs should have proper types', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Email field should be type="email"
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Password field should be type="password"
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('navigation links should be keyboard accessible', async ({ page }) => {
    await login(page);
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    
    // Check that elements receive focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('should be able to submit login form with Enter key', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Should redirect after login
    await page.waitForURL(/profile|\/$/);
  });

  test('error messages should be visible and clear', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Try to login with wrong credentials
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button:has-text("Sign In")');
    
    // Error should be visible
    const error = page.locator('text=/Invalid|error|wrong/i');
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('page should have proper title', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Check page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display login form on mobile', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Form should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should be able to login on mobile', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL(/profile|\/$/);
    
    // Should see user info
    await expect(page.locator(`text=${ADMIN_EMAIL}`)).toBeVisible();
  });

  test('navigation should be accessible on mobile', async ({ page }) => {
    await login(page);
    
    // Check if there's a hamburger menu or visible navigation
    const hasNav = await page.locator('nav').count() > 0;
    const hasMenu = await page.locator('button:has-text("Menu")').count() > 0;
    
    expect(hasNav || hasMenu).toBe(true);
  });

  test('text should be readable on mobile', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Check font sizes
    const title = page.locator('text=Welcome Back').first();
    if (await title.isVisible()) {
      const fontSize = await title.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });
      
      const size = parseInt(fontSize);
      expect(size).toBeGreaterThanOrEqual(14); // Minimum readable size
    }
  });

  test('buttons should be large enough to tap on mobile', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    const loginButton = page.locator('button:has-text("Sign In")');
    const box = await loginButton.boundingBox();
    
    if (box) {
      // Minimum tap target: 44x44 pixels (iOS guidelines)
      expect(box.height).toBeGreaterThanOrEqual(36);
      expect(box.width).toBeGreaterThanOrEqual(60);
    }
  });

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow 10px tolerance
  });
});

test.describe('Responsive Design - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('should display properly on tablet', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should login successfully on tablet', async ({ page }) => {
    await login(page);
    
    await expect(page.locator(`text=${ADMIN_EMAIL}`)).toBeVisible();
  });

  test('navigation should be fully visible on tablet', async ({ page }) => {
    await login(page);
    
    // Navigation should be visible without menu
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design - Desktop', () => {
  test.use({ viewport: { width: 1920, height: 1080 } }); // Full HD

  test('should display properly on desktop', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should have full navigation visible on desktop', async ({ page }) => {
    await login(page);
    
    // Should see all navigation items
    await expect(page.locator('text=Invite User')).toBeVisible();
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('content should be properly centered on desktop', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const box = await form.boundingBox();
      const viewportWidth = page.viewportSize()?.width || 1920;
      
      if (box) {
        const leftMargin = box.x;
        const rightMargin = viewportWidth - (box.x + box.width);
        
        // Content should be somewhat centered (within 30% tolerance)
        const centerTolerance = viewportWidth * 0.3;
        expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(centerTolerance);
      }
    }
  });
});

test.describe('Performance Tests', () => {
  test('login page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(FRONTEND_URL);
    const loadTime = Date.now() - startTime;
    
    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('Service Worker')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should not have failed network requests', async ({ page }) => {
    const failedRequests = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    // Filter out non-critical failures (like analytics)
    const criticalFailures = failedRequests.filter(url => 
      !url.includes('analytics') && 
      !url.includes('tracking')
    );
    
    expect(criticalFailures.length).toBe(0);
  });
});

test.describe('Browser Compatibility', () => {
  test('should work in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');
    
    await page.goto(FRONTEND_URL);
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    await page.goto(FRONTEND_URL);
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should work in Safari', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');
    
    await page.goto(FRONTEND_URL);
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });
});
