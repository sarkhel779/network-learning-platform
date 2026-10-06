import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { HostIcon, RouterIcon, ServerIcon } from "./hop-icons";
import { HopLab } from "./hop-lab";
import type { HopDevice, HopQuiz, HopStep } from "./hop-lab-types";

afterEach(cleanup);

const devices: HopDevice[] = [
  { id: "host", label: "Host", icon: <HostIcon /> },
  { id: "router", label: "Router", icon: <RouterIcon /> },
  { id: "server", label: "Server", icon: <ServerIcon /> },
];

const steps: HopStep[] = [
  { fromId: "host", toId: "router", title: "Host sends toward the router", explanation: "First hop explanation.", fields: [{ label: "Source", value: "10.0.0.1" }] },
  { fromId: "router", toId: "server", title: "Router forwards to the server", explanation: "Second hop explanation.", fields: [], outcome: "delivered" },
];

const quiz: HopQuiz = {
  question: "Test question?",
  options: [{ id: "a", label: "Option A" }, { id: "b", label: "Option B" }],
  correctId: "a",
  feedbackCorrect: "Correct feedback.",
  feedbackIncorrect: "Incorrect feedback.",
};

describe("HopLab", () => {
  it("renders the topology, steps through hops, and gives quiz feedback", async () => {
    const user = userEvent.setup();
    render(<HopLab ariaLabel="Test lab" topologyAriaLabel="Test topology" devices={devices} steps={steps} quiz={quiz} />);

    for (const name of ["Topology", "Detail", "Explanation"]) expect(screen.getByRole("tab", { name })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 2: Host sends toward the router");
    expect(screen.getByTestId("moving-lab-packet")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Detail" }));
    expect(screen.getByText("10.0.0.1")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("status")).toHaveTextContent("Step 2 of 2: Router forwards to the server · delivered");
    expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(screen.getByRole("status", { name: "Prediction feedback" })).toHaveTextContent("Correct feedback.");
  });

  it("renders an optional extra panel tab when provided", async () => {
    const user = userEvent.setup();
    render(<HopLab ariaLabel="Test lab" topologyAriaLabel="Test topology" devices={devices} steps={steps} quiz={quiz} extraPanelTitle="Custom Panel" extraPanel={<p>Custom panel content</p>} />);
    await user.click(screen.getByRole("tab", { name: "Custom Panel" }));
    expect(screen.getByText("Custom panel content")).toBeVisible();
  });
});
