import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { accountSwitchingScenarioInput } from "./switching.account.scenarios";
import { parseSwitchingCatalog } from "./switching.schema";
import { publicSwitchingComparison } from "./switching.data";
import { FrameForwardingLab } from "./frame-forwarding-lab";

const scenarios = parseSwitchingCatalog({ comparison: publicSwitchingComparison, scenarios: accountSwitchingScenarioInput }).scenarios;

afterEach(cleanup);

describe("FrameForwardingLab", () => {
  it("shows six scenarios and waits for an explicit prediction", () => {
    render(<FrameForwardingLab scenarios={scenarios} showAdvancedShortcut />);
    expect(within(screen.getByRole("group", { name: "Choose a forwarding scenario" })).getAllByRole("radio")).toHaveLength(6);
    expect(within(screen.getByRole("group", { name: "Predict the switching decision" })).getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByRole("heading", { name: "First frame to an unknown destination" })).toBeVisible();
    expect(screen.getByText("No learned entries yet")).toBeVisible();
    expect(screen.getByText("02:00:00:00:00:01", { exact: true })).toBeVisible();
    expect(screen.getByText("02:00:00:00:00:02", { exact: true })).toBeVisible();
    expect(screen.getByRole("button", { name: "Check my forwarding prediction" })).toBeDisabled();
    expect(screen.queryByRole("region", { name: "Frame forwarding result" })).not.toBeInTheDocument();
  });

  it("explains source learning, lookup, decision, and updated table after a correct submission", async () => {
    const user = userEvent.setup();
    render(<FrameForwardingLab scenarios={scenarios} />);
    await user.click(screen.getByRole("radio", { name: "Unknown-unicast flood" }));
    for (const port of ["Port 2", "Port 3", "Port 4"]) await user.click(screen.getByRole("checkbox", { name: new RegExp(port) }));
    await user.click(screen.getByRole("button", { name: "Check my forwarding prediction" }));
    const result = screen.getByRole("region", { name: "Frame forwarding result" });
    expect(result).toHaveTextContent("Correct prediction");
    for (const heading of ["Source learning", "Destination lookup", "Forwarding decision", "Updated forwarding table"]) {
      expect(within(result).getByRole("heading", { name: heading })).toBeVisible();
    }
    expect(screen.getByRole("status")).toHaveTextContent("Check 1: Correct prediction");
  });

  it("explains an incorrect choice and announces every repeated submission", async () => {
    const user = userEvent.setup();
    render(<FrameForwardingLab scenarios={scenarios} />);
    await user.click(screen.getByRole("radio", { name: "Filter" }));
    const submit = screen.getByRole("button", { name: "Check my forwarding prediction" });
    await user.click(submit);
    expect(screen.getByRole("region", { name: "Frame forwarding result" })).toHaveTextContent("Review this prediction");
    expect(screen.getByRole("status")).toHaveTextContent("Check 1: Review this prediction");
    await user.click(submit);
    expect(screen.getByRole("status")).toHaveTextContent("Check 2: Review this prediction");
  });

  it("clears predictions, checked ports, result, and announcement when the scenario changes", async () => {
    const user = userEvent.setup();
    render(<FrameForwardingLab scenarios={scenarios} />);
    await user.click(screen.getByRole("radio", { name: "Unknown-unicast flood" }));
    await user.click(screen.getByRole("checkbox", { name: /Port 2/ }));
    await user.click(screen.getByRole("button", { name: "Check my forwarding prediction" }));
    await user.click(screen.getByRole("radio", { name: "Reply frame after learning" }));
    expect(screen.queryByRole("region", { name: "Frame forwarding result" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("");
    expect(screen.queryAllByRole("checkbox", { checked: true })).toHaveLength(0);
  });

  it("jumps to same-segment filtering, focuses it, and moves next to the decision group", async () => {
    const user = userEvent.setup();
    render(<FrameForwardingLab scenarios={scenarios} showAdvancedShortcut />);
    await user.click(screen.getByRole("button", { name: "I know this—proceed to advanced" }));
    const scenario = screen.getByRole("radio", { name: "Same-segment filtering" });
    expect(scenario).toBeChecked();
    expect(scenario).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("radio", { name: "Known unicast" })).toHaveFocus();
  });

  it("uses a labelled local scroll region for the current forwarding table", () => {
    render(<FrameForwardingLab scenarios={scenarios} />);
    const region = screen.getByRole("region", { name: "Current forwarding table; scroll horizontally if needed" });
    expect(region).toHaveAttribute("tabindex", "0");
  });
});
