import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Model a malformed authored source before the real account modules initialize.
// Keep schema validation and the composition real: a throwing import-time parser
// would prevent this default (no-props) render from reaching its fallback.
vi.mock("./connection-media.account.scenarios", () => ({
  accountConnectionScenarioInput: [{ id: "incomplete-authored-scenario" }],
}));

import { ConnectionMediaExperience } from "./connection-media-experience";

afterEach(cleanup);

describe("default account connection data failure", () => {
  it("renders static guidance when the imported authored scenarios are malformed", () => {
    render(<ConnectionMediaExperience />);

    expect(screen.getByRole("heading", { name: "Connection design lab unavailable" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Evidence-first troubleshooting workflow" })).toBeVisible();
    expect(screen.getByText(/change one variable/i)).toBeVisible();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByText("Desktop near a home router")).not.toBeInTheDocument();
  });
});
