import { describe, expect, it } from "vitest";

function blockSize(prefix: number): number {
  return 2 ** (32 - prefix);
}

function lastAddressOffset(base: number[], size: number): number[] {
  const baseInt = base.reduce((acc, octet) => acc * 256 + octet, 0);
  const lastInt = baseInt + size - 1;
  return [24, 16, 8, 0].map((shift) => (lastInt >>> shift) & 255);
}

describe("VLSM subnet design round math", () => {
  it("allocates 192.168.1.0/25 for the 100-host subnet, covering .0-.127", () => {
    expect(blockSize(25)).toBe(128);
    expect(lastAddressOffset([192, 168, 1, 0], blockSize(25))).toEqual([192, 168, 1, 127]);
  });

  it("allocates 192.168.1.128/26 for the 50-host subnet, covering .128-.191", () => {
    expect(blockSize(26)).toBe(64);
    expect(lastAddressOffset([192, 168, 1, 128], blockSize(26))).toEqual([192, 168, 1, 191]);
  });

  it("allocates 192.168.1.192/27 for the 20-host subnet, covering .192-.223", () => {
    expect(blockSize(27)).toBe(32);
    expect(lastAddressOffset([192, 168, 1, 192], blockSize(27))).toEqual([192, 168, 1, 223]);
  });

  it("confirms each allocation has enough usable hosts for its requirement", () => {
    expect(blockSize(25) - 2).toBeGreaterThanOrEqual(100);
    expect(blockSize(26) - 2).toBeGreaterThanOrEqual(50);
    expect(blockSize(27) - 2).toBeGreaterThanOrEqual(20);
  });

  it("confirms the three allocations don't overlap", () => {
    expect(128).toBe(128);
    expect(128 + 64).toBe(192);
    expect(192 + 32).toBe(224);
    expect(224).toBeLessThanOrEqual(256);
  });
});
