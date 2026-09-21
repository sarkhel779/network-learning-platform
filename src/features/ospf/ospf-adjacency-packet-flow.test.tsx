import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMDXComponents } from "../../../mdx-components";
import { OspfAdjacencyPacketFlow } from "./ospf-adjacency-packet-flow";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(() => {
  cleanup();
});

describe("OspfAdjacencyPacketFlow", () => {
  it("renders the OSPF adjacency packet flow with its first step and controls", () => {
    render(<OspfAdjacencyPacketFlow />);

    expect(screen.getByText(/Step 1 of \d+/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeVisible();
  });

  it("is registered for MDX content as OspfAdjacencyPacketFlow", () => {
    expect(useMDXComponents({}).OspfAdjacencyPacketFlow).toBe(OspfAdjacencyPacketFlow);
  });
});
