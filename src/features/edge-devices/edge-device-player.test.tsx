import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotionState: () => ({ reducedMotion: true, isHydrated: true }),
}));

import { EdgeDevicePlayer } from "./edge-device-player";

afterEach(cleanup);

describe("EdgeDevicePlayer", () => {
  it("starts with a labelled fibre journey and explains the active device role", () => {
    const { container } = render(<EdgeDevicePlayer />);
    expect(screen.getByRole("region", { name: "Edge device packet journey: Home fibre" })).toBeVisible();
    expect(screen.getByText("Stage 1 of 6")).toBeVisible();
    expect(screen.getByRole("region", { name: "What this device does" })).toHaveTextContent("Laptop");
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(container.querySelector('[data-device-symbol="ont"]')).toBeInTheDocument();
    expect(screen.getByLabelText("Packet contents at the current hop")).toHaveTextContent(
      "Local-link frameIP packetApplication data",
    );
  });

  it("resets the journey when the learner selects cable internet", async () => {
    const user = userEvent.setup();
    const { container } = render(<EdgeDevicePlayer />);
    await user.click(screen.getByRole("radio", { name: "Home cable" }));
    expect(screen.getByRole("region", { name: "Edge device packet journey: Home cable" })).toBeVisible();
    expect(screen.getByText("Cable modem")).toBeVisible();
    expect(screen.getByText("Stage 1 of 6")).toBeVisible();
    expect(container.querySelector('[data-device-symbol="modem"]')).toBeInTheDocument();
  });
});
