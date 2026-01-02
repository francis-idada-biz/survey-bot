# Medical Evaluation System - E2E Test Suite

Comprehensive Playwright test suite for the Medical Evaluation System.

## 📋 Test Coverage

### Authentication (`auth.spec.js`)
- ✅ Login/logout flow
- ✅ Invalid credentials handling
- ✅ Password reset flow
- ✅ Protected route redirects

### Navigation (`navigation.spec.js`)
- ✅ Admin navigation menu
- ✅ Role-based link visibility
- ✅ Breadcrumb navigation
- ✅ Protected vs public routes
- ✅ 404 handling

### User Invitation (`invitation.spec.js`)
- ✅ Invite form display
- ✅ Role selection (student/evaluator)
- ✅ Email validation
- ✅ Successful invitation sending
- ✅ Duplicate email handling

### User Management (`user-management.spec.js`)
- ✅ User list display
- ✅ Create admin flow
- ✅ User deletion (with confirmation)
- ✅ Profile viewing
- ✅ Form validation

### Evaluation Workflow (`evaluation.spec.js`)
- ⚠️ Start evaluation (evaluator)
- ⚠️ Student selection
- ⚠️ Chat interface
- ⚠️ Message sending/receiving
- ⚠️ Summary generation
- ⚠️ Student dashboard view

⚠️ = Tests are skipped by default (require test account setup)

## 🚀 Installation

### 1. Navigate to your frontend directory
\`\`\`bash
cd med-eval-frontend
\`\`\`

### 2. Install Playwright
\`\`\`bash
npm init playwright@latest
# When prompted:
# - Choose TypeScript or JavaScript (your choice)
# - Where to put tests: tests
# - Add GitHub Actions: Yes (optional)
# - Install browsers: Yes
\`\`\`

### 3. Copy test files
Copy all the test files from this folder into your `med-eval-frontend/tests/` directory:
- `auth.spec.js`
- `navigation.spec.js`
- `invitation.spec.js`
- `user-management.spec.js`
- `evaluation.spec.js`

Or use this command from the artifacts folder:
\`\`\`bash
cp tests/*.spec.js /path/to/med-eval-frontend/tests/
\`\`\`

### 4. Update playwright.config.js
Make sure your `playwright.config.js` has the correct FRONTEND_URL:
\`\`\`javascript
use: {
  baseURL: process.env.FRONTEND_URL || 'https://survey-bot-flame.vercel.app',
}
\`\`\`

## 🧪 Running Tests

### Run all tests
\`\`\`bash
npx playwright test
\`\`\`

### Run specific test file
\`\`\`bash
npx playwright test auth.spec.js
npx playwright test navigation.spec.js
npx playwright test invitation.spec.js
\`\`\`

### Run tests with UI (interactive mode)
\`\`\`bash
npx playwright test --ui
\`\`\`

### Run tests in headed mode (see browser)
\`\`\`bash
npx playwright test --headed
\`\`\`

### Run tests in specific browser
\`\`\`bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
\`\`\`

### Debug a test
\`\`\`bash
npx playwright test auth.spec.js --debug
\`\`\`

### View test report
\`\`\`bash
npx playwright show-report
\`\`\`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in your frontend directory:
\`\`\`env
FRONTEND_URL=https://survey-bot-flame.vercel.app
\`\`\`

### Test Credentials
The tests use these default credentials (defined in each test file):
\`\`\`javascript
ADMIN_EMAIL = 'admin@test.com'
ADMIN_PASSWORD = 'Admin123!'
\`\`\`

**Important:** Make sure this admin user exists in your database!

## 📝 Enabling Skipped Tests

The evaluation tests are currently skipped because they require:
1. Evaluator account credentials
2. Student account credentials
3. Existing evaluation data

To enable them:

### 1. Create test accounts in your database
\`\`\`sql
-- Create evaluator
INSERT INTO users (email, password_hash, name, role)
VALUES ('evaluator@test.com', '<bcrypt_hash>', 'Test Evaluator', 'evaluator');

-- Create student
INSERT INTO users (email, password_hash, name, role)
VALUES ('student@test.com', '<bcrypt_hash>', 'Test Student', 'student');
\`\`\`

### 2. Update credentials in evaluation.spec.js
Replace placeholder credentials with actual ones:
\`\`\`javascript
await page.fill('input[type="email"]', 'evaluator@test.com');
await page.fill('input[type="password"]', 'YourActualPassword');
\`\`\`

### 3. Remove .skip()
Change `test.skip(` to `test(` for tests you want to run.

## 🎯 Test Organization

\`\`\`
tests/
├── auth.spec.js           # Authentication flows
├── navigation.spec.js     # Routing and navigation
├── invitation.spec.js     # User invitation system
├── user-management.spec.js # Admin user management
└── evaluation.spec.js     # Evaluation workflow (mostly skipped)
\`\`\`

## 📊 Continuous Integration

The tests can run automatically on GitHub Actions. Example workflow:

\`\`\`.github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd med-eval-frontend
          npm install
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run Playwright tests
        run: npx playwright test
        env:
          FRONTEND_URL: https://survey-bot-flame.vercel.app
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
\`\`\`

## 🐛 Troubleshooting

### Tests failing with "element not found"
- Increase timeout in specific tests
- Check if selectors match your actual UI
- Run with `--headed` to see what's happening

### Tests timing out
- Check if backend is responding
- Verify FRONTEND_URL is correct
- Increase test timeout in playwright.config.js

### Authentication failing
- Verify admin user exists in database
- Check password hash is correct
- Test login manually first

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Runner](https://playwright.dev/docs/test-runners)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Best Practices](https://playwright.dev/docs/best-practices)

## ✅ Quick Start Checklist

- [ ] Install Playwright in frontend directory
- [ ] Copy test files to `tests/` folder
- [ ] Verify admin user exists with correct credentials
- [ ] Run `npx playwright test auth.spec.js` to verify setup
- [ ] Check test report with `npx playwright show-report`
- [ ] (Optional) Enable evaluation tests with test accounts
- [ ] (Optional) Set up GitHub Actions for CI/CD
