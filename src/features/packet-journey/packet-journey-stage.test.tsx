import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { createRouteJourney } from "@/features/route-decision/create-route-journey";
import { evaluateRouteDecision } from "@/features/route-decision/evaluate-route-decision";
import { publicRouteDecisionScenarios } from "@/features/route-decision/route-decision.data";

import { PacketJourneyStageView } from "./packet-journey-stage";
import { StaticPacketJourney } from "./static-packet-journey";

afterEach(cleanup);

const scenario = publicRouteDecisionScenarios.find(({ id }) => id === "remote-through-default-gateway")!;
const journey = createRouteJourney(scenario, evaluateRouteDecision(scenario));

describe("PacketJourneyStageView", () => {
  it("names the topology, interfaces, active hop, and nested packet layers", () => {
    const stage = journey.stages[4];
    const { container } = render(<PacketJourneyStageView journey={journey} stage={stage} />);

    expect(screen.getByRole("img", { name: journey.accessibleName })).toBeVisible();
    for (const label of ["Host eth0", "Router LAN", "Router WAN", "Destination eth0"]) {
      expect(screen.getByText(label, { exact: true })).toBeVisible();
    }
    expect(container.querySelector("[data-active-device='router']")).toBeInTheDocument();
    expect(container.querySelector("[data-active-link='router-destination']")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 }).map(({ textContent }) => textContent)).toEqual([
      "Ethernet frame", "IP packet", "Application data",
    ]);
    expect(screen.getAllByText("Changed at this hop").length).toBeGreaterThan(0);
  });

  it("renders a complete ordered static explanation", () => {
    render(<StaticPacketJourney journey={journey} />);
    expect(screen.getByRole("heading", { name: "Packet journey: step by step" })).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText(/does not use NAT/i)).toBeVisible();
  });
});
