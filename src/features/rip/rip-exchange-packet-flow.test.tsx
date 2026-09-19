import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMDXComponents } from "../../../mdx-components";
import { RipExchangePacketFlow } from "./rip-exchange-packet-flow";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(() => {
  cleanup();
});

describe("RipExchangePacketFlow", () => {
  it("renders the RIP exchange packet flow with its first step and controls", () => {
    render(<RipExchangePacketFlow />);

    expect(screen.getByText(/Step 1 of \d+/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeVisible();
  });

  it("is registered for MDX content as RipExchangePacketFlow", () => {
    expect(useMDXComponents({}).RipExchangePacketFlow).toBe(RipExchangePacketFlow);
  });
});
