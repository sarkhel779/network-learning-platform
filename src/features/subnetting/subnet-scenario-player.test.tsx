import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { SUBNET_SCENARIOS } from "./subnet-scenarios";
import { SubnetScenarioPlayer } from "./subnet-scenario-player";

afterEach(cleanup);

describe("SubnetScenarioPlayer", () => {
  it("covers the five practical question types from /24 through /30", () => {
    expect(new Set(SUBNET_SCENARIOS.map((item) => item.kind))).toEqual(new Set([
      "containing-subnet", "same-subnet", "valid-host", "smallest-subnet", "reserved-address",
    ]));
    expect(Math.min(...SUBNET_SCENARIOS.map((item) => item.prefix))).toBe(24);
    expect(Math.max(...SUBNET_SCENARIOS.map((item) => item.prefix))).toBe(30);
  });

  it("records a wrong attempt separately from correctness and reveals reasoning", async () => {
    const user = userEvent.setup();
    render(<SubnetScenarioPlayer />);
    await user.click(screen.getByRole("radio", { name: "192.0.2.127" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Not quite");
    expect(screen.getByTestId("scenario-attempted")).toHaveTextContent("Attempt recorded");
    expect(screen.getByText(/block size/i)).toBeInTheDocument();
  });

  it("moves to the next scenario and clears the previous answer", async () => {
    const user = userEvent.setup();
    render(<SubnetScenarioPlayer />);
    await user.click(screen.getByRole("radio", { name: "192.0.2.128" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    await user.click(screen.getByRole("button", { name: "Next scenario" }));
    expect(screen.getByText(/same local subnet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("scenario-attempted")).not.toBeInTheDocument();
  });
});
