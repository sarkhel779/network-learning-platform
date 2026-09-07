import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PacketFlowErrorBoundary } from "./packet-flow-error-boundary";
import {
  NetworkCommunicationPacketFlow,
  PacketFlowExperience,
} from "./packet-flow-experience";

const fallbackMessage = "The interactive packet journey is unavailable. Use the static diagram and explanation above.";

vi.mock("./use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(() => {
  cleanup();
});

describe("packet-flow lesson integration", () => {
  it("renders the network communication journey with its first step and controls", () => {
    render(<NetworkCommunicationPacketFlow />);

    expect(screen.getByText(/Step 1 of \d+/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeVisible();
  });

  it("uses the MDX lesson heading as the packet player accessible name", () => {
    const { container } = render(
      <>
        <h2 id="packet-journey">Interactive packet journey</h2>
        <NetworkCommunicationPacketFlow />
      </>,
    );

    expect(screen.getAllByRole("heading", { level: 2, name: "Interactive packet journey" })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Interactive packet journey" })).toHaveAttribute(
      "id",
      "packet-journey",
    );
    expect(container.querySelector("section.packet-flow")).toHaveAttribute(
      "aria-labelledby",
      "packet-journey",
    );
  });

  it("shows the static-lesson fallback without player controls for an invalid scenario", () => {
    render(<PacketFlowExperience scenario={null} />);

    expect(screen.getByRole("note")).toHaveTextContent(fallbackMessage);
    expect(screen.queryByRole("button", { name: /Play|Pause/ })).not.toBeInTheDocument();
  });

  it("marks an ARP broadcast marker separately from an ICMP marker for its visual treatment", () => {
    const { container } = render(<NetworkCommunicationPacketFlow />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(container.querySelector("[data-packet-marker]")).toHaveClass("network-topology__packet-marker--broadcast");
  });

  it("keeps sibling lesson content mounted when the player boundary catches a rendering error", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      render(
        <>
          <p>Static lesson explanation remains available.</p>
          <PacketFlowErrorBoundary>
            <ThrowingPlayer />
          </PacketFlowErrorBoundary>
        </>,
      );

      expect(screen.getByRole("note")).toHaveTextContent(fallbackMessage);
      expect(screen.getByText("Static lesson explanation remains available.")).toBeVisible();
    } finally {
      consoleError.mockRestore();
    }
  });
});

function ThrowingPlayer(): never {
  throw new Error("player render failed");
}
