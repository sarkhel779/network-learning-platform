export const PACKET_JOURNEY_LINK_IDS = [
  "source-router",
  "router-destination",
  "source-destination",
] as const;

export type PacketJourneyLinkId = (typeof PACKET_JOURNEY_LINK_IDS)[number];
export type PacketLayerKind = "application" | "ip" | "ethernet";

export type PacketField = Readonly<{
  label: string;
  value: string;
  changed?: boolean;
}>;

export type PacketLayer = Readonly<{
  kind: PacketLayerKind;
  label: string;
  fields: readonly PacketField[];
}>;

export type PacketJourneyDevice = Readonly<{
  id: string;
  label: string;
  kind: "host" | "hub" | "bridge" | "switch" | "router" | "server";
  interfaces: readonly string[];
}>;

export type PacketJourneyStage = Readonly<{
  id: string;
  title: string;
  explanation: string;
  technicalDetail?: string;
  activeDeviceId: string;
  activeInterfaceId?: string;
  activeLinkId?: PacketJourneyLinkId;
  position: "at-device" | "on-link" | "at-boundary";
  layers: readonly PacketLayer[];
}>;

export type PacketJourney = Readonly<{
  id: string;
  accessibleName: string;
  devices: readonly PacketJourneyDevice[];
  stages: readonly PacketJourneyStage[];
}>;
