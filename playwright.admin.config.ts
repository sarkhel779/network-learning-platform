import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "admin-live.spec.ts",
  fullyParallel: false,
  use: { baseURL, trace: "on-first-retry" },
  webServer: {
    command: `"${process.execPath}" node_modules/next/dist/bin/next dev -p 3000`,
    url: baseURL,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      PLAYWRIGHT_TEST_SESSION: "0",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
