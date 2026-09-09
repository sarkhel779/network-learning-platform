import { describe, expect, it } from "vitest";

import {
  analyzeSubnet,
  formatIpv4,
  parseIpv4,
  prefixToMask,
  sameSubnet,
} from "./subnetting";

describe("IPv4 subnet calculations", () => {
  it("parses and formats an IPv4 address without signed integer leakage", () => {
    expect(formatIpv4(parseIpv4("203.0.113.255"))).toBe("203.0.113.255");
  });

  it("rejects malformed IPv4 addresses and invalid prefixes", () => {
    for (const value of ["192.0.2", "192.0.2.256", "192.0.02.1", "hello"])
      expect(() => parseIpv4(value)).toThrow("valid IPv4 address");
    expect(() => prefixToMask(-1)).toThrow("between 0 and 32");
    expect(() => prefixToMask(33)).toThrow("between 0 and 32");
  });

  it("analyzes a non-octet-aligned /26 subnet", () => {
    expect(analyzeSubnet("192.0.2.130", 26)).toMatchObject({
      address: "192.0.2.130",
      prefix: 26,
      mask: "255.255.255.192",
      network: "192.0.2.128",
      firstUsable: "192.0.2.129",
      lastUsable: "192.0.2.190",
      broadcast: "192.0.2.191",
      totalAddresses: 64,
      usableAddresses: 62,
      hostBits: 6,
      interestingOctet: 4,
      blockSize: 64,
      specialCase: "traditional",
    });
  });

  it.each([
    ["203.0.113.9", 0, "0.0.0.0", "255.255.255.255", 4_294_967_296, 4_294_967_294],
    ["203.0.113.9", 8, "203.0.0.0", "203.255.255.255", 16_777_216, 16_777_214],
    ["203.0.113.9", 24, "203.0.113.0", "203.0.113.255", 256, 254],
    ["203.0.113.9", 30, "203.0.113.8", "203.0.113.11", 4, 2],
  ])("derives conventional /%s boundaries", (address, prefix, network, broadcast, total, usable) => {
    expect(analyzeSubnet(address, prefix)).toMatchObject({ network, broadcast, totalAddresses: total, usableAddresses: usable });
  });

  it("handles /31 point-to-point and /32 single-address prefixes", () => {
    expect(analyzeSubnet("192.0.2.10", 31)).toMatchObject({
      network: "192.0.2.10", firstUsable: "192.0.2.10", lastUsable: "192.0.2.11",
      broadcast: null, usableAddresses: 2, specialCase: "point-to-point",
    });
    expect(analyzeSubnet("192.0.2.10", 32)).toMatchObject({
      network: "192.0.2.10", firstUsable: "192.0.2.10", lastUsable: "192.0.2.10",
      broadcast: null, usableAddresses: 1, specialCase: "single-address",
    });
  });

  it("compares complete masked addresses rather than the first three octets", () => {
    expect(sameSubnet("192.0.2.1", "192.0.2.126", 25)).toBe(true);
    expect(sameSubnet("192.0.2.126", "192.0.2.129", 25)).toBe(false);
    expect(sameSubnet("198.51.100.254", "198.51.101.1", 23)).toBe(true);
  });
});
