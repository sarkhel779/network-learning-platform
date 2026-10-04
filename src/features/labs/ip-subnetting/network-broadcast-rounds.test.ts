import { describe, expect, it } from "vitest";

import { networkBroadcastRounds } from "./network-broadcast-rounds";

function toInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function toIp(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

function networkAndBroadcast(ipWithPrefix: string): { network: string; broadcast: string } {
  const [ip, prefixText] = ipWithPrefix.split("/");
  const prefix = Number(prefixText);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const ipInt = toInt(ip);
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  return { network: toIp(network), broadcast: toIp(broadcast) };
}

describe("network & broadcast round math", () => {
  it("has a correct option that matches the actual network and broadcast address for each address/prefix in the prompt", () => {
    for (const round of networkBroadcastRounds) {
      const match = round.prompt.match(/(\d+\.\d+\.\d+\.\d+)\/(\d+)/);
      expect(match).not.toBeNull();
      const { network, broadcast } = networkAndBroadcast(`${match![1]}/${match![2]}`);

      const correctOption = round.options.find((option) => option.id === round.correctId);
      expect(correctOption).toBeDefined();
      expect(correctOption!.label).toContain(`Network ${network}`);
      expect(correctOption!.label).toContain(`Broadcast ${broadcast}`);
    }
  });

  it("gives every round exactly one option matching the computed answer", () => {
    for (const round of networkBroadcastRounds) {
      const match = round.prompt.match(/(\d+\.\d+\.\d+\.\d+)\/(\d+)/);
      const { network, broadcast } = networkAndBroadcast(`${match![1]}/${match![2]}`);
      const matchingOptions = round.options.filter((option) => option.label.includes(`Network ${network}`) && option.label.includes(`Broadcast ${broadcast}`));
      expect(matchingOptions).toHaveLength(1);
      expect(matchingOptions[0].id).toBe(round.correctId);
    }
  });
});
