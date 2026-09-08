import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { hostsAndDevicesLab } from "../hosts-and-devices/hosts-and-devices.data";
import { NetworkTopology } from "./network-topology";

const scenario = hostsAndDevicesLab.journeys[0].scenario;
afterEach(cleanup);

describe("NetworkTopology semantics", () => {
  it("labels both interfaces at every network link", () => {
    const labelledScenario = {
      ...scenario,
      links: scenario.links.map((link, index) => ({
        ...link,
        fromInterface: `source-${index}`,
        toInterface: `destination-${index}`,
      })),
    };
    render(<NetworkTopology scenario={labelledScenario} step={labelledScenario.steps[0]} reducedMotion />);

    const interfaceList = screen.getByRole("list", { name: "Link interfaces" });
    expect(within(interfaceList).getAllByRole("listitem")).toHaveLength(labelledScenario.links.length);
    expect(screen.getByText("source-0")).toBeVisible();
    expect(screen.getByText("destination-0")).toBeVisible();
    expect(screen.getByText(`source-${labelledScenario.links.length - 1}`)).toBeVisible();
    expect(screen.getByText(`destination-${labelledScenario.links.length - 1}`)).toBeVisible();
  });

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
