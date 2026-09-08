import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { accountSwitchingScenarioInput } from "./switching.account.scenarios";
import { FrameForwardingExperience } from "./frame-forwarding-experience";

afterEach(cleanup);

describe("FrameForwardingExperience", () => {
  it("renders the authorized lab from valid unknown props", () => {
    render(<FrameForwardingExperience scenarios={accountSwitchingScenarioInput} />);
    expect(screen.getByRole("group", { name: "Choose a forwarding scenario" })).toBeVisible();
    expect(screen.getByRole("button", { name: "I know this—proceed to advanced" })).toBeVisible();
  });

  it("renders explicit static troubleshooting guidance for malformed authored data", () => {
    render(<FrameForwardingExperience scenarios={[{ id: "broken" }]} />);
    expect(screen.getByRole("heading", { name: "Frame-forwarding lab unavailable" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Evidence-first switching workflow" })).toBeVisible();
    expect(screen.getByText(/verify physical link and port state/i)).toBeVisible();
    expect(screen.queryByRole("group", { name: "Choose a forwarding scenario" })).not.toBeInTheDocument();
  });
});
