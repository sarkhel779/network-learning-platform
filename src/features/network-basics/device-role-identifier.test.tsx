import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DeviceRoleIdentifier } from "./device-role-identifier";

describe("DeviceRoleIdentifier", () => {
  it("identifies broad device roles with keyboard-accessible controls", async () => {
    const user = userEvent.setup();
    render(<DeviceRoleIdentifier />);
    expect(screen.getByText(/hosts create or receive the information/i)).toBeVisible();
    await user.tab();
    expect(screen.getByRole("button", { name: /laptop/i })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: /router/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/network boundary/i);
  });
});
