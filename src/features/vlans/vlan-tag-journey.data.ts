export type VlanJourneyPhase = "untagged" | "classified" | "tagged" | "delivered";

export type VlanTagJourneyStep = Readonly<{
  id: string;
  title: string;
  explanation: string;
  phase: VlanJourneyPhase;
  tagged: boolean;
  vlan: 10 | 20;
  activeDeviceIds: readonly string[];
  activeLinkIds: readonly string[];
  summaryFields: readonly Readonly<{ label: string; value: string }>[];
  detailFields: readonly Readonly<{ label: string; value: string }>[];
}>;

export function getVlanTagJourney(vlan: 10 | 20): readonly VlanTagJourneyStep[] {
  const accessLink = vlan === 10 ? "host-a-switch-a" : "host-c-switch-a";
  const destinationLink = vlan === 10 ? "switch-b-host-b" : "switch-b-host-d";
  const source = vlan === 10 ? "host-a" : "host-c";
  const destination = vlan === 10 ? "host-b" : "host-d";
  const technicalFields = [
    { label: "TPID", value: "0x8100" },
    { label: "PCP", value: "0" },
    { label: "DEI", value: "0" },
    { label: "VLAN ID", value: String(vlan) },
    { label: "Encapsulated EtherType", value: "0x0800" },
  ] as const;
  const common = { vlan, summaryFields: [{ label: "Operational VLAN", value: `VLAN ${vlan}` }] } as const;
  return [
    { ...common, id: "endpoint-send", title: "1. Endpoint sends an ordinary Ethernet frame", explanation: "The endpoint normally sends an untagged frame on its access link.", phase: "untagged", tagged: false, activeDeviceIds: [source], activeLinkIds: [accessLink], detailFields: [] },
    { ...common, id: "ingress-classification", title: "2. Access port classifies the frame", explanation: `Switch A associates the ingress frame with VLAN ${vlan} using the access-port configuration.`, phase: "classified", tagged: false, activeDeviceIds: [source, "switch-a"], activeLinkIds: [accessLink], detailFields: [] },
    { ...common, id: "tag-insertion", title: "3. Switch inserts an 802.1Q tag", explanation: "Before trunk transmission, Switch A inserts VLAN information. Header edits require a newly transmitted FCS.", phase: "tagged", tagged: true, activeDeviceIds: ["switch-a"], activeLinkIds: ["trunk"], detailFields: technicalFields },
    { ...common, id: "trunk-transit", title: "4. Tagged frame crosses the trunk", explanation: `The 802.1Q tag preserves VLAN ${vlan} identity while the shared trunk carries multiple VLANs.`, phase: "tagged", tagged: true, activeDeviceIds: ["switch-a", "switch-b"], activeLinkIds: ["trunk"], detailFields: technicalFields },
    { ...common, id: "egress-classification", title: "5. Switch B reads the VLAN identity", explanation: `Switch B uses VLAN ${vlan} to select only eligible egress ports.`, phase: "classified", tagged: true, activeDeviceIds: ["switch-b"], activeLinkIds: ["trunk"], detailFields: technicalFields },
    { ...common, id: "tag-removal", title: "6. Tag is removed for the access link", explanation: "Switch B removes the 802.1Q tag before normally transmitting toward the endpoint and generates the outgoing frame's FCS.", phase: "untagged", tagged: false, activeDeviceIds: ["switch-b"], activeLinkIds: [destinationLink], detailFields: [] },
    { ...common, id: "endpoint-delivery", title: "7. Endpoint receives the frame", explanation: `The destination receives an ordinary frame while VLAN ${vlan} remains a switch-side forwarding context.`, phase: "delivered", tagged: false, activeDeviceIds: ["switch-b", destination], activeLinkIds: [destinationLink], detailFields: [] },
  ];
}
