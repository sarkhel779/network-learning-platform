import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeviceRoleIdentifier } from "./device-role-identifier";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => motionPreference.reduced,
  useReducedMotionState: () => ({ reducedMotion: motionPreference.reduced, isHydrated: true }),
}));

afterEach(() => {
  cleanup();
  motionPreference.reduced = false;
  vi.useRealTimers();
});

describe("DeviceRoleIdentifier", () => {
  it("keeps the device description hidden until Play and resets it for a new scenario", async () => {
    const user = userEvent.setup();
    render(<DeviceRoleIdentifier />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(within(screen.getByRole("status")).getByRole("heading", { name: "Laptop" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Bridge" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();
  });

  it("does not start the tour when Restart is pressed before Play", async () => {
    const user = userEvent.setup();
    render(<DeviceRoleIdentifier />);

    await user.click(screen.getByRole("button", { name: "Restart" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();
  });

  it("keeps the running tour visible when the active scenario is selected again", async () => {
    const user = userEvent.setup();
    render(<DeviceRoleIdentifier />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Hub" }));

    expect(within(screen.getByRole("status")).getByRole("heading", { name: "Laptop" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
  });

  it("teaches hub, bridge, switch, and routed networks as separate examples", async () => {
    const user = userEvent.setup();
    const { container } = render(<DeviceRoleIdentifier />);

    expect(screen.getByRole("group", { name: "Hub network example" })).toBeVisible();
    expect(container.querySelector('[data-device-id="hub"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="bridge"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-id="switch"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-id="router"]')).not.toBeInTheDocument();

    const scenarioChoices = screen.getByRole("group", { name: "Choose a network example" });
    expect(within(scenarioChoices).getByRole("button", { name: "Hub" })).toHaveAttribute("aria-pressed", "true");
    expect(within(scenarioChoices).getByRole("button", { name: "Bridge" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Bridge" }));

    expect(screen.getByRole("group", { name: "Bridge network example" })).toBeVisible();
    expect(container.querySelector('[data-device-id="bridge"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="hub"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-id="switch"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-id="router"]')).not.toBeInTheDocument();
    expect(within(scenarioChoices).getByRole("button", { name: "Hub" })).toHaveAttribute("aria-pressed", "false");
    expect(within(scenarioChoices).getByRole("button", { name: "Bridge" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Switch" }));
    expect(screen.getByRole("group", { name: "Switch network example" })).toBeVisible();
    expect(container.querySelector('[data-device-id="switch"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="hub"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-id="bridge"]')).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Router and Internet" }));
    expect(screen.getByRole("group", { name: "Router and Internet example" })).toBeVisible();
    expect(container.querySelector('[data-device-id="switch"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="router"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="internet"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="server"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="hub"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-id="bridge"]')).not.toBeInTheDocument();
  });

  it("keeps the cloud, active topology state, and inspector synchronized after direct device selection", async () => {
    const user = userEvent.setup();
    const { container } = render(<DeviceRoleIdentifier />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Explore Printer" }));

    const topology = container.querySelector(".packet-flow-topology-stage") as HTMLElement;
    const inspector = screen.getByRole("heading", { name: "Packet inspector" }).closest("section") as HTMLElement;
    expect(within(topology).getByRole("heading", { name: "Printer" })).toBeVisible();
    expect(container.querySelector('[data-device-id="printer"][data-active="true"]')).toBeInTheDocument();
    expect(within(inspector).getByText("Printer")).toBeVisible();
    expect(within(inspector).queryByText("Laptop")).not.toBeInTheDocument();
  });

  it("keeps only the topology player and packet inspector, with device information in a cloud pop-up", async () => {
    const user = userEvent.setup();
    const { container } = render(<DeviceRoleIdentifier />);

    const topology = container.querySelector(".packet-flow-topology-stage");
    expect(topology).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play" }));
    const cloud = within(topology as HTMLElement).getByRole("status");
    expect(cloud).toHaveClass("device-role-tour__cloud");
    expect(cloud).toHaveStyle({ "--device-role-cloud-anchor": "13.125%" });
    expect(cloud.querySelector(".device-role-tour__cloud-shape")).toBeInTheDocument();
    expect(within(cloud).getByRole("heading", { name: "Laptop" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Packet inspector" })).toBeVisible();
    expect(screen.queryByText(/Step 1 of/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    const hubCloud = within(topology as HTMLElement).getByRole("status");
    expect(within(hubCloud).getByRole("heading", { name: "Hub" })).toBeVisible();
    expect(within(hubCloud).getByText(/repeats the incoming signal/i)).toBeVisible();
    expect(container.querySelector('[data-packet-marker][data-link-id="laptop-hub"]')).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(container.querySelectorAll("[data-packet-marker]")).toHaveLength(2);
    expect(container.querySelector('[data-packet-marker][data-link-id="hub-workstation"]')).toBeInTheDocument();
    expect(container.querySelector('[data-packet-marker][data-link-id="hub-printer"]')).toBeInTheDocument();
    const animatedMarkers = container.querySelectorAll("[data-packet-marker].network-topology__packet-marker--travel");
    expect(animatedMarkers).toHaveLength(2);
    for (const marker of animatedMarkers) {
      expect(marker).toHaveStyle({ animationDuration: "1500ms" });
      expect(marker.getAttribute("style")).toMatch(/--packet-travel-x:/);
      expect(marker.getAttribute("style")).toMatch(/--packet-travel-y:/);
      expect(marker.querySelector("animateTransform")).not.toBeInTheDocument();
    }
    expect(within(topology as HTMLElement).getByText(/repeats the signal toward every attached host/i)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(within(topology as HTMLElement).getByRole("status")).toHaveStyle({ "--device-role-cloud-anchor": "85%" });
    expect(container.querySelector('[data-link-id="hub-workstation"][data-packet-state="emphasized"]')).toBeInTheDocument();
    expect(container.querySelector('[data-link-id="hub-printer"][data-packet-state="muted"]')).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector('[data-link-id="hub-workstation"][data-packet-state="muted"]')).toBeInTheDocument();
    expect(container.querySelector('[data-link-id="hub-printer"][data-packet-state="emphasized"]')).toBeInTheDocument();
  });

  it("lets a learner explicitly enable smooth packet motion when the system requests reduced motion", async () => {
    motionPreference.reduced = true;
    const user = userEvent.setup();
    const { container } = render(<DeviceRoleIdentifier />);

    expect(container.querySelector("animateTransform")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enable smooth packet motion" }));
    await user.click(screen.getByRole("button", { name: /^Next$/ }));

    const marker = container.querySelector("[data-packet-marker].network-topology__packet-marker--travel");
    expect(marker).toHaveStyle({ animationDuration: "1500ms" });
    expect(marker?.querySelector("animateTransform")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use reduced motion" })).toHaveAttribute("aria-pressed", "true");
  });

  it("freezes an in-progress cable animation when playback is paused", () => {
    vi.useFakeTimers();
    const { container } = render(<DeviceRoleIdentifier />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    act(() => vi.advanceTimersByTime(5200));
    const marker = container.querySelector("[data-packet-marker].network-topology__packet-marker--travel");
    expect(marker).toHaveAttribute("data-playing", "true");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(marker).toHaveAttribute("data-playing", "false");
  });
});
