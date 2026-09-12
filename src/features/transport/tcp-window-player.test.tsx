import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TcpWindowPlayer } from "./tcp-window-player";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }),
}));

beforeEach(() => {
  markTerminalStateReached.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(cleanup);

describe("TcpWindowPlayer", () => {
  it("labels window and SACK edges separately and steps through packet evidence", () => {
    const { container } = render(<TcpWindowPlayer />);
    expect(screen.getByText(/Sender window left edge/i)).toBeVisible();
    expect(screen.getByText(/SACK block left edge/i)).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(/Step 1/);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Step 2/);
    expect(screen.getByLabelText("TCP packet path").querySelector('[data-packet-envelope="true"]')).toBeInTheDocument();
    expect(container.querySelector(".tcp-window-byte-strip__active")).toHaveStyle({ left: "0%", width: "50%" });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector(".tcp-window-byte-strip__active")).toHaveStyle({ left: "10%", width: "50%" });
  });

  it("starts paused in reduced motion and records progress at the terminal state", () => {
    render(<TcpWindowPlayer progressItemId="tcp-window" />);
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Step 1/);
  });
});
