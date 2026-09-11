import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { NatJourneyPlayer } from "./nat-journey-player";
import { hairpinBidirectionalJourney, hairpinDnatOnlyJourney, patInternetJourney } from "./nat-scenarios";

afterEach(cleanup);

describe("NatJourneyPlayer", () => {
  it("keeps packet, tuple, and translation state synchronized during manual playback", async () => {
    const user = userEvent.setup();
    render(<NatJourneyPlayer scenarios={[patInternetJourney]} initialScenarioId="pat-internet-journey" title="PAT journey" />);

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByTestId("nat-packet")).toHaveAttribute("data-step", "private-request");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("nat-packet")).toHaveAttribute("data-step", "translated");
    expect(screen.getByTestId("nat-packet")).toHaveAttribute("data-direction", "forward");
    expect(screen.getByRole("row", { name: /pat-https-1/i })).toHaveAttribute("data-active", "true");
    expect(screen.getByText("203.0.113.10", { selector: "mark" })).toBeVisible();
  });

  it("restarts packet motion and reverses it for return traffic", async () => {
    const user = userEvent.setup();
    render(<NatJourneyPlayer scenarios={[patInternetJourney]} initialScenarioId="pat-internet-journey" title="PAT journey" />);
    const firstPacket = screen.getByTestId("nat-packet");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("nat-packet")).not.toBe(firstPacket);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("nat-packet")).toHaveAttribute("data-direction", "reverse");
  });

  it("restarts at step one and pauses playback", async () => {
    const user = userEvent.setup();
    render(<NatJourneyPlayer scenarios={[patInternetJourney]} initialScenarioId="pat-internet-journey" title="PAT journey" />);
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();
    expect(screen.getByText(/private HTTPS tuple reaches/i)).toBeVisible();
  });

  it("switches between failed and successful U-Turn paths from their first step", async () => {
    const user = userEvent.setup();
    render(<NatJourneyPlayer scenarios={[hairpinDnatOnlyJourney, hairpinBidirectionalJourney]} initialScenarioId="hairpin-dnat-only" title="U-Turn comparison" />);
    await user.click(screen.getByRole("button", { name: hairpinBidirectionalJourney.title }));
    expect(screen.getByTestId("nat-packet")).toHaveAttribute("data-step", "public-request");
    expect(screen.getByRole("status")).toHaveTextContent(/step 1 of 4/i);
  });

  it("enforces final-step boundaries and exposes playback speed", async () => {
    const user = userEvent.setup();
    render(<NatJourneyPlayer scenarios={[hairpinDnatOnlyJourney]} initialScenarioId="hairpin-dnat-only" title="Failure path" />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("Playback speed"), "2");
    expect(screen.getByLabelText("Playback speed")).toHaveValue("2");
  });
});
