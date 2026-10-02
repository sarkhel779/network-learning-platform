import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RouterBoundaryPlacement } from "./router-boundary-placement";

afterEach(cleanup);

describe("RouterBoundaryPlacement", () => {
  it("uses real device symbols to show an office LAN and the Internet", () => {
    const { container } = render(<RouterBoundaryPlacement />);
    const view = within(container);

    expect(container.querySelector('[data-host-device-icon="laptop"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-symbol="switch"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-device-symbol="router"]')).toHaveLength(2);
    expect(container.querySelector('[data-device-symbol="provider"]')).toBeInTheDocument();
    expect(view.getByText("Office LAN")).toBeVisible();
    expect(view.getByRole("img", { name: "Internet" })).toBeVisible();
  });

  it("places a router at the boundary between differently named networks", async () => {
    const user = userEvent.setup();
    const { container } = render(<RouterBoundaryPlacement />);
    const view = within(container);
    expect(view.getByText(/routers connect different ip networks/i)).toBeVisible();
    await user.tab();
    expect(view.getByRole("button", { name: /between office lan and internet/i })).toHaveFocus();
    await user.click(view.getByRole("button", { name: /between office lan and internet/i }));
    expect(view.getByRole("status")).toHaveTextContent(/correct boundary/i);
    expect(container.querySelector('[data-router-position="network-boundary"]')).toHaveAttribute("data-selected", "true");
  });

  it("explains why a router does not belong between hosts on the same LAN", async () => {
    const user = userEvent.setup();
    const { container } = render(<RouterBoundaryPlacement />);
    const view = within(container);

    await user.click(view.getByRole("button", { name: /between the laptop and switch/i }));
    expect(view.getByRole("status")).toHaveTextContent(/inside one network/i);
    expect(container.querySelector('[data-router-position="inside-office-lan"]')).toHaveAttribute("data-selected", "true");
  });
});
