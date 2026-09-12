import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouterOnStickPlayer } from "./router-on-stick-player";
import { routerOnStickScenario } from "./router-on-stick-scenario";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(cleanup);

describe("router-on-a-stick journey", () => {
  it("sends both VLANs over one physical trunk in opposite directions", () => {
    const trunk = routerOnStickScenario.links.filter(({ id }) => id === "shared-trunk");
    expect(trunk).toHaveLength(1);
    expect(trunk[0]).toMatchObject({ from: "switch", to: "router" });
    expect(routerOnStickScenario.steps.map(({ packet }) => packet && [packet.from, packet.to])).toEqual([
      ["red-host", "switch"],
      ["switch", "router"],
      undefined,
      ["router", "switch"],
      ["switch", "green-host"],
    ]);
    expect(routerOnStickScenario.steps[1].packet?.label).toContain("VLAN 10");
    expect(routerOnStickScenario.steps[3].packet?.label).toContain("VLAN 20");
    expect(routerOnStickScenario.steps[3].explanation).toMatch(/new Ethernet frame/i);
  });

  it("shows the same physical interface, subinterfaces, and step-by-step controls", async () => {
    const user = userEvent.setup();
    render(<RouterOnStickPlayer />);
    expect(screen.getByRole("heading", { name: /router on a stick/i })).toBeVisible();
    expect(screen.getAllByText(/Fa0\/0\.10/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fa0\/0\.20/).length).toBeGreaterThan(0);
    expect(screen.getByText("Step 1 of 5")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Pause" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: /carry VLAN 10 up the trunk/i })).toBeVisible();
    expect(screen.getByText("VLAN 10")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: /return on the same trunk as VLAN 20/i })).toBeVisible();
    expect(screen.getByText("VLAN 20")).toBeVisible();
  });
});
