import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { accountDeliveryScenarios } from "./delivery-scope.account.scenarios";
import { DeliveryScopeLab } from "./delivery-scope-lab";

afterEach(cleanup);

describe("DeliveryScopeLab", () => {
  it("submits explicit predictions and explains all four distinctions", async () => {
    const user = userEvent.setup();
    render(<DeliveryScopeLab scenarios={accountDeliveryScenarios} showAdvancedShortcut />);
    await user.click(screen.getByRole("checkbox", { name: /Forward through P2 server/ }));
    await user.click(screen.getByRole("checkbox", { name: /Interface Local server receives/ }));
    await user.click(screen.getByRole("checkbox", { name: /Host Local server accepts/ }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Router action" }), "not-in-path");
    await user.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(screen.getByText(/Check 1: Correct/)).toBeVisible();
    for (const name of ["Forwarding decision", "Interfaces that receive", "Hosts that accept", "Router boundary"]) expect(screen.getByRole("heading", { name })).toBeVisible();
  });

  it("resets state and focuses the first intermediate scenario through the advanced shortcut", async () => {
    const user = userEvent.setup();
    render(<DeliveryScopeLab scenarios={accountDeliveryScenarios} showAdvancedShortcut />);
    await user.click(screen.getByRole("button", { name: "I know this—proceed to advanced" }));
    const advanced = screen.getByRole("radio", { name: "Multicast without group-aware switch state" });
    expect(advanced).toBeChecked();
    expect(advanced).toHaveFocus();
    expect(screen.queryByText(/Check 1:/)).toBeNull();
  });

  it("increments a polite announcement for repeated submissions and clears it on scenario change", async () => {
    const user = userEvent.setup();
    render(<DeliveryScopeLab scenarios={accountDeliveryScenarios} showAdvancedShortcut />);
    await user.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(screen.getByText(/Check 1:/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(screen.getByText(/Check 2:/)).toBeVisible();
    await user.click(screen.getByRole("radio", { name: "ARP request in one LAN" }));
    expect(screen.queryByText(/Check 2:/)).toBeNull();
  });

  it("provides accessible touch targets through scoped styles", () => {
    const style = document.head.appendChild(document.createElement("style"));
    style.textContent = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
    try {
      render(<DeliveryScopeLab scenarios={accountDeliveryScenarios} showAdvancedShortcut />);
      expect(Number.parseFloat(getComputedStyle(screen.getAllByRole("radio")[0].closest("label")!).minBlockSize)).toBeGreaterThanOrEqual(44);
    } finally { style.remove(); }
  });
});
