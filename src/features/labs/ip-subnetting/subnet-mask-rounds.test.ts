import { describe, expect, it } from "vitest";

import { subnetMaskRounds } from "./subnet-mask-rounds";

function usableHosts(prefix: number): number {
  return 2 ** (32 - prefix) - 2;
}

describe("subnet mask round math", () => {
  it("round 1: /26 is the smallest mask that fits 50 usable hosts", () => {
    expect(usableHosts(26)).toBe(62);
    expect(usableHosts(27)).toBe(30);
    expect(usableHosts(27)).toBeLessThan(50);
    expect(usableHosts(26)).toBeGreaterThanOrEqual(50);
    expect(subnetMaskRounds[0].correctId).toBe("26");
  });

  it("round 2: /28 is the smallest mask that fits 10 usable hosts", () => {
    expect(usableHosts(29)).toBe(6);
    expect(usableHosts(28)).toBe(14);
    expect(usableHosts(29)).toBeLessThan(10);
    expect(usableHosts(28)).toBeGreaterThanOrEqual(10);
    expect(subnetMaskRounds[1].correctId).toBe("28");
  });

  it("round 3: /30 provides exactly 2 usable addresses for a point-to-point link", () => {
    expect(usableHosts(30)).toBe(2);
    expect(subnetMaskRounds[2].correctId).toBe("ptp");
  });

  it("round 4: borrowing 2 bits from a /24 yields 4 subnets of 62 usable hosts each", () => {
    const subnetsFromBorrowedBits = 2 ** (26 - 24);
    expect(subnetsFromBorrowedBits).toBe(4);
    expect(usableHosts(26)).toBe(62);
    expect(usableHosts(26)).toBeGreaterThanOrEqual(50);
    expect(subnetMaskRounds[3].correctId).toBe("26");
  });

  it("gives every round a correct option that is present among its choices", () => {
    for (const round of subnetMaskRounds) {
      expect(round.options.some((option) => option.id === round.correctId)).toBe(true);
    }
  });
});
