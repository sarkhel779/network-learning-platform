import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AddressFormatInspector } from "./address-format-inspector";

afterEach(cleanup);

describe("AddressFormatInspector", () => {
  it("recognizes introductory MAC and IP address formats", async () => {
    const user = userEvent.setup();
    render(<AddressFormatInspector />);
    expect(screen.getByText(/mac and ip addresses have different jobs/i)).toBeVisible();
    const sample = screen.getByRole("button", { name: /02:1a:2b:3c:4d:5e/i });
    sample.focus();
    expect(sample).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent(/mac address/i);
    expect(screen.getByRole("status")).toHaveTextContent(/locally administered/i);
  });

  it("changes the example IP when switching networks while keeping the same interface MAC", async () => {
    const user = userEvent.setup();
    render(<AddressFormatInspector />);
    const identity = screen.getByRole("group", { name: "One interface, two addresses" });
    expect(within(identity).getByText("192.0.2.10")).toBeVisible();
    expect(within(identity).getByText("02:1A:2B:3C:4D:5E")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Office network" }));
    expect(within(identity).getByText("198.51.100.10")).toBeVisible();
    expect(within(identity).queryByText("192.0.2.10")).not.toBeInTheDocument();
    expect(within(identity).getByText("02:1A:2B:3C:4D:5E")).toBeVisible();
    expect(screen.getByRole("button", { name: "Office network" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Home network" }));
    expect(within(identity).getByText("192.0.2.10")).toBeVisible();
  });

  it("updates the rightmost I/G bit and next U/L bit without changing the rest of the MAC", async () => {
    const user = userEvent.setup();
    render(<AddressFormatInspector />);
    await user.click(screen.getByRole("button", { name: "02:1A:2B:3C:4D:5E" }));
    expect(screen.getByLabelText("First octet in binary")).toHaveTextContent("00000010");
    expect(screen.getByLabelText("Selected address")).toHaveTextContent("02:1A:2B:3C:4D:5E");
    expect(screen.getByRole("status")).toHaveTextContent(/individual.*locally administered/i);
    await user.click(screen.getByRole("button", { name: "Toggle I/G bit" }));
    expect(screen.getByLabelText("First octet in binary")).toHaveTextContent("00000011");
    expect(screen.getByLabelText("Selected address")).toHaveTextContent("03:1A:2B:3C:4D:5E");
    expect(screen.getByRole("status")).toHaveTextContent(/group.*locally administered/i);
    await user.click(screen.getByRole("button", { name: "Toggle U/L bit" }));
    expect(screen.getByLabelText("First octet in binary")).toHaveTextContent("00000001");
    expect(screen.getByLabelText("Selected address")).toHaveTextContent("01:1A:2B:3C:4D:5E");
    expect(screen.getByRole("status")).toHaveTextContent(/group.*universally administered/i);
    await user.click(screen.getByRole("button", { name: "Toggle I/G bit" }));
    expect(screen.getByLabelText("First octet in binary")).toHaveTextContent("00000000");
    expect(screen.getByRole("status")).toHaveTextContent(/individual.*universally administered/i);
  });

  it("restores each MAC sample instead of keeping edited bits from the previous sample", async () => {
    const user = userEvent.setup();
    render(<AddressFormatInspector />);
    await user.click(screen.getByRole("button", { name: "00:00:5E:00:53:10" }));
    await user.click(screen.getByRole("button", { name: "Toggle U/L bit" }));
    expect(screen.getByLabelText("Selected address")).toHaveTextContent("02:00:5E:00:53:10");
    await user.click(screen.getByRole("button", { name: "01:00:5E:00:00:FB" }));
    expect(screen.getByLabelText("First octet in binary")).toHaveTextContent("00000001");
    expect(screen.getByRole("status")).toHaveTextContent(/group.*universally administered/i);
    await user.click(screen.getByRole("button", { name: "00:00:5E:00:53:10" }));
    expect(screen.getByLabelText("Selected address")).toHaveTextContent("00:00:5E:00:53:10");
    expect(screen.getByRole("button", { name: "Toggle U/L bit" })).toHaveAttribute("aria-pressed", "false");
  });

  it.each([
    ["192.0.2.10", /IPv4.*dotted decimal/i],
    ["2001:db8::10", /IPv6.*hexadecimal/i],
  ])("shows %s as an IP address without MAC bit controls", async (sample, meaning) => {
    const user = userEvent.setup();
    render(<AddressFormatInspector />);
    await user.click(screen.getByRole("button", { name: "02:1A:2B:3C:4D:5E" }));
    await user.click(screen.getByRole("button", { name: sample }));
    expect(screen.getByRole("status")).toHaveTextContent(meaning);
    expect(screen.queryByRole("button", { name: "Toggle I/G bit" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("First octet in binary")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: sample })).toHaveAttribute("aria-pressed", "true");
  });
});
