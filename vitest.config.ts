import { realpathSync } from "node:fs";

import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  root: realpathSync(process.cwd()),
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    passWithNoTests: true,
    setupFiles: ["@testing-library/jest-dom/vitest"],
  },
});
