import type { ComponentType } from "react";

import { ChallengeLab } from "./ip-subnetting/challenge-lab";
import { networkBroadcastRounds } from "./ip-subnetting/network-broadcast-rounds";
import { subnetMaskRounds } from "./ip-subnetting/subnet-mask-rounds";
import { PacketJourneyLab } from "./packet-forwarding/packet-journey-lab";

type ScenarioKey = `${string}/${string}`;

const registry: Record<ScenarioKey, ComponentType> = {
  "packet-forwarding/local-delivery": () => <PacketJourneyLab configuration="local" />,
  "packet-forwarding/remote-delivery": () => <PacketJourneyLab configuration="remote" />,
  "packet-forwarding/missing-gateway": () => <PacketJourneyLab configuration="no-gateway" />,
  "ip-subnetting/find-the-subnet-mask": () => <ChallengeLab rounds={subnetMaskRounds} />,
  "ip-subnetting/identify-network-and-broadcast": () => <ChallengeLab rounds={networkBroadcastRounds} />,
};

export function getScenarioComponent(topicSlug: string, scenarioSlug: string): ComponentType | undefined {
  return registry[`${topicSlug}/${scenarioSlug}`];
}
