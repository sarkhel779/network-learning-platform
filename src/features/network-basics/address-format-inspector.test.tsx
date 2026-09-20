import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AddressFormatInspector } from "./address-format-inspector";

describe("AddressFormatInspector", () => {
  it("recognizes introductory MAC and IP address formats", async () => {
    const user = userEvent.setup();
    render(<AddressFormatInspector />);
    expect(screen.getByText(/mac and ip addresses have different jobs/i)).toBeVisible();
    await user.tab();
    const sample = screen.getByRole("button", { name: /02:1a:2b:3c:4d:5e/i });
    expect(sample).toHaveFocus();
    await user.click(sample);
    expect(screen.getByRole("status")).toHaveTextContent(/mac address/i);
    expect(screen.getByRole("status")).toHaveTextContent(/locally administered/i);
  });
});
