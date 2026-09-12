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

  it("runs a glowing signal over VLAN 10 and back over the same trunk for VLAN 20", async () => {
    const user = userEvent.setup();
    const { container } = render(<RouterOnStickPlayer />);
    const signal = () => container.querySelector('[data-electrical-signal="true"]');
    expect(signal()).toHaveAttribute("data-link-id", "vlan10-access");
    expect(signal()).toHaveAttribute("data-from", "red-host");
    expect(container.querySelector('[data-packet-marker="true"]')).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(signal()).toHaveAttribute("data-playing", "false");
    await user.selectOptions(screen.getByLabelText("Playback speed"), "2");
    expect(signal()).toHaveStyle({ animationDuration: "0.75s" });

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(signal()).toHaveAttribute("data-link-id", "shared-trunk");
    expect(signal()).toHaveAttribute("data-from", "switch");
    expect(signal()).toHaveAttribute("data-to", "router");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(signal()).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(signal()).toHaveAttribute("data-link-id", "shared-trunk");
    expect(signal()).toHaveAttribute("data-from", "router");
    expect(signal()).toHaveAttribute("data-to", "switch");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(signal()).toHaveAttribute("data-link-id", "vlan20-access");
  });
});
