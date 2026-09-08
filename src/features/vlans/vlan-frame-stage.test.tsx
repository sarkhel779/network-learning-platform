import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VlanFrameStage } from "./vlan-frame-stage";

afterEach(cleanup);

describe("VlanFrameStage", () => {
  it("keeps Ethernet fields ordered and omits the tag on an access-link frame", () => {
    const { container } = render(<VlanFrameStage tagged={false} vlan={10} technical={false} />);
    expect([...container.querySelectorAll(".vlan-frame-stage__field")].map((node) => node.textContent)).toEqual([
      "Destination MAC", "Source MAC", "EtherType", "Payload", "FCS",
    ]);
    expect(screen.queryByText(/802\.1Q tag/)).not.toBeInTheDocument();
  });

  it("unfolds the technical 802.1Q fields without relying on color", () => {
    render(<VlanFrameStage tagged vlan={20} technical />);
    expect(screen.getByText("802.1Q tag — VLAN 20")).toBeVisible();
    expect(screen.getByText("0x8100")).toBeVisible();
    expect(screen.getByText("PCP 0")).toBeVisible();
    expect(screen.getByText("DEI 0")).toBeVisible();
    expect(screen.getByText("VLAN ID 20")).toBeVisible();
  });
});
