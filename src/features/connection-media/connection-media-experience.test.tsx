import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { ConnectionMediaExperience } from "./connection-media-experience";
import { accountConnectionScenarios } from "./connection-media.account.data";

afterEach(cleanup);

describe("ConnectionMediaExperience", () => {
  it("moves keyboard focus to the advanced lab with its destination context", async () => {
    const user = userEvent.setup();
    render(<>
      <h2 id="design-a-connection" tabIndex={-1} aria-describedby="connection-design-context">Design a connection</h2>
      <ConnectionMediaExperience />
    </>);
    await user.tab();
    expect(screen.getByRole("button", { name: "I know this—proceed to advanced" })).toHaveFocus();
    await user.keyboard("{Enter}");
    const heading = screen.getByRole("heading", { name: "Design a connection" });
    expect(heading).toHaveAttribute("id", "design-a-connection");
    expect(document.querySelectorAll("#design-a-connection")).toHaveLength(1);
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading).toHaveFocus();
    expect(heading).toHaveAccessibleDescription(/intermediate scenarios and troubleshooting/i);
    expect(screen.getByRole("region", { name: "Design a connection" })).toBeVisible();
  });

  it.each([
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
    const markup = renderToStaticMarkup(<ConnectionMediaExperience />);
    for (const phrase of ["symptom and scope", "power, connection, and link state", "speed and duplex", "distance, cable condition", "signal strength and interference", "Change one variable", "Retest and record"]) {
      expect(markup).toContain(phrase);
    }
  });
});
