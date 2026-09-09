import { describe, expect, it } from "vitest";

import { classifyIpv4Address, describePrefix } from "./ipv4-addressing";

describe("IPv4 addressing model", () => {
  it.each([
    ["10.20.30.40", "private"],
    ["127.0.0.1", "loopback"],
    ["169.254.9.2", "link-local"],
    ["192.0.2.15", "documentation"],
    ["8.8.8.8", "public"],
  ] as const)("classifies %s as %s", (address, expected) => {
    expect(classifyIpv4Address(address)).toBe(expected);
  });

  it("separates the network and host portions of a /24 address", () => {
    expect(describePrefix("192.0.2.44", 24)).toEqual({
      networkAddress: "192.0.2.0",
      broadcastAddress: "192.0.2.255",
      networkBits: 24,
      hostBits: 8,
    });
  });
});
