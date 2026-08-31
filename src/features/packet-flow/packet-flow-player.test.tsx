import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NetworkTopology } from "./network-topology";
import { parsePacketFlowScenario } from "./packet-flow.schema";
import { PacketFlowPlayer } from "./packet-flow-player";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("./use-reduced-motion", () => ({
  useReducedMotion: () => motionPreference.reduced,
}));

const scenario = parsePacketFlowScenario({
  id: "two-hop-demo",
  title: "Two-hop ARP and ICMP journey",
  description: "A short accessible packet-flow demonstration.",
  defaultSpeed: 1,
  devices: [
    { id: "client", label: "Client", role: "host", x: 80, y: 120 },
    { id: "gateway", label: "Gateway", role: "router", x: 720, y: 120 },
  ],
  links: [{ id: "client-gateway", from: "client", to: "gateway" }],
  steps: [
    {
      id: "request",
      title: "Client sends an ARP request",
      explanation: "Step 1 explanation.",
      durationMs: 1000,
      activeDeviceIds: ["client", "gateway"],
      activeLinkIds: ["client-gateway"],
      packet: { kind: "frame", label: "ARP request", from: "client", to: "gateway" },
      summaryFields: [{ label: "EtherType", value: "ARP" }],
      detailFields: [{ label: "TTL", value: "64", changed: true }],
    },
    {
      id: "reply",
      title: "Gateway returns an ICMP reply",
      explanation: "Step 2 explanation.",
      durationMs: 1000,
      activeDeviceIds: ["gateway"],
      activeLinkIds: [],
      summaryFields: [{ label: "ICMP", value: "Echo reply" }],
      detailFields: [{ label: "TTL", value: "63", changed: true }],
    },
  ],
});

const parallelLinkScenario = parsePacketFlowScenario({
  ...scenario,
  id: "parallel-link-demo",
  links: [
    { id: "inactive-client-gateway", from: "client", to: "gateway" },
    { id: "active-client-gateway", from: "client", to: "gateway" },
  ],
  steps: [{ ...scenario.steps[0], activeLinkIds: ["active-client-gateway"] }],
});

const reverseTravelStep = {
  ...scenario.steps[0],
  id: "reply-on-same-link",
  title: "Gateway sends a reply",
  explanation: "The reply travels back across the same link.",
  packet: { ...scenario.steps[0].packet!, from: "gateway", to: "client" },
};

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  motionPreference.reduced = false;
  vi.useFakeTimers();
  vi.stubGlobal("jest", { advanceTimersByTime: vi.advanceTimersByTime });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("PacketFlowPlayer", () => {
  it("renders the initial step, its fields, and autoplay controls", () => {
    render(<PacketFlowPlayer scenario={scenario} />);

    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    expect(screen.getByText("Step 1 explanation.")).toBeVisible();
    expect(screen.getByText("EtherType")).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
  });

  it("advances after the step duration and pauses at the final step", async () => {
    render(<PacketFlowPlayer scenario={scenario} />);

    await advance(1000);

    expect(screen.getByText("Step 2 of 2")).toBeVisible();
    expect(screen.getByText("Step 2 explanation.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("holds the step while paused and resumes only after Play", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketFlowPlayer scenario={scenario} />);

    await user.click(screen.getByRole("button", { name: "Pause" }));
    await advance(1000);
    expect(screen.getByText("Step 1 of 2")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Play" }));
    await advance(1000);
    expect(screen.getByText("Step 2 of 2")).toBeVisible();
  });

  it("keeps explanation, active topology, fields, and paused state in sync for Next and Previous", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketFlowPlayer scenario={scenario} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Step 2 explanation.")).toBeVisible();
    expect(screen.getByText("ICMP")).toBeVisible();
    expect(screen.getByText("Active: Gateway")).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Step 1 explanation.")).toBeVisible();
    expect(screen.getByText("EtherType")).toBeVisible();
    expect(screen.getByText(/Active: Client, Gateway; link Client to Gateway/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
  });

  it("restarts at step one and autoplays when reduced motion is off", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketFlowPlayer scenario={scenario} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Restart" }));

    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
  });

  it("uses half the delay after selecting 2×", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketFlowPlayer scenario={scenario} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Playback speed" }), "2");
    expect(screen.getByRole("combobox", { name: "Playback speed" })).toHaveValue("2");

    await advance(499);
    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    await advance(1);
    expect(screen.getByText("Step 2 of 2")).toBeVisible();
  });

  it("allows all four supported playback speeds to be selected", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketFlowPlayer scenario={scenario} />);

    const speedSelector = screen.getByRole("combobox", { name: "Playback speed" });
    expect(screen.getAllByRole("option").map((option) => [option.textContent, option.getAttribute("value")])).toEqual([
      ["0.5×", "0.5"],
      ["1×", "1"],
      ["1.5×", "1.5"],
      ["2×", "2"],
    ]);
    for (const speed of ["0.5", "1", "1.5", "2"]) {
      await user.selectOptions(speedSelector, speed);
      expect(speedSelector).toHaveValue(speed);
    }
  });

  it("keeps exactly one pending autoplay timer and clears it when paused or unmounted", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { unmount } = render(<PacketFlowPlayer scenario={scenario} />);

    expect(vi.getTimerCount()).toBe(1);
    await user.selectOptions(screen.getByRole("combobox", { name: "Playback speed" }), "2");
    expect(vi.getTimerCount()).toBe(1);

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(vi.getTimerCount()).toBe(0);
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reveals technical values and changed-field text in the native disclosure", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketFlowPlayer scenario={scenario} />);

    expect(screen.getByText("EtherType")).toBeVisible();
    expect(screen.queryByText("TTL")).not.toBeVisible();
    await user.click(screen.getByText("Technical packet details"));

    expect(screen.getByText("TTL")).toBeVisible();
    expect(screen.getByText("Changed at this hop")).toBeVisible();
  });

  it("starts paused for reduced motion, exposes discrete topology state, and keeps Restart paused", async () => {
    motionPreference.reduced = true;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<PacketFlowPlayer scenario={scenario} />);

    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(container.querySelector('[data-reduced-motion="true"]')).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
  });

  it("advances after a reduced-motion learner explicitly presses Play", async () => {
    motionPreference.reduced = true;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketFlowPlayer scenario={scenario} />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    await advance(1000);

    expect(screen.getByText("Step 2 of 2")).toBeVisible();
  });

  it("pauses before the next step when reduced motion is enabled during playback", async () => {
    const { rerender } = render(<PacketFlowPlayer scenario={scenario} />);

    motionPreference.reduced = true;
    rerender(<PacketFlowPlayer scenario={scenario} />);
    await advance(1000);

    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
  });

  it("does not resume when the reduced-motion preference turns off", async () => {
    motionPreference.reduced = true;
    const { rerender } = render(<PacketFlowPlayer scenario={scenario} />);

    motionPreference.reduced = false;
    rerender(<PacketFlowPlayer scenario={scenario} />);
    await advance(1000);

    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
  });

  it("provides SVG text alternatives, hides the moving packet marker, and names active entities in visible text", () => {
    const { container } = render(<PacketFlowPlayer scenario={scenario} />);

    expect(screen.getByRole("img", { name: scenario.title })).toHaveAccessibleDescription(
      "Topology order: Client, Gateway. Current step: Client sends an ARP request. Step 1 explanation.",
    );
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(/Active: Client, Gateway; link Client to Gateway/)).toBeVisible();
  });

  it("travels between step endpoints and remounts the marker when direction reverses", () => {
    const { container, rerender } = render(
      <NetworkTopology scenario={scenario} step={scenario.steps[0]} reducedMotion={false} />,
    );
    const requestMarker = container.querySelector("[data-packet-marker]");
    const requestAnimation = requestMarker?.querySelector("animateTransform");

    expect(requestMarker).toHaveAttribute("data-step-id", "request");
    expect(requestAnimation).toHaveAttribute("from", "80 120");
    expect(requestAnimation).toHaveAttribute("to", "720 120");

    rerender(<NetworkTopology scenario={scenario} step={reverseTravelStep} reducedMotion={false} />);
    const replyMarker = container.querySelector("[data-packet-marker]");
    const replyAnimation = replyMarker?.querySelector("animateTransform");

    expect(replyMarker).not.toBe(requestMarker);
    expect(replyMarker).toHaveAttribute("data-step-id", "reply-on-same-link");
    expect(replyAnimation).toHaveAttribute("from", "720 120");
    expect(replyAnimation).toHaveAttribute("to", "80 120");
  });

  it("renders a reduced-motion packet directly at the destination", () => {
    const { container } = render(
      <NetworkTopology scenario={scenario} step={scenario.steps[0]} reducedMotion />,
    );
    const marker = container.querySelector("[data-packet-marker]");

    expect(marker).toHaveAttribute("transform", "translate(720 120)");
    expect(marker?.querySelector("animateTransform")).not.toBeInTheDocument();
  });

  it("associates a packet marker with the active link when endpoint-matching links are parallel", () => {
    const { container } = render(<PacketFlowPlayer scenario={parallelLinkScenario} />);

    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-link-id", "active-client-gateway");
  });

  it("pauses playback and reports an optionally selected topology device", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onDeviceSelect = vi.fn();
    const { rerender } = render(
      <PacketFlowPlayer scenario={scenario} onDeviceSelect={onDeviceSelect} />,
    );

    await user.click(screen.getByRole("button", { name: "Explore Client" }));

    expect(onDeviceSelect).toHaveBeenCalledWith("client");
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();

    rerender(
      <PacketFlowPlayer
        scenario={scenario}
        onDeviceSelect={onDeviceSelect}
        selectedDeviceId="client"
      />,
    );
    expect(screen.getByRole("button", { name: "Explore Client" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps topology devices non-interactive when no selection callback is supplied", () => {
    render(<PacketFlowPlayer scenario={scenario} />);

    expect(screen.queryByRole("button", { name: "Explore Client" })).not.toBeInTheDocument();
  });
});
