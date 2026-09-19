import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("site favicon", () => {
  it("uses an accessible PacketSecrets network mark instead of the default browser icon", async () => {
    const icon = await readFile(path.join(process.cwd(), "src/app/icon.svg"), "utf8");

    expect(icon).toContain('aria-label="PacketSecrets logo"');
    expect(icon).toContain('viewBox="0 0 64 64"');
    expect(icon).toContain("#2dd4bf");
    expect(icon).toContain("<circle");
    expect(icon).toContain("<path");
  });
});
