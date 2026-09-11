import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NatMappingLab } from "./nat-mapping-lab";
import { NatTroubleshootingLab } from "./nat-troubleshooting-lab";
import { natTroubleshootingCases } from "./nat-troubleshooting-cases";

afterEach(cleanup);

describe("NatMappingLab", () => {
  it("explains mapping classification immediately and completes an incorrect attempt once", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<NatMappingLab onComplete={onComplete} />);
    await user.click(screen.getByLabelText("Static NAT"));
    await user.click(screen.getByRole("button", { name: "Check mapping" }));
    expect(screen.getByRole("status")).toHaveTextContent(/PAT lets many clients/i);
    expect(screen.getByRole("status")).toHaveTextContent(/not quite/i);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("checks the reverse mapping and records confidence separately", async () => {
    const user = userEvent.setup();
    render(<NatMappingLab />);
    await user.click(screen.getByLabelText("203.0.113.10:62001 maps to 10.0.0.25:51514"));
    await user.click(screen.getByLabelText("Underconfident"));
    await user.click(screen.getByRole("button", { name: "Check mapping" }));
    expect(screen.getByRole("status")).toHaveTextContent(/correct/i);
    expect(screen.getByRole("status")).toHaveTextContent(/underconfident/i);
  });
});

describe("NatTroubleshootingLab", () => {
  it("ships all required evidence-led incidents", () => {
    expect(natTroubleshootingCases.map((item) => item.id)).toEqual([
      "missing-state", "wrong-port-forward", "pool-exhaustion", "pat-collision", "expired-timeout", "asymmetric-routing",
    ]);
  });

  it("explains evidence, failed assumption, and next verification for any attempted answer", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<NatTroubleshootingLab onComplete={onComplete} />);
    await user.click(screen.getByLabelText("Missing translation state"));
    await user.click(screen.getByRole("button", { name: "Check diagnosis" }));
    expect(screen.getByRole("status")).toHaveTextContent(/return packet cannot be matched/i);
    expect(screen.getByRole("status")).toHaveTextContent(/next verification/i);
    expect(onComplete).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
