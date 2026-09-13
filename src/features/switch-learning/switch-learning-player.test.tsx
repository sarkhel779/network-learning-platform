import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SwitchLearningPlayer } from "./switch-learning-player";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(cleanup);

describe("SwitchLearningPlayer", () => {
  it("starts an autoplay journey with labelled interfaces and a compact frame marker", () => {
    const { container } = render(<SwitchLearningPlayer />);

    expect(screen.getByRole("heading", { name: "Watch the switch make one decision" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Known destination" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByText("Frame arrives on Gi0/1")).toBeInTheDocument();
    for (const label of ["Host A eth0", "Switch Gi0/1", "Switch Gi0/2", "Switch Gi0/3", "Host B eth0", "Host C eth0"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("02:00:00:00:00:0A")).toBeInTheDocument();
    expect(screen.getByText("02:00:00:00:00:0B")).toBeInTheDocument();
    expect(container.querySelector('[data-packet-marker] [data-packet-envelope="true"]')).toBeInTheDocument();
    expect(container.querySelector("[data-packet-marker] circle")).toHaveAttribute("r", "17");
    expect(container.querySelector("[data-packet-marker]")).not.toHaveAttribute("transform", "translate(330 120)");
  });

  it("restarts the explanation for unknown, broadcast, and moved-host decisions", async () => {
    const user = userEvent.setup();
    render(<SwitchLearningPlayer />);

    await user.click(screen.getByRole("radio", { name: "Unknown destination" }));
    expect(screen.getByText(/destination entry is absent/i)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Broadcast" }));
    expect(screen.getByText("FF:FF:FF:FF:FF:FF")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Host moved" }));
    expect(screen.getByText(/refreshes host b from gi0\/2 to gi0\/3/i)).toBeInTheDocument();
    expect(screen.getByText("Host B (moved) eth0")).toBeInTheDocument();
    expect(screen.getByText("Switch Gi0/3 ingress")).toBeInTheDocument();
    expect(screen.getByText("02:00:00:00:00:0B")).toBeInTheDocument();
  });

  it("shows one transmitted frame on every eligible broadcast egress", async () => {
    const user = userEvent.setup();
    const { container } = render(<SwitchLearningPlayer />);

    await user.click(screen.getByRole("radio", { name: "Broadcast" }));
    const next = screen.getByRole("button", { name: "Next" });
    await user.click(next);
    await user.click(next);
    await user.click(next);
    await user.click(next);

    const markers = [...container.querySelectorAll("[data-packet-marker]")];
    expect(markers).toHaveLength(2);
    expect(markers.map((marker) => marker.getAttribute("data-link-id")).sort()).toEqual(["switch-b", "switch-c"]);
  });
});
