import { describe, expect, it } from "vitest";
import { isProgressTestAdapterEnabled } from "./progress-test-adapter";

describe("progress test adapter guard", () => {
  it.each([undefined, "staging", "production"])("rejects NODE_ENV=%s", (NODE_ENV) => {
    expect(isProgressTestAdapterEnabled({ NODE_ENV, PLAYWRIGHT_TEST_SESSION: "1", PACKETSECRETS_TEST_ENV: "test" })).toBe(false);
  });
  it("requires both exact test guards", () => {
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "test", PLAYWRIGHT_TEST_SESSION: "1", PACKETSECRETS_TEST_ENV: "test" })).toBe(true);
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "development", PLAYWRIGHT_TEST_SESSION: "1", PACKETSECRETS_TEST_ENV: "test" })).toBe(true);
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "test", PLAYWRIGHT_TEST_SESSION: "true", PACKETSECRETS_TEST_ENV: "test" })).toBe(false);
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "development", PLAYWRIGHT_TEST_SESSION: "1" })).toBe(false);
  });
});
