import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it } from "vitest";
import { InterfaceAddressDiagram } from "./interface-address-diagram";

afterEach(cleanup);

it("shows two different addresses belonging to the same interface", () => {
  render(<InterfaceAddressDiagram />);
  expect(screen.getByText("02:1A:2B:3C:4D:5E")).toBeVisible();
  expect(screen.getByText("192.0.2.10")).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent(/network A/i);
});

it("changes the IP but keeps the example MAC when changing networks", async () => {
  const user = userEvent.setup();
  render(<InterfaceAddressDiagram />);
  await user.click(screen.getByRole("button", { name: "Join network B" }));
  expect(screen.getByText("198.51.100.20")).toBeVisible();
  expect(screen.queryByText("192.0.2.10")).not.toBeInTheDocument();
  expect(screen.getByText("02:1A:2B:3C:4D:5E")).toBeVisible();
  expect(screen.getByRole("button", { name: "Join network B" })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "Join network A" }));
  expect(screen.getByText("192.0.2.10")).toBeVisible();
});
