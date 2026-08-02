import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the buyer-facing auth flow.
 *
 * The Laravel app is served by `e2e/server.sh`, which boots an isolated
 * SQLite database (never the development/production MySQL connection) and
 * compiles the frontend assets. No backend code changes are required.
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['list']],
    use: {
        baseURL: 'http://127.0.0.1:8000',
        testIdAttribute: 'data-test',
        trace: 'on-first-retry',
        locale: 'id-ID',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'bash e2e/server.sh',
        url: 'http://127.0.0.1:8000/login',
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
    },
});
