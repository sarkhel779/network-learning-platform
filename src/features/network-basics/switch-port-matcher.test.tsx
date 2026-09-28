import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SwitchPortMatcher } from "./switch-port-matcher";

describe("SwitchPortMatcher", () => {
  it("shows real device icons and highlights the selected switch path", async () => {
    const user = userEvent.setup();
    const { container } = render(<SwitchPortMatcher />);

    expect(screen.getByText(/switch ports connect local devices/i)).toBeVisible();
    expect(container.querySelector('[data-host-device-icon="laptop"]')).toBeInTheDocument();
    expect(container.querySelector('[data-host-device-icon="desktop"]')).toBeInTheDocument();
    expect(container.querySelector('[data-host-device-icon="physical-server"]')).toBeInTheDocument();
    expect(container.querySelector('[data-host-device-icon="printer"]')).toBeInTheDocument();

    const ports = screen.getByRole("group", { name: "Choose the printer's switch port" });
    const portOne = within(ports).getByRole("button", { name: /port 1.*workstation/i });
    const portThree = within(ports).getByRole("button", { name: /port 3.*printer/i });

    await user.click(portOne);
    expect(portOne).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent(/try again/i);

    await user.click(portThree);
    expect(portThree).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector('[data-port-path="port-3"]')).toHaveAttribute("data-correct", "true");
    expect(screen.getByRole("status")).toHaveTextContent(/correct.*port 3/i);
  });
});
