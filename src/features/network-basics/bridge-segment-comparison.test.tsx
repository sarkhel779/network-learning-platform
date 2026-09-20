import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BridgeSegmentComparison } from "./bridge-segment-comparison";

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
});
