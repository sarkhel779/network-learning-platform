import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { KnowledgeCheck } from "./knowledge-check";

afterEach(cleanup);

const checkProps = {
  question: "Which table maps an IP address to a MAC address?",
  options: ["Routing table", "ARP table", "MAC address table"],
  correctIndex: 1,
  explanation: "ARP resolves an IPv4 address to a link-layer address.",
};

describe("KnowledgeCheck", () => {
  it("reveals a knowledge-check explanation only after an answer", async () => {
    const user = userEvent.setup();
    render(<KnowledgeCheck {...checkProps} />);

    expect(screen.queryByText(/arp resolves/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "ARP table" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText(/arp resolves/i)).toBeVisible();
    expect(screen.getByText("Correct.")).toBeVisible();
  });

  it("reports an incorrect answer and allows a corrected answer to be rechecked", async () => {
    const user = userEvent.setup();
    render(<KnowledgeCheck {...checkProps} />);

    await user.click(screen.getByRole("radio", { name: "Routing table" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Not quite.")).toBeVisible();

    await user.click(screen.getByRole("radio", { name: "ARP table" }));
    expect(screen.queryByText("Not quite.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Correct.")).toBeVisible();
  });

  it("rejects a correct answer index outside the options", () => {
    expect(() => render(<KnowledgeCheck {...checkProps} correctIndex={3} />)).toThrow(
      /correctIndex/i,
    );
  });
});
