import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HubRepeaterDemo } from "./hub-repeater-demo";

describe("HubRepeaterDemo", () => {
  it("shows that a hub repeats a signal to every other port", async () => {
    const user = userEvent.setup();
    render(<HubRepeaterDemo />);
    expect(screen.getByText(/a hub does not choose a destination/i)).toBeVisible();
    await user.tab();
    const send = screen.getByRole("button", { name: /send signal into port 1/i });
    expect(send).toHaveFocus();
    await user.click(send);
    expect(screen.getByRole("status")).toHaveTextContent(/repeated to ports 2, 3, and 4/i);
    expect(screen.queryByText(/mac table|collision algorithm/i)).not.toBeInTheDocument();
  });
});
