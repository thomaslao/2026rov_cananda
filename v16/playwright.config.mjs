import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.V16_BASE_URL || 'http://127.0.0.1:8016';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  workers: 1,
  webServer: process.env.V16_BASE_URL ? undefined : {
    command: 'node serve.mjs',
    url: `${baseURL}/healthz`,
    reuseExistingServer: true,
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    },
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
