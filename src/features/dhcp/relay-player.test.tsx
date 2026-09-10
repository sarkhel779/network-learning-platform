import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DhcpRelayPlayer } from "./relay-player";

beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(cleanup);

describe("DhcpRelayPlayer", () => {
  it("shows two broadcast domains and exact relay port transitions", async () => {
    const user = userEvent.setup();
    render(<DhcpRelayPlayer />);
    expect(screen.getByText("Client broadcast domain")).toBeVisible();
    expect(screen.getByText("Server subnet")).toBeVisible();
    expect(screen.getByRole("img", { name: /relayed DHCP packet traversal/i })).toHaveAttribute("viewBox", "0 0 900 250");
    expect(screen.getByText("UDP 68 → 67")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("UDP 67 → 67")).toBeVisible();
    expect(screen.getByText(/giaddr 192\.0\.2\.1/i)).toBeVisible();
  });

  it("explains a missing helper without inventing upstream traffic", async () => {
    const user = userEvent.setup();
    render(<DhcpRelayPlayer />);
    await user.click(screen.getByLabelText("Missing helper address"));
    expect(screen.getByText(/does not create an upstream 67 → 67 packet/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
