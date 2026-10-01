import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const ripExchangeScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "rip-exchange-split-horizon-triggered-update",
  title: "RIP: advertising around a triangle, split horizon, and a triggered update",
  description: "Watch three RIP routers in a triangle exchange routes, see hop count decide between two paths to the same network, apply split horizon with poisoned reverse, and react instantly to a link failure with a triggered update.",
  defaultSpeed: 1,
  devices: [
    { id: "r1", label: "R1", role: "RIP router, LAN 192.168.10.0/24", x: 160, y: 90 },
    { id: "r2", label: "R2", role: "RIP router", x: 620, y: 90 },
    { id: "r3", label: "R3", role: "RIP router", x: 390, y: 320 },
  ],
  links: [
    { id: "r1-r2", from: "r1", to: "r2" },
    { id: "r1-r3", from: "r1", to: "r3" },
    { id: "r2-r3", from: "r2", to: "r3" },
  ],
  steps: [
    {
      id: "r1-advertises-to-both-neighbors",
      title: "R1 advertises its network to both neighbors at once",
      explanation: "R1 tells both R2 and R3 about its own network, 192.168.10.0/24, at the same time. Technically, this is a RIPv2 Response sent to the multicast address 224.0.0.9 on UDP port 520, out every RIP-enabled interface, listing the network with a metric of 1 — R1's own connected network.",
      durationMs: 2200,
      activeDeviceIds: ["r1", "r2", "r3"],
      activeLinkIds: ["r1-r2", "r1-r3"],
      packet: { kind: "packet", label: "RIPv2 Response: 192.168.10.0/24 metric 1", from: "r1", to: "r2", fanOut: true },
      summaryFields: [
        { label: "Advertised network", value: "192.168.10.0/24" },
        { label: "Metric", value: "1" },
        { label: "Sent to", value: "R2 and R3, at the same time" },
      ],
      detailFields: [
        { label: "Command", value: "2 (Response)" },
        { label: "Destination", value: "224.0.0.9:520 (UDP)" },
        { label: "Subnet mask", value: "255.255.255.0" },
      ],
    },
    {
      id: "r2-and-r3-install-route",
      title: "R2 and R3 each add one hop",
      explanation: "Both R2 and R3 are one hop from R1, so each adds 1 to the advertised metric and installs 192.168.10.0/24 via R1 with a metric of 2.",
      durationMs: 2000,
      activeDeviceIds: ["r2", "r3"],
      activeLinkIds: [],
      summaryFields: [
        { label: "R2 installs", value: "192.168.10.0/24 via R1, metric 2" },
        { label: "R3 installs", value: "192.168.10.0/24 via R1, metric 2" },
      ],
      detailFields: [],
    },
    {
      id: "r3-hears-a-longer-second-path",
      title: "R3 hears the same network again, this time over a longer path",
      explanation: "R2 also advertises 192.168.10.0/24 onward to R3 — R2 isn't hiding it, it just isn't advertising it back the way it came. But that path is one hop longer: R3 already has a 2-hop route direct from R1, so it ignores this slower, 3-hop alternative and keeps the shorter one. This is hop count doing its job — the lowest hop count wins when a router hears about the same network more than once.",
      durationMs: 2600,
      activeDeviceIds: ["r2", "r3"],
      activeLinkIds: ["r2-r3"],
      packet: { kind: "packet", label: "RIPv2 Response: 192.168.10.0/24 metric 3", from: "r2", to: "r3" },
      summaryFields: [
        { label: "Advertised metric (via R2)", value: "3" },
        { label: "R3's installed route", value: "Still via R1, metric 2 (unchanged)" },
      ],
      detailFields: [
        { label: "Rule", value: "Lower hop count wins when multiple routes reach the same network" },
      ],
      stateNote: "Maximum usable hop count is 15; a metric of 16 means unreachable — covered next in the lesson's limits section.",
    },
    {
      id: "r2-applies-split-horizon-toward-r1",
      title: "R2 poisons the route back toward R1",
      explanation: "When R2 next advertises toward R1, it doesn't just stay quiet about R1's own network — split horizon with poisoned reverse has R2 explicitly advertise it back with a metric of 16 (infinite), telling R1 in no uncertain terms: \"don't route through me to reach your own network.\"",
      durationMs: 2200,
      activeDeviceIds: ["r2", "r1"],
      activeLinkIds: ["r1-r2"],
      packet: { kind: "packet", label: "RIPv2 Response: 192.168.10.0/24 metric 16 (poisoned)", from: "r2", to: "r1" },
      summaryFields: [
        { label: "Advertised back to R1", value: "192.168.10.0/24, metric 16 (poisoned)", changed: true },
      ],
      detailFields: [
        { label: "Loop-prevention rule", value: "Split horizon with poisoned reverse" },
      ],
    },
    {
      id: "r1-lan-link-fails",
      title: "R1's LAN connection fails",
      explanation: "R1's link to 192.168.10.0/24 goes down. RIP doesn't wait for its next scheduled update to tell anyone — a triggered update fires immediately.",
      durationMs: 2000,
      activeDeviceIds: ["r1"],
      activeLinkIds: [],
      summaryFields: [
        { label: "R1's LAN interface", value: "Down", changed: true },
      ],
      detailFields: [],
      stateNote: "A triggered update fires the moment a route changes, instead of waiting for the next 30-second cycle.",
    },
    {
      id: "r1-sends-triggered-update-to-both",
      title: "R1 immediately tells both neighbors at once",
      explanation: "R1 doesn't wait — it immediately advertises 192.168.10.0/24 as unreachable (metric 16) to both R2 and R3 at the same time, the same way it advertised the network in the first place.",
      durationMs: 2200,
      activeDeviceIds: ["r1", "r2", "r3"],
      activeLinkIds: ["r1-r2", "r1-r3"],
      packet: { kind: "packet", label: "RIPv2 Triggered Update: 192.168.10.0/24 metric 16", from: "r1", to: "r2", fanOut: true },
      summaryFields: [
        { label: "Advertised to both neighbors", value: "192.168.10.0/24, metric 16 (unreachable)", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "r2-and-r3-remove-route",
      title: "Both neighbors remove the route right away",
      explanation: "R2 and R3 both mark 192.168.10.0/24 unreachable as soon as they receive the metric-16 update, instead of waiting out the much longer 180-second invalid-route timer.",
      durationMs: 2600,
      activeDeviceIds: ["r2", "r3"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Route 192.168.10.0/24", value: "Removed on both R2 and R3", changed: true },
      ],
      detailFields: [],
      stateNote: "Without split horizon and triggered updates, a failure like this could bounce back and forth as a routing loop until the routers counted to infinity.",
    },
  ],
} as const);
