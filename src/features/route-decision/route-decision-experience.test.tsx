import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RouteDecisionExperience } from "./route-decision-experience";
afterEach(cleanup);

describe("RouteDecisionExperience", () => {
  it("shows an evidence checklist instead of guessing from malformed data", () => {
    render(<RouteDecisionExperience scenarios={[{ id: "broken" }]} />);
    expect(screen.getByRole("region", { name: "Routing evidence checklist" })).toHaveTextContent("Confirm the host address and configured prefix");
    expect(screen.queryByRole("button", { name: "Check my route decision" })).not.toBeInTheDocument();
  });
});
