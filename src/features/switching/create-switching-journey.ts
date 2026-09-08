import { parsePacketJourney } from "@/features/packet-journey/packet-journey.schema";
import type { PacketJourney, PacketLayer } from "@/features/packet-journey/packet-journey.types";

import { publicSwitchingComparison } from "./switching.data";
import type { ComparisonDimensionId, SwitchingDeviceId } from "./switching.schema";

function frameLayer(): PacketLayer {
  return {
    kind: "ethernet",
    label: "Ethernet frame",
    fields: [
      { label: "Source MAC", value: "02:00:00:00:00:0A" },
      { label: "Destination MAC", value: "02:00:00:00:00:0B" },
    ],
  };
}

function signalLayer(): PacketLayer {
  return { kind: "application", label: "Carried data", fields: [{ label: "Message", value: "Hello Host B" }] };
}

export function createSwitchingJourney(deviceId: SwitchingDeviceId, dimensionId: ComparisonDimensionId): PacketJourney {
  const device = publicSwitchingComparison.find(({ id }) => id === deviceId)!;
  const detail = device.dimensions[dimensionId];
  const inspected = deviceId === "hub" ? "Physical signal only" : "Source and destination MAC addresses";
  const egress = deviceId === "hub" ? "P2 and P3" : deviceId === "bridge" ? "Only the required segment" : "The selected switch port";
  const layers = deviceId === "hub" ? [signalLayer()] : [signalLayer(), frameLayer()];

  return parsePacketJourney({
    id: `switching-${deviceId}-${dimensionId}`,
    accessibleName: `${device.name} ${detail.label.toLowerCase()} packet journey`,
    devices: [
      { id: "source", label: "Host A", kind: "host", interfaces: ["Host A NIC"] },
      { id: "intermediary", label: device.name, kind: deviceId, interfaces: ["P1 ingress", "P2 egress", "P3 egress"] },
      { id: "destination", label: "Hosts B and C", kind: "server", interfaces: ["Host B/C NIC"] },
    ],
    stages: [
      { id: "arrive-on-p1", title: "Traffic arrives on P1", explanation: `Host A sends toward the ${device.name} on its ingress port.`, activeDeviceId: "source", activeInterfaceId: "Host A NIC", activeLinkId: "source-intermediary", position: "on-link", layers },
      { id: `${detail.behavior}-at-intermediary`, title: `${device.name}: ${detail.label}`, explanation: `${inspected}. ${detail.explanation}`, technicalDetail: device.summary, activeDeviceId: "intermediary", activeInterfaceId: "P1 ingress", position: "at-device", layers },
      { id: "leave-eligible-ports", title: "Traffic leaves the eligible port or ports", explanation: `${egress}. The receiving host decides whether the traffic belongs to it.`, activeDeviceId: "intermediary", activeInterfaceId: "P2 egress", activeLinkId: "intermediary-destination", position: "on-link", layers },
    ],
  });
}
