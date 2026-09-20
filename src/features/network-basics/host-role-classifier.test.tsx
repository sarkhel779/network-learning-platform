import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HostRoleClassifier } from "./host-role-classifier";

describe("HostRoleClassifier", () => {
  it("classifies client, server, and dual application roles", async () => {
    const user = userEvent.setup();
    render(<HostRoleClassifier />);
    expect(screen.getByText(/roles describe what applications are doing/i)).toBeVisible();
    await user.tab();
    expect(screen.getByRole("button", { name: /phone opening a website/i })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: /laptop sharing a file/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/both/i);
  });
});
