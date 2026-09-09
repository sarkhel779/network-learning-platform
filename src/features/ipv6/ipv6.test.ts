import { describe, expect, it } from "vitest";

import {
  classifyIpv6,
  compressIpv6,
  deriveSolicitedNodeMulticast,
  expandIpv6,
  parseIpv6,
  splitIpv6Prefix,
} from "./ipv6";

describe("IPv6 address domain", () => {
  it("expands and canonically compresses valid addresses", () => {
    expect(expandIpv6("2001:db8::1")).toBe("2001:0db8:0000:0000:0000:0000:0000:0001");
    expect(compressIpv6("2001:0db8:0000:0000:0001:0000:0000:0001")).toBe("2001:db8::1:0:0:1");
    expect(compressIpv6("2001:DB8:0:1:0:0:0:1")).toBe("2001:db8:0:1::1");
    expect(compressIpv6("0:0:0:0:0:0:0:0")).toBe("::");
  });

  it("classifies important address families at their boundaries", () => {
    expect(classifyIpv6("::").kind).toBe("unspecified");
    expect(classifyIpv6("::1").kind).toBe("loopback");
    expect(classifyIpv6("fe80::1").kind).toBe("link-local");
    expect(classifyIpv6("fd00::1").kind).toBe("unique-local");
    expect(classifyIpv6("ff02::1").kind).toBe("multicast");
    expect(classifyIpv6("2001:db8::1").kind).toBe("global-unicast");
  });

  it("splits prefixes and derives solicited-node multicast", () => {
    expect(splitIpv6Prefix("2001:db8::1/64")).toMatchObject({ prefixLength: 64, networkBits: 64, interfaceBits: 64 });
    expect(splitIpv6Prefix("2001:db8::1/128")).toMatchObject({ prefixLength: 128, interfaceBits: 0 });
    expect(deriveSolicitedNodeMulticast("2001:db8::1234:5678")).toBe("ff02::1:ff34:5678");
  });

  it.each(["", "2001::db8::1", "2001:db8:0:0:0:0:0:0:1", "2001:db8::gg", "::ffff:192.0.2.1"])(
    "rejects malformed input %s",
    (value) => expect(() => parseIpv6(value)).toThrow("Invalid IPv6 address"),
  );

  it.each(["2001:db8::1/-1", "2001:db8::1/129", "2001:db8::1/x"])(
    "rejects invalid prefix %s",
    (value) => expect(() => splitIpv6Prefix(value)).toThrow("Invalid IPv6 prefix"),
  );
});
