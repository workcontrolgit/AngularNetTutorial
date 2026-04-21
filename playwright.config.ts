/**
 * Root Playwright Configuration
 *
 * Delegates to the Playwright submodule test suite at:
 *   Tests/AngularNetTutorial-Playwright/tests/
 *
 * NOTE: Values are inlined here (not imported from the submodule) to avoid a
 * dual-instance Playwright conflict. The root node_modules and the submodule
 * node_modules contain different Playwright versions; cross-importing between
 * them causes a runtime crash. Keep values in sync with:
 *   Tests/AngularNetTutorial-Playwright/config/test-config.ts
 *
 * Prefer running from the submodule for development:
 *   cd Tests/AngularNetTutorial-Playwright && npx playwright test
 *
 * Running from the repo root (CI / convenience):
 *   npx playwright test
 *   npx playwright test --project=screenshots
 *   npx playwright test --project=smoke
 */

import { defineConfig, devices } from '@playwright/test';

const ANGULAR_URL       = process.env.ANGULAR_APP_URL       || 'http://localhost:4200';
const API_URL           = process.env.API_APP_URL            || 'https://localhost:44378/api/v1';
const IDENTITY_URL      = process.env.IDENTITY_SERVER_URL    || 'https://localhost:44310';

const TESTS_DIR = './Tests/AngularNetTutorial-Playwright/tests';
const REPORT_DIR = './Tests/AngularNetTutorial-Playwright/playwright-report';
const RESULTS_DIR = './Tests/AngularNetTutorial-Playwright/test-results';

export default defineConfig({
  testDir: TESTS_DIR,

  timeout: 30000,
  expect: { timeout: 5000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: REPORT_DIR, open: 'never' }],
    ['json', { outputFile: `${RESULTS_DIR}/results.json` }],
    ['junit', { outputFile: `${RESULTS_DIR}/junit.xml` }],
    ['list'],
  ],

  use: {
    baseURL: ANGULAR_URL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Smoke — critical path only (CI)
    {
      name: 'smoke',
      testMatch: /.*smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
      dependencies: ['setup'],
    },

    // E2E — Chromium
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        launchOptions: {
          args: ['--enable-precise-memory-info', '--disable-animations'],
        },
      },
      dependencies: ['setup'],
    },

    // E2E — Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1366, height: 768 } },
      dependencies: ['setup'],
    },

    // E2E — WebKit
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1366, height: 768 } },
      dependencies: ['setup'],
    },

    // API Integration Tests
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      testIgnore: [
        /tests\/api\/auth-api\.spec\.ts/,
        /tests\/api\/cache-api\.spec\.ts/,
        /tests\/api\/departments-api\.spec\.ts/,
        /tests\/api\/employees-api\.spec\.ts/,
      ],
      use: {
        baseURL: API_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },

    // Blog Screenshots — captures key UI states for blog posts and documentation
    // video: 'on' records the browser session as a .webm file per test.
    // Run scripts/build-video.ps1 after the test to combine the PNG+WAV pairs
    // into a single narrated MP4 slideshow (requires FFmpeg on PATH).
    {
      name: 'screenshots',
      testMatch: /tests\/screenshots\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        video: 'on',
        screenshot: 'off',
        launchOptions: { slowMo: 150 },
      },
    },
  ],
});
