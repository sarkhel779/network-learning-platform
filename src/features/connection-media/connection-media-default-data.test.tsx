import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Keep server validation and the client composition real when authored input is malformed.
vi.mock("server-only", () => ({}));
vi.mock("./connection-media.account.scenarios", () => ({
  accountConnectionScenarioInput: [{ id: "incomplete-authored-scenario" }],
}));

import { ConnectionMediaExperience } from "./connection-media-experience";
import { loadAccountConnectionScenarios } from "./connection-media.account-loader";

afterEach(cleanup);

describe("default account connection data failure", () => {
  it("renders static guidance when the imported authored scenarios are malformed", () => {
    const scenarios = loadAccountConnectionScenarios();
    expect(scenarios).toBeUndefined();
    render(<ConnectionMediaExperience scenarios={scenarios} />);

    expect(screen.getByRole("heading", { name: "Connection design lab unavailable" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Evidence-first troubleshooting workflow" })).toBeVisible();
    expect(screen.getByText(/change one variable/i)).toBeVisible();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByText("Desktop near a home router")).not.toBeInTheDocument();
  });
});
