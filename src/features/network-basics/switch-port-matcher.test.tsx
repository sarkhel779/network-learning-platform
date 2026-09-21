import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SwitchPortMatcher } from "./switch-port-matcher";

describe("SwitchPortMatcher", () => {
  it("matches a named host to a labelled switch port", async () => {
    const user = userEvent.setup();
    render(<SwitchPortMatcher />);
    expect(screen.getByText(/switch ports connect local devices/i)).toBeVisible();
    await user.tab();
    expect(screen.getByLabelText(/printer connects to/i)).toHaveFocus();
    await user.selectOptions(screen.getByLabelText(/printer connects to/i), "port-3");
    expect(screen.getByRole("status")).toHaveTextContent(/correct/i);
  });
});
