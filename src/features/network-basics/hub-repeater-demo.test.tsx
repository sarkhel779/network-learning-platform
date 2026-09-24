import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HubRepeaterDemo } from "./hub-repeater-demo";

describe("HubRepeaterDemo", () => {
  it("waits for Play before showing a teaching bubble", async () => {
    const user = userEvent.setup();
    const { container } = render(<HubRepeaterDemo />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-id="laptop"] [data-device-symbol="laptop"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="printer"] [data-device-symbol="printer"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-id="server"] [data-device-symbol="server"]')).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("status")).toHaveTextContent(/laptop sends one signal/i);
  });

  it("moves one signal to the hub and then repeats three copies", async () => {
    const user = userEvent.setup();
    const { container } = render(<HubRepeaterDemo />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector('[data-packet-marker][data-link-id="laptop-hub"]')).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelectorAll("[data-packet-marker]")).toHaveLength(3);
    for (const linkId of ["hub-workstation", "hub-printer", "hub-server"]) {
      expect(container.querySelector(`[data-packet-marker][data-link-id="${linkId}"]`)).toBeInTheDocument();
    }
  });

  it("highlights the intended server copy and mutes the other received copies", async () => {
    const user = userEvent.setup();
    const { container } = render(<HubRepeaterDemo />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(container.querySelector('[data-link-id="hub-server"][data-packet-state="emphasized"]')).toBeInTheDocument();
    expect(container.querySelector('[data-link-id="hub-workstation"][data-packet-state="muted"]')).toBeInTheDocument();
    expect(container.querySelector('[data-link-id="hub-printer"][data-packet-state="muted"]')).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/server accepts the signal meant for it/i);
  });
});
