import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMDXComponents } from "../../../mdx-components";
import { IpsecTunnelEstablishmentPacketFlow } from "./ipsec-tunnel-establishment-packet-flow";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(() => {
  cleanup();
});

describe("IpsecTunnelEstablishmentPacketFlow", () => {
  it("renders the IPsec tunnel establishment packet flow with its first step and controls", () => {
    render(<IpsecTunnelEstablishmentPacketFlow />);

    expect(screen.getByText(/Step 1 of \d+/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeVisible();
  });

  it("is registered for MDX content as IpsecTunnelEstablishmentPacketFlow", () => {
    expect(useMDXComponents({}).IpsecTunnelEstablishmentPacketFlow).toBe(IpsecTunnelEstablishmentPacketFlow);
  });
});
