import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { networkCommunicationScenario } from "./network-communication.scenario";
import { packetFlowFallbackMessage } from "./packet-flow-error-boundary";
import { PacketFlowExperience } from "./packet-flow-experience";

vi.mock("./packet-flow-player", () => ({
  PacketFlowPlayer: () => {
    throw new Error("unexpected interactive render failure");
  },
}));

describe("PacketFlowExperience server rendering", () => {
  it("preserves a static fallback without rendering the interactive subtree during prerender", () => {
    let markup = "";

    expect(() => {
      markup = renderToString(<PacketFlowExperience scenario={networkCommunicationScenario} />);
    }).not.toThrow();
    expect(markup).toContain(packetFlowFallbackMessage);
  });
});
