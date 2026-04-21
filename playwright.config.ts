/**
 * Root Playwright Configuration
 *
 * Delegates to the full test configuration in the Playwright submodule:
 *   Tests/AngularNetTutorial-Playwright/
 *
 * Running `npx playwright test` from the repo root uses this config,
 * which points testDir at the submodule's tests/ folder and imports
 * all shared settings (timeouts, viewports, reporters, projects) from
 * the submodule config.
 *
 * To run from the submodule directly (recommended for development):
 *   cd Tests/AngularNetTutorial-Playwright
 *   npx playwright test
 *
 * To run from the repo root (CI / convenience):
 *   npx playwright test
 *   npx playwright test --project=screenshots
 *   npx playwright test --project=smoke
 */

import { defineConfig, devices } from '@playwright/test';
import { APP_URLS, TIMEOUTS, VIEWPORTS } from './Tests/AngularNetTutorial-Playwright/config/test-config';

export default defineConfig({
  /* Point at the submodule's test folder */
  testDir: './Tests/AngularNetTutorial-Playwright/tests',

  timeout: TIMEOUTS.standard,
  expect: {
    timeout: TIMEOUTS.short,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'Tests/AngularNetTutorial-Playwright/playwright-report', open: 'never' }],
    ['json', { outputFile: 'Tests/AngularNetTutorial-Playwright/test-results/results.json' }],
    ['junit', { outputFile: 'Tests/AngularNetTutorial-Playwright/test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: APP_URLS.angular,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: VIEWPORTS.laptop,
    ignoreHTTPSErrors: true,
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Smoke Tests — critical path only (used in CI)
    {
      name: 'smoke',
      testMatch: /.*smoke\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: VIEWPORTS.laptop,
      },
      dependencies: ['setup'],
    },

    // E2E Browser Tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: VIEWPORTS.laptop,
        launchOptions: {
          args: ['--enable-precise-memory-info', '--disable-animations'],
        },
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: VIEWPORTS.laptop,
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: VIEWPORTS.laptop,
      },
      dependencies: ['setup'],
    },

    // API Integration Tests
    {
      name: 'api',
      testMatch: /Tests\/AngularNetTutorial-Playwright\/tests\/api\/.*\.spec\.ts/,
      testIgnore: [
        /tests\/api\/auth-api\.spec\.ts/,
        /tests\/api\/cache-api\.spec\.ts/,
        /tests\/api\/departments-api\.spec\.ts/,
        /tests\/api\/employees-api\.spec\.ts/,
      ],
      use: {
        baseURL: APP_URLS.api,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },

    // Blog Screenshots — captures key UI states for blog posts and documentation
    {
      name: 'screenshots',
      testMatch: /Tests\/AngularNetTutorial-Playwright\/tests\/screenshots\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: VIEWPORTS.laptop,
        video: 'off',
        screenshot: 'off',
        launchOptions: {
          slowMo: 150,
        },
      },
    },
  ],
});
