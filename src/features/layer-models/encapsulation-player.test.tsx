import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { layerModelsLab } from "./layer-models.data";
import { EncapsulationPlayer } from "./encapsulation-player";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("../packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => motionPreference.reduced,
  useReducedMotionState: () => ({ reducedMotion: motionPreference.reduced, isHydrated: true }),
}));

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

describe("EncapsulationPlayer", () => {
  it("shows each header and exactly one payload during encapsulation and decapsulation", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);
    const expected = [
      ["Application data"],
      ["TCP header", "Application data"],
      ["IPv4 header", "TCP header", "Application data"],
      ["Ethernet header", "IPv4 header", "TCP header", "Application data", "Ethernet trailer"],
      ["Physical signals carrying the frame bits"],
      ["Ethernet header", "IPv4 header", "TCP header", "Application data", "Ethernet trailer"],
      ["IPv4 header", "TCP header", "Application data"],
      ["TCP header", "Application data"],
      ["Application data"],
    ];
    for (const [index, parts] of expected.entries()) {
      const pdu = screen.getByRole("list", { name: "Visible protocol data unit" });
      expect(within(pdu).getAllByRole("listitem").map((item) => item.textContent)).toEqual(parts);
      if (index < expected.length - 1) await user.click(screen.getByRole("button", { name: "Next" }));
    }
  });

  it("starts at application Data and automatically advances to the synchronized transport Segment", async () => {
    render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    expect(screen.getByRole("region", { name: "Encapsulation and decapsulation playback" })).toBeVisible();
    expect(screen.getByText("Step 1 of 9")).toBeVisible();
    expect(screen.getByText("Encapsulation", { selector: "[data-current-direction]" })).toBeVisible();
    expect(screen.getByText("OSI layer 7 — Application", { selector: "[data-active-osi-layer]" })).toBeVisible();
    expect(screen.getByText("TCP/IP Application layer", { selector: "[data-active-tcp-ip-layer]" })).toBeVisible();
    expect(screen.getByText("Data", { selector: "[data-current-pdu]" })).toBeVisible();
    expect(screen.getByText("HTTP request data", { selector: "[data-added-information]" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();

    await advance(2400);

    expect(screen.getByText("Step 2 of 9")).toBeVisible();
    expect(screen.getByText("Segment", { selector: "[data-current-pdu]" })).toBeVisible();
    expect(screen.getByText("OSI layer 4 — Transport", { selector: "[data-active-osi-layer]" })).toBeVisible();
    expect(screen.getByText("TCP/IP Transport layer", { selector: "[data-active-tcp-ip-layer]" })).toBeVisible();
  });

  it("pauses, resumes, and maintains exactly one timer", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { unmount } = render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    expect(vi.getTimerCount()).toBe(1);
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(vi.getTimerCount()).toBe(0);
    await advance(2400);
    expect(screen.getByText("Step 1 of 9")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(vi.getTimerCount()).toBe(1);
    await advance(2400);
    expect(screen.getByText("Step 2 of 9")).toBeVisible();

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("supports previous, next, restart, and pauses at the final step", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Step 2 of 9")).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Step 1 of 9")).toBeVisible();

    for (let step = 1; step < 9; step += 1) {
      await user.click(screen.getByRole("button", { name: "Next" }));
    }
    expect(screen.getByText("Step 9 of 9")).toBeVisible();
    expect(screen.getByText("Decapsulation", { selector: "[data-current-direction]" })).toBeVisible();
    expect(screen.getByText("Data", { selector: "[data-current-pdu]" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(vi.getTimerCount()).toBe(0);

    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByText("Step 1 of 9")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
  });

  it("keeps both semantic stacks synchronized across every canonical step", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    const expected = layerModelsLab.encapsulationSteps.map((step, index) => ({
      counter: `Step ${index + 1} of 9`,
      direction: step.direction === "encapsulation"
        ? "Encapsulation"
        : step.direction === "decapsulation"
          ? "Decapsulation"
          : "Transmission",
      pdu: step.pdu,
      osi: `OSI layer ${step.activeOsiLayer} — ${layerModelsLab.osiLayers.find((layer) => layer.number === step.activeOsiLayer)?.name}`,
      tcpIp: `TCP/IP ${layerModelsLab.tcpIpLayers.find((layer) => layer.id === step.activeTcpIpLayer)?.name} layer`,
      information: step.addedInformation,
    }));

    for (const [index, step] of expected.entries()) {
      expect(screen.getByText(step.counter)).toBeVisible();
      expect(screen.getByText(step.direction, { selector: "[data-current-direction]" })).toBeVisible();
      expect(screen.getByText(step.pdu, { selector: "[data-current-pdu]" })).toBeVisible();
      expect(screen.getByText(step.osi, { selector: "[data-active-osi-layer]" })).toBeVisible();
      expect(screen.getByText(step.tcpIp, { selector: "[data-active-tcp-ip-layer]" })).toBeVisible();
      expect(screen.getByText(step.information, { selector: "[data-added-information]" })).toBeVisible();

      const activeOsi = screen.getByRole("list", { name: "Active OSI seven-layer stack" })
        .querySelector(`[data-osi-layer="${layerModelsLab.encapsulationSteps[index].activeOsiLayer}"]`);
      expect(activeOsi).toHaveAttribute("data-active", "true");
      expect(activeOsi).toHaveTextContent("Active");

      const activeTcpIp = screen.getByRole("list", { name: "Active TCP/IP four-layer stack" })
        .querySelector(`[data-tcp-ip-layer="${layerModelsLab.encapsulationSteps[index].activeTcpIpLayer}"]`);
      expect(activeTcpIp).toHaveAttribute("data-active", "true");
      expect(activeTcpIp).toHaveTextContent("Active");

      if (index < expected.length - 1) {
        await user.click(screen.getByRole("button", { name: "Next" }));
      }
    }
  });

  it("offers all shared playback speeds and applies the selected speed to the timer", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    const selector = screen.getByRole("combobox", { name: "Playback speed" });
    expect(screen.getAllByRole("option").map((option) => [option.textContent, option.getAttribute("value")])).toEqual([
      ["0.5×", "0.5"],
      ["1×", "1"],
      ["1.5×", "1.5"],
      ["2×", "2"],
    ]);
    await user.selectOptions(selector, "2");
    expect(vi.getTimerCount()).toBe(1);
    await advance(1199);
    expect(screen.getByText("Step 1 of 9")).toBeVisible();
    await advance(1);
    expect(screen.getByText("Step 2 of 9")).toBeVisible();
  });

  it("uses native expandable details and keeps a polite status region permanently mounted", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    expect(screen.getByText("The browser prepares the request it wants the server to receive.")).toBeVisible();
    expect(screen.queryByText(/HTTP produces application data/)).not.toBeVisible();
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toHaveTextContent("Step 1 of 9");
    await user.click(screen.getByText("Technical details"));
    expect(screen.getByText(/HTTP produces application data/)).toBeVisible();
  });

  it("starts paused with discrete state under reduced motion and keeps restart paused", async () => {
    motionPreference.reduced = true;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(vi.getTimerCount()).toBe(0);
    expect(container.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
    expect(container.querySelector("animate, animateTransform")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Step 2 of 9")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
  });

  it("does not autoplay or schedule a timer during the SSR-to-hydration preference handoff", async () => {
    motionPreference.reduced = true;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(vi.getTimerCount()).toBe(0);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Step 2 of 9")).toBeVisible();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renders semantic encapsulation blocks while hiding decorative layers", () => {
    const { container } = render(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);

    expect(screen.getByRole("list", { name: "Visible protocol data unit" })).toBeVisible();
    expect(within(screen.getByRole("list", { name: "Visible protocol data unit" })).getByRole("listitem")).toHaveTextContent("Application data");
    expect(container.querySelector('[data-encapsulation-decoration="true"]')).toHaveAttribute("aria-hidden", "true");
  });
});
