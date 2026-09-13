import { describe, expect, it } from "vitest";

import { buildTcpWindowJourney } from "./tcp-window-model";

describe("TCP sliding window journey", () => {
  it("keeps byte ranges and cumulative ACK arithmetic consistent", () => {
    const steps = buildTcpWindowJourney("normal");
    expect(steps.find((step) => step.id === "first-ack")?.cumulativeAck).toBe(1101);
    for (const step of steps) {
      expect(step.sendLeft).toBeLessThanOrEqual(step.nextToSend);
      expect(step.nextToSend).toBeLessThanOrEqual(step.sendRight);
    }
  });

  it("shows SACK's right-exclusive block edges before fast retransmit", () => {
    const steps = buildTcpWindowJourney("fast-retransmit");
    expect(steps.find((step) => step.id === "out-of-order")?.sackBlocks).toEqual([{ left: 1201, right: 1401 }]);
    expect(steps.filter((step) => step.packet.includes("duplicate ACK")).map((step) => step.duplicateAcks)).toEqual([1, 2, 3]);
    expect(steps.find((step) => step.id === "first-duplicate-ack")?.sackBlocks).toEqual([{ left: 1201, right: 1301 }]);
    expect(steps.find((step) => step.id === "third-duplicate-ack")?.duplicateAcks).toBe(3);
    expect(steps.findIndex((step) => step.id === "third-duplicate-ack"))
      .toBeLessThan(steps.findIndex((step) => step.id === "fast-retransmit"));
    expect(steps.find((step) => step.id === "repaired-ack")?.cumulativeAck).toBe(1501);
  });

  it("keeps timeout recovery distinct from fast retransmit", () => {
    const steps = buildTcpWindowJourney("timeout");
    expect(steps.some((step) => step.id === "fast-retransmit")).toBe(false);
    expect(steps.find((step) => step.id === "timeout-retransmit")?.duplicateAcks).toBe(0);
  });
});
