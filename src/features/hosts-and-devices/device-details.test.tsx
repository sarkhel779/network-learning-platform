import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { hostsAndDevicesLab } from "./hosts-and-devices.data";
import { DeviceDetails } from "./device-details";

describe("DeviceDetails", () => {
  it("explains the selected device in plain language before expandable details", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const profile = hostsAndDevicesLab.profiles.find(({ deviceId }) => deviceId === "gateway")!;

    render(
      <DeviceDetails
        profile={profile}
        journeyId="wired-remote"
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("heading", { name: "Router and default gateway" })).toBeVisible();
    expect(screen.getByText(profile.summary)).toBeVisible();
    expect(screen.getByText(profile.purpose)).toBeVisible();
    expect(screen.getByText(profile.trafficRole)).toBeVisible();
    expect(screen.getByText(profile.addressing)).toBeVisible();
    expect(screen.getByText(profile.packetBehavior)).toBeVisible();
    expect(screen.getByText(profile.evidence)).toBeVisible();
    expect(screen.getByText(profile.commonFailure)).toBeVisible();
    expect(screen.getByText(profile.analogy)).toBeVisible();
    expect(screen.getByText(profile.journeyNotes["wired-remote"])).toBeVisible();
    expect(screen.getByText(profile.technicalDetails)).not.toBeVisible();

    await user.click(screen.getByText("Technical details"));
    expect(screen.getByText(profile.technicalDetails)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Close device details" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
