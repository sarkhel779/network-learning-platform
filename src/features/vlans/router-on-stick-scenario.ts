import { parsePacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const routerOnStickScenario = parsePacketFlowScenario({
  id: "vlan-router-on-a-stick",
  title: "Router on a stick: VLAN 10 to VLAN 20",
  description: "Follow one IP packet from the red VLAN to the green VLAN. The router uses two logical subinterfaces on one physical trunk.",
  defaultSpeed: 1,
  devices: [
    { id: "router", label: "Router", role: "Fa0/0.10 + Fa0/0.20", x: 400, y: 12 },
    { id: "switch", label: "Switch", role: "Fa1/0/1 trunk", x: 400, y: 108 },
    { id: "red-host", label: "Red host", role: "VLAN 10 · 10.10.10.1/24", x: 160, y: 188 },
    { id: "green-host", label: "Green host", role: "VLAN 20 · 20.20.20.1/24", x: 640, y: 188 },
  ],
  links: [
    { id: "vlan10-access", from: "red-host", to: "switch", fromInterface: "Red host eth0", toInterface: "Switch Fa1/0/2 · access VLAN 10" },
    { id: "shared-trunk", from: "switch", to: "router", fromInterface: "Switch Fa1/0/1 · 802.1Q trunk (VLANs 10, 20)", toInterface: "Router Fa0/0 · one physical interface" },
    { id: "vlan20-access", from: "switch", to: "green-host", fromInterface: "Switch Fa1/0/3 · access VLAN 20", toInterface: "Green host eth0" },
  ],
  steps: [
    {
      id: "gateway-frame", title: "1. Send toward the VLAN 10 gateway", durationMs: 3200,
      explanation: "10.10.10.1 sees that 20.20.20.1 is outside its /24. It sends an untagged Ethernet frame to its VLAN 10 default gateway, 10.10.10.254, through the access port.",
      activeDeviceIds: ["red-host", "switch"], activeLinkIds: ["vlan10-access"],
      packet: { kind: "frame", label: "Untagged VLAN 10 gateway frame", from: "red-host", to: "switch" },
      summaryFields: [{ label: "Access link", value: "Untagged · classified as VLAN 10", layer: "ethernet" }, { label: "IP destination", value: "20.20.20.1", layer: "ip" }],
      detailFields: [{ label: "Next-hop MAC", value: "Router Fa0/0.10 gateway MAC (resolved by ARP)", layer: "ethernet" }],
    },
    {
      id: "vlan10-trunk", title: "2. Carry VLAN 10 up the trunk", durationMs: 3200,
      explanation: "The switch adds an 802.1Q VLAN 10 tag. The frame travels up Fa1/0/1 to the router's single physical Fa0/0 interface, where subinterface Fa0/0.10 receives it.",
      activeDeviceIds: ["switch", "router"], activeLinkIds: ["shared-trunk"],
      packet: { kind: "frame", label: "802.1Q tagged VLAN 10 frame", from: "switch", to: "router" },
      summaryFields: [{ label: "Trunk tag", value: "VLAN 10", layer: "ethernet", changed: true }, { label: "Router ingress", value: "Fa0/0.10 · 10.10.10.254/24", layer: "context" }],
      detailFields: [{ label: "Physical link", value: "Switch Fa1/0/1 ↔ Router Fa0/0", layer: "context" }],
    },
    {
      id: "route-between-vlans", title: "3. Route the IP packet", durationMs: 3200,
      explanation: "The router removes the VLAN 10 Ethernet header, decrements the IP TTL, and chooses its connected VLAN 20 network. Subinterface Fa0/0.20 is the logical egress gateway; the physical port remains Fa0/0.",
      activeDeviceIds: ["router"], activeLinkIds: [],
      summaryFields: [{ label: "Ingress", value: "Fa0/0.10 · VLAN 10", layer: "context" }, { label: "Egress", value: "Fa0/0.20 · VLAN 20", layer: "context", changed: true }],
      detailFields: [{ label: "IP destination", value: "20.20.20.1 · unchanged", layer: "ip" }, { label: "TTL", value: "Decremented by one", layer: "ip" }],
    },
    {
      id: "vlan20-trunk", title: "4. Return on the same trunk as VLAN 20", durationMs: 3200,
      explanation: "The router builds a new Ethernet frame for the destination host, tags it VLAN 20, and sends it back down the same physical Fa0/0–Fa1/0/1 trunk. This is a new Layer 2 frame, not the original VLAN 10 frame.",
      activeDeviceIds: ["router", "switch"], activeLinkIds: ["shared-trunk"],
      packet: { kind: "frame", label: "802.1Q tagged VLAN 20 frame", from: "router", to: "switch" },
      summaryFields: [{ label: "Trunk tag", value: "VLAN 20", layer: "ethernet", changed: true }, { label: "Router egress", value: "Fa0/0.20 · same Fa0/0 physical port", layer: "context" }],
      detailFields: [{ label: "Ethernet destination", value: "VLAN 20 host MAC (resolved by ARP if needed)", layer: "ethernet" }, { label: "Frame", value: "New Ethernet header and FCS", layer: "ethernet" }],
    },
    {
      id: "vlan20-delivery", title: "5. Deliver to the VLAN 20 host", durationMs: 3200,
      explanation: "The switch reads the VLAN 20 tag, selects Fa1/0/3, and sends an untagged frame over that access link to 20.20.20.1. The IP packet has crossed VLANs through one router interface.",
      activeDeviceIds: ["switch", "green-host"], activeLinkIds: ["vlan20-access"],
      packet: { kind: "frame", label: "Untagged VLAN 20 delivery frame", from: "switch", to: "green-host" },
      summaryFields: [{ label: "Access link", value: "Untagged · VLAN 20", layer: "ethernet", changed: true }, { label: "IP destination", value: "20.20.20.1", layer: "ip" }],
      detailFields: [{ label: "Switch egress", value: "Fa1/0/3 · access VLAN 20", layer: "context" }],
    },
  ],
});
