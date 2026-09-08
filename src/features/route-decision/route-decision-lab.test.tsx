import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { accountRouteDecisionScenarioInput } from "./route-decision.account.scenarios";
import { RouteDecisionLab } from "./route-decision-lab";
import { parseRouteDecisionCatalog } from "./route-decision.schema";

afterEach(cleanup);
const scenarios = parseRouteDecisionCatalog(accountRouteDecisionScenarioInput);

describe("RouteDecisionLab", () => {
  it("collects four predictions and gives field-specific feedback", async () => {
    const user = userEvent.setup(); render(<RouteDecisionLab scenarios={scenarios} />);
    await user.selectOptions(screen.getByLabelText("Destination scope"), "no-route");
    await user.selectOptions(screen.getByLabelText("Outgoing interface"), "eth0");
    await user.selectOptions(screen.getByLabelText("Next hop"), "none");
    await user.selectOptions(screen.getByLabelText("Boundary action"), "host-routing-failure");
    await user.click(screen.getByRole("button", { name: "Check my route decision" }));
    expect(screen.getByRole("region", { name: "Route decision result" })).toHaveTextContent("Review this prediction");
    expect(screen.getByText("Recalculate the network using the configured prefix.")).toBeVisible();
    expect(screen.queryByText("Read the interface on the matching route.")).not.toBeInTheDocument();
  });

  it("resets feedback when the scenario changes", async () => {
    const user = userEvent.setup(); render(<RouteDecisionLab scenarios={scenarios} />);
    await user.selectOptions(screen.getByLabelText("Destination scope"), "no-route");
    await user.selectOptions(screen.getByLabelText("Outgoing interface"), "none");
    await user.selectOptions(screen.getByLabelText("Next hop"), "none");
    await user.selectOptions(screen.getByLabelText("Boundary action"), "host-routing-failure");
    await user.click(screen.getByRole("button", { name: "Check my route decision" }));
    await user.click(screen.getByRole("radio", { name: "Missing default route" }));
    expect(screen.queryByRole("region", { name: "Route decision result" })).not.toBeInTheDocument();
  });

  it("jumps to and focuses the first intermediate scenario", async () => {
    const user = userEvent.setup(); render(<RouteDecisionLab scenarios={scenarios} showAdvancedShortcut />);
    await user.click(screen.getByRole("button", { name: "I know this—proceed to advanced" }));
    expect(screen.getByRole("radio", { name: "Wrong prefix changes the decision" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Wrong prefix changes the decision" })).toHaveFocus();
  });
});
