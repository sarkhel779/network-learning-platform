import { realpathSync } from "node:fs";

import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  root: realpathSync(process.cwd()),
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    passWithNoTests: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
