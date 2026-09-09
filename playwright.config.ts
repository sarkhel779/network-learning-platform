import { defineConfig, devices } from "@playwright/test";

const testBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const testPort = new URL(testBaseUrl).port || "3000";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",
  use: {
    baseURL: testBaseUrl,
    trace: "on-first-retry",
  },
  webServer: {
    command: `"${process.execPath}" node_modules/next/dist/bin/next dev -p ${testPort}`,
    env: {
      NODE_ENV: "test",
      PLAYWRIGHT_TEST_SESSION: "1",
      PACKETSECRETS_TEST_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://playwright.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "playwright-public-key",
    },
    url: testBaseUrl,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
  ],
});
