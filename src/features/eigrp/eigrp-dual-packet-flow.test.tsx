import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMDXComponents } from "../../../mdx-components";
import { EigrpDualPacketFlow } from "./eigrp-dual-packet-flow";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(() => {
  cleanup();
});

describe("EigrpDualPacketFlow", () => {
  it("renders the EIGRP DUAL packet flow with its first step and controls", () => {
    render(<EigrpDualPacketFlow />);

    expect(screen.getByText(/Step 1 of \d+/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeVisible();
  });

  it("is registered for MDX content as EigrpDualPacketFlow", () => {
    expect(useMDXComponents({}).EigrpDualPacketFlow).toBe(EigrpDualPacketFlow);
  });
});
