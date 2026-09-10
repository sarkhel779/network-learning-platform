import { realpathSync } from "node:fs";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  root: realpathSync(process.cwd()),
  resolve: {
    alias: { "@": resolve(process.cwd(), "src") },
    preserveSymlinks: true,
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "**/.pnpm-store/**", "**/.worktrees/**", "**/work/**", "tests/e2e/**"],
    passWithNoTests: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
