import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { BridgeSegmentComparison } from "./bridge-segment-comparison";

afterEach(cleanup);

describe("BridgeSegmentComparison", () => {
  it("compares one shared segment with two bridged segments", async () => {
    const user = userEvent.setup();
    render(<BridgeSegmentComparison />);
    expect(screen.getByText(/a bridge joins two local segments/i)).toBeVisible();
    await user.tab();
    expect(screen.getByRole("radio", { name: /one shared segment/i })).toHaveFocus();
    await user.click(screen.getByRole("radio", { name: /two connected segments/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/bridge separates the two segments/i);
  });

  it("keeps known same-segment traffic off the other segment", async () => {
    const user = userEvent.setup();
    const { container } = render(<BridgeSegmentComparison />);
    expect(screen.getByRole("img", { name: /one shared segment/i })).toBeVisible();
    await user.click(screen.getByRole("radio", { name: /two connected segments/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/stays on segment a/i);
    expect(container.querySelector('[data-bridge-side="right"]')).toHaveAttribute("data-active", "false");
    expect(container.querySelector('[data-bridge-transfer]')).toHaveAttribute("data-active", "false");
  });

  it("forwards cross-segment traffic and restores shared repetition when the bridge is removed", async () => {
    const user = userEvent.setup();
    const { container } = render(<BridgeSegmentComparison />);
    await user.click(screen.getByRole("radio", { name: /two connected segments/i }));
    await user.click(screen.getByRole("radio", { name: /a to d/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/forwards the frame to segment b/i);
    expect(container.querySelector('[data-bridge-transfer]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-bridge-side="right"]')).toHaveAttribute("data-active", "true");
    await user.click(screen.getByRole("radio", { name: /one shared segment/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/every other host receives/i);
    expect(container.querySelector('[data-bridge-device]')).toBeNull();
  });
});
