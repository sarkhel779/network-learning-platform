import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KnowledgeCheck } from "./knowledge-check";

const { complete, retry, progressState } = vi.hoisted(() => ({
  complete: vi.fn(), retry: vi.fn(), progressState: { value: "idle" },
}));
vi.mock("@/features/progress/lesson-progress-context", () => ({
  useOptionalLessonProgressItem: () => ({ state: progressState.value, complete, retry }),
}));

afterEach(cleanup);

const checkProps = {
  progressItemId: "arp_and_local_delivery_check_1",
  question: "Which table maps an IP address to a MAC address?",
  options: ["Routing table", "ARP table", "MAC address table"],
  correctIndex: 1,
  explanation: "ARP resolves an IPv4 address to a link-layer address.",
};

beforeEach(() => {
  complete.mockReset().mockResolvedValue(true);
  retry.mockReset();
  progressState.value = "idle";
});

describe("KnowledgeCheck", () => {
  it("mounts an empty result live region before submission", () => {
    render(<KnowledgeCheck {...checkProps} />);

    const result = screen.getByRole("status");
    expect(result).toHaveAttribute("aria-live", "polite");
    expect(result).toBeEmptyDOMElement();
  });

  it("reveals a knowledge-check explanation only after an answer", async () => {
    const user = userEvent.setup();
    render(<KnowledgeCheck {...checkProps} />);

    expect(screen.queryByText(/arp resolves/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "ARP table" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText(/arp resolves/i)).toBeVisible();
    expect(screen.getByText("Correct.")).toBeVisible();
    expect(complete).toHaveBeenCalledWith({
      eventType: "knowledge_check_attempted",
      answerCorrect: true,
    });
  });

  it("reports an incorrect answer and allows a corrected answer to be rechecked", async () => {
    const user = userEvent.setup();
    render(<KnowledgeCheck {...checkProps} />);

    await user.click(screen.getByRole("radio", { name: "Routing table" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeVisible();
    expect(complete).toHaveBeenCalledWith({
      eventType: "knowledge_check_attempted",
      answerCorrect: false,
    });

    await user.click(screen.getByRole("radio", { name: "ARP table" }));
    expect(screen.queryByText("Not quite.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Correct.")).toBeVisible();
  });

  it("does not record an attempt until Check answer is selected", async () => {
    render(<KnowledgeCheck {...checkProps} />);
    await userEvent.click(screen.getByRole("radio", { name: "Routing table" }));
    expect(complete).not.toHaveBeenCalled();
  });

  it("keeps feedback visible and offers retry when saving fails", async () => {
    progressState.value = "error";
    render(<KnowledgeCheck {...checkProps} />);
    await userEvent.click(screen.getByRole("radio", { name: "Routing table" }));
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Retry saving answer" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("rejects a correct answer index outside the options", () => {
    expect(() => render(<KnowledgeCheck {...checkProps} correctIndex={3} />)).toThrow(
      /correctIndex/i,
    );
  });
});
