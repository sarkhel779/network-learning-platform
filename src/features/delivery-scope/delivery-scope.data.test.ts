import { describe, expect, it } from "vitest";
import { publicDeliveryDemonstrations } from "./delivery-scope.data";

describe("public delivery demonstrations", () => {
  it("covers all five public forwarding patterns", () => {
    expect(publicDeliveryDemonstrations.map(({ id }) => id)).toEqual([
      "public-known-unicast", "public-unknown-unicast", "public-arp-broadcast",
      "public-known-multicast", "public-unknown-multicast",
    ]);
  });

  it("contains no protected scenario or advanced operations material", () => {
    expect(JSON.stringify(publicDeliveryDemonstrations)).not.toMatch(/dhcp-relay-boundary|wrong-default-gateway|IGMP|PIM|production diagnostic/i);
  });
});
