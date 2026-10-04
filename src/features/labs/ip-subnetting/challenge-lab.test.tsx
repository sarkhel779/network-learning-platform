import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { ChallengeLab } from "./challenge-lab";
import type { ChallengeRound } from "./challenge-rounds";

afterEach(cleanup);

const rounds: ChallengeRound[] = [
  {
    prompt: "Round one prompt",
    options: [{ id: "a", label: "Option A" }, { id: "b", label: "Option B" }],
    correctId: "a",
    explanation: "Because A is right.",
  },
  {
    prompt: "Round two prompt",
    options: [{ id: "a", label: "Option A" }, { id: "b", label: "Option B" }],
    correctId: "b",
    explanation: "Because B is right.",
  },
];

describe("ChallengeLab", () => {
  it("gives correct feedback and advances through rounds to a final score", async () => {
    const user = userEvent.setup();
    render(<ChallengeLab rounds={rounds} />);

    expect(screen.getByText("Round 1 of 2 · Score 0")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status", { name: "Answer feedback" })).toHaveTextContent(/Correct\. Because A is right\./);

    await user.click(screen.getByRole("button", { name: "Next round" }));
    expect(screen.getByText("Round 2 of 2 · Score 1")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status", { name: "Answer feedback" })).toHaveTextContent(/Not quite\. Because B is right\./);

    await user.click(screen.getByRole("button", { name: "See results" }));
    expect(screen.getByRole("status")).toHaveTextContent("You scored 1 out of 2.");
  });

  it("restarts from the summary screen", async () => {
    const user = userEvent.setup();
    render(<ChallengeLab rounds={rounds} />);
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "Next round" }));
    await user.click(screen.getByRole("radio", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "See results" }));

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Round 1 of 2 · Score 0")).toBeInTheDocument();
  });

  it("disables checking an answer until an option is selected", () => {
    render(<ChallengeLab rounds={rounds} />);
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
  });
});
