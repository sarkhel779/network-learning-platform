import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { NetworkBasicsDiagram } from "./network-basics-diagram";

afterEach(cleanup);
describe("NetworkBasicsDiagram", () => {
  it("introduces a device only after selection, including keyboard selection", async () => {
    const user = userEvent.setup();
    const { container } = render(<NetworkBasicsDiagram variant="local" />);
    const view = within(container);
    expect(view.getByRole("status")).toHaveTextContent("Select a device");
    await user.tab();
    expect(view.getByRole("button", { name: "Explain Laptop" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(view.getByRole("status")).toHaveTextContent("creates the print job");
    await user.click(view.getByRole("button", { name: "Explain Switch" }));
    expect(view.getByRole("status")).toHaveTextContent("connects devices within this local network");
    expect(container.querySelector("[data-packet-marker]")).toBeNull();
  });
  it("disconnects only the simulated Internet connection and can reconnect it", async () => {
    const user = userEvent.setup();
    const { container } = render(<NetworkBasicsDiagram variant="scope" />);
    const view = within(container);
    await user.click(view.getByRole("button", { name: "Disconnect Internet" }));
    expect(view.getByRole("status")).toHaveTextContent("Local printing still works");
    expect(view.getByText("Internet disconnected")).toBeVisible();
    expect(view.getByRole("button", { name: "Explain Printer" })).toBeVisible();
    await user.click(view.getByRole("button", { name: "Reconnect Internet" }));
    expect(view.getByText("Internet connected")).toBeVisible();
  });
  it("distinguishes end devices from the intermediary without removing devices", async () => {
    const user = userEvent.setup();
    const { container } = render(<NetworkBasicsDiagram variant="roles" />);
    const view = within(container);
    await user.click(view.getByRole("button", { name: "Show end devices" }));
    expect(view.getByRole("button", { name: "Show end devices" })).toHaveAttribute("aria-pressed", "true");
    expect(view.getByRole("status")).toHaveTextContent("Laptop and printer");
    expect(view.getByRole("button", { name: "Explain Laptop" })).toHaveAttribute("data-highlighted", "true");
    expect(view.getByRole("button", { name: "Explain Switch" })).toHaveAttribute("data-highlighted", "false");
    await user.click(view.getByRole("button", { name: "Show intermediary devices" }));
    expect(view.getByRole("status")).toHaveTextContent("switch connects");
    expect(view.getByRole("button", { name: "Explain Switch" })).toHaveAttribute("data-highlighted", "true");
    expect(view.getByRole("button", { name: "Explain Printer" })).toHaveAttribute("data-highlighted", "false");
    expect(view.getByRole("button", { name: "Explain Laptop" })).toBeVisible();
  });
});
