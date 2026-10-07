import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RouterIntroductionDiagram } from "./router-introduction-diagram";

afterEach(cleanup);

describe("RouterIntroductionDiagram", () => {
  it("keeps printer delivery inside the office LAN", () => {
    const { container } = render(<RouterIntroductionDiagram />);
    expect(screen.getByRole("status")).toHaveTextContent(/printer.*stays inside the office lan/i);
    expect(container.querySelector('[data-router-link="sender"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-router-link="printer"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-router-link="gateway"]')).toHaveAttribute("data-active", "false");
    expect(container.querySelector('[data-router-link="remote"]')).toHaveAttribute("data-active", "false");
  });

  it("uses the gateway path for another network and restores local delivery", async () => {
    const user = userEvent.setup();
    const { container } = render(<RouterIntroductionDiagram />);
    await user.click(screen.getByRole("button", { name: "Send to another network" }));
    expect(screen.getByRole("status")).toHaveTextContent(/default gateway.*other network/i);
    expect(container.querySelector('[data-router-link="printer"]')).toHaveAttribute("data-active", "false");
    expect(container.querySelector('[data-router-link="gateway"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-router-link="remote"]')).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("button", { name: "Send to another network" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Send to office printer" }));
    expect(container.querySelector('[data-router-link="printer"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-router-link="gateway"]')).toHaveAttribute("data-active", "false");
    expect(container.querySelector('[data-router-link="remote"]')).toHaveAttribute("data-active", "false");
  });
});
