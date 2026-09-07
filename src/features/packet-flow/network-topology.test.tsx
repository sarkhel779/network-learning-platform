import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { hostsAndDevicesLab } from "../hosts-and-devices/hosts-and-devices.data";
import { NetworkTopology } from "./network-topology";

const scenario = hostsAndDevicesLab.journeys[0].scenario;
afterEach(cleanup);

describe("NetworkTopology semantics", () => {
  it("exposes the interactive devices inside a named group instead of an atomic image", () => {
    render(<NetworkTopology scenario={scenario} step={scenario.steps[0]} reducedMotion onDeviceSelect={() => undefined} />);
    const group = screen.getByRole("group", { name: "Wired host to local server" });
    expect(within(group).getAllByRole("button")).toHaveLength(8);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(group).toHaveAccessibleDescription(/Topology order: Wired PC/);
  });

  it("retains image semantics without exposing inactive device controls", () => {
    render(<NetworkTopology scenario={scenario} step={scenario.steps[0]} reducedMotion />);
    expect(screen.getByRole("img", { name: "Wired host to local server" })).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each(["{Enter}", " "])("activates a focused device with %s", async (key) => {
    const user = userEvent.setup();
    const onDeviceSelect = vi.fn();
    render(<NetworkTopology scenario={scenario} step={scenario.steps[0]} reducedMotion onDeviceSelect={onDeviceSelect} />);
    const device = screen.getByRole("button", { name: "Explore Wired PC" });
    await user.tab();
    expect(device).toHaveFocus();
    await user.keyboard(key);
    expect(onDeviceSelect).toHaveBeenCalledWith("wired-pc");
  });
});
