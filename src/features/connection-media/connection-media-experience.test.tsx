import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ConnectionMediaExperience } from "./connection-media-experience";
import { accountConnectionScenarios } from "./connection-media.account.data";

afterEach(cleanup);

describe("ConnectionMediaExperience", () => {
  it("skips introductory practice and moves keyboard focus onward into the intermediate scenario", async () => {
    const user = userEvent.setup();
    render(<>
      <h2 id="design-a-connection" tabIndex={-1} aria-describedby="connection-design-context">Design a connection</h2>
      <ConnectionMediaExperience scenarios={accountConnectionScenarios} />
    </>);
    await user.tab();
    expect(screen.getByRole("button", { name: "I know this—proceed to advanced" })).toHaveFocus();
    await user.keyboard("{Enter}");
    const heading = screen.getByRole("heading", { name: "Design a connection" });
    expect(heading).toHaveAttribute("id", "design-a-connection");
    expect(document.querySelectorAll("#design-a-connection")).toHaveLength(1);
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading).toHaveAccessibleDescription(/intermediate scenarios and troubleshooting/i);
    expect(screen.getByRole("region", { name: "Design a connection" })).toBeVisible();
    const intermediateScenario = screen.getByRole("radio", { name: "Fixed workstation in a noisy workshop" });
    expect(intermediateScenario).toBeChecked();
    expect(intermediateScenario).toHaveFocus();
    expect(intermediateScenario).toHaveAccessibleDescription(/intermediate scenarios and troubleshooting/i);
    expect(screen.getByRole("radio", { name: "Desktop near a home router" })).not.toBeChecked();
    await user.tab();
    expect(screen.getByRole("radio", { name: "Copper" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "I know this—proceed to advanced" })).not.toHaveFocus();
  });

  it("clears an introductory answer when advancing to intermediate practice", async () => {
    const user = userEvent.setup();
    render(<ConnectionMediaExperience scenarios={accountConnectionScenarios} />);
    await user.click(screen.getByRole("radio", { name: "Copper" }));
    await user.click(screen.getByRole("button", { name: "Check my connection choice" }));
    expect(screen.getByRole("region", { name: "Connection choice result" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "I know this—proceed to advanced" }));
    expect(screen.getByRole("radio", { name: "Fixed workstation in a noisy workshop" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Copper" })).not.toBeChecked();
    expect(screen.queryByRole("region", { name: "Connection choice result" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByRole("button", { name: "Check my connection choice" })).toBeDisabled();
  });

  it.each([
    { label: "missing input", scenarios: undefined },
    { label: "empty array", scenarios: [] },
    { label: "null", scenarios: null },
    { label: "missing scenario identifier", scenarios: [{ ...accountConnectionScenarios[0], id: "" }] },
    { label: "unknown medium identifier", scenarios: [{ ...accountConnectionScenarios[0], recommendedMediumId: "satellite" }] },
    { label: "missing evaluations", scenarios: [{ ...accountConnectionScenarios[0], evaluations: {} }] },
  ])("rejects $label without substituting an approved scenario", ({ scenarios }) => {
    render(<ConnectionMediaExperience scenarios={scenarios} />);
    expect(screen.getByRole("heading", { name: "Connection design lab unavailable" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Evidence-first troubleshooting workflow" })).toBeVisible();
    expect(screen.getByText(/change one variable/i)).toBeVisible();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByText("Desktop near a home router")).not.toBeInTheDocument();
  });

  it("preserves static troubleshooting guidance on the server", () => {
    const markup = renderToStaticMarkup(<ConnectionMediaExperience scenarios={accountConnectionScenarios} />);
    for (const phrase of ["symptom and scope", "power, connection, and link state", "speed and duplex", "distance, cable condition", "signal strength and interference", "Change one variable", "Retest and record"]) {
      expect(markup).toContain(phrase);
    }
  });
});
