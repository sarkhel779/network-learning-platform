import { describe, expect, it } from "vitest";

import { resolveLegacyTransportUrl } from "./legacy-transport-link";

describe("old transport lesson links", () => {
  it("preserves TCP bookmarks and the local audit query", () => {
    expect(resolveLegacyTransportUrl("#interactive-tcp-connection", "?audit=1"))
      .toBe("/learn/networking-foundations/tcp-reliable-transport?audit=1#interactive-tcp-connection");
    expect(resolveLegacyTransportUrl("", ""))
      .toBe("/learn/networking-foundations/tcp-reliable-transport");
  });

  it("moves old UDP anchors to the new lesson and treats unknown anchors safely", () => {
    expect(resolveLegacyTransportUrl("#interactive-tcp-udp-port-delivery", "?audit=1"))
      .toBe("/learn/networking-foundations/udp-datagrams-and-ports?audit=1#interactive-udp-port-delivery");
    expect(resolveLegacyTransportUrl("#not-a-known-anchor", ""))
      .toBe("/learn/networking-foundations/tcp-reliable-transport");
  });
});
