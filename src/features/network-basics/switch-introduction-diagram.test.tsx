import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { SwitchIntroductionDiagram } from "./switch-introduction-diagram";

afterEach(cleanup);

describe("SwitchIntroductionDiagram", () => {
  it("highlights only the sender and the known printer destination", () => {
    const { container } = render(<SwitchIntroductionDiagram />);
    expect(screen.getByRole("status")).toHaveTextContent(/printer.*port 3/i);
    expect(container.querySelector('[data-switch-link="sender"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-switch-link="printer"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-switch-link="server"]')).toHaveAttribute("data-active", "false");
    expect(container.querySelector('[data-switch-link="workstation"]')).toHaveAttribute("data-active", "false");
  });

  it("moves the highlighted destination path when the learner chooses the server", async () => {
    const user = userEvent.setup();
    const { container } = render(<SwitchIntroductionDiagram />);
    await user.click(screen.getByRole("button", { name: "Send to server" }));
    expect(screen.getByRole("status")).toHaveTextContent(/server.*port 4/i);
    expect(container.querySelector('[data-switch-link="printer"]')).toHaveAttribute("data-active", "false");
    expect(container.querySelector('[data-switch-link="server"]')).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("button", { name: "Send to server" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Send to printer" }));
    expect(container.querySelector('[data-switch-link="printer"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-switch-link="server"]')).toHaveAttribute("data-active", "false");
  });
});
