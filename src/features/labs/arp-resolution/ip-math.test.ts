import { describe, expect, it } from "vitest";

import { andIp, ipToBinary, sameSubnet } from "./ip-math";

describe("ip-math", () => {
  it("renders an IP as dotted binary octets", () => {
    expect(ipToBinary("192.168.1.10")).toBe("11000000.10101000.00000001.00001010");
  });

  it("ANDs an IP with a mask octet by octet", () => {
    expect(andIp("192.168.1.10", "255.255.255.0")).toBe("192.168.1.0");
    expect(andIp("192.168.1.20", "255.255.255.0")).toBe("192.168.1.0");
  });

  it("detects when two addresses share a network under a mask", () => {
    expect(sameSubnet("192.168.1.10", "192.168.1.20", "255.255.255.0")).toBe(true);
    expect(sameSubnet("192.168.1.10", "10.0.0.20", "255.255.255.0")).toBe(false);
  });
});
