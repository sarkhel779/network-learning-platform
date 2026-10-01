import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const csmaCaHiddenNodeScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "csma-ca-and-the-hidden-node-problem",
  title: "CSMA/CA: avoiding collisions on a shared radio medium",
  description: "Watch two clients that can't hear each other collide at a shared access point, then watch RTS/CTS fix exactly that problem by making the AP's reply reach both of them.",
  defaultSpeed: 1,
  devices: [
    { id: "client-a", label: "Client A", role: "wants to send data", x: 140, y: 90 },
    { id: "ap", label: "Access Point", role: "shared radio medium", x: 430, y: 210 },
    { id: "client-b", label: "Client B", role: "out of range of Client A", x: 140, y: 330 },
  ],
  links: [
    { id: "client-a-ap", from: "client-a", to: "ap" },
    { id: "client-b-ap", from: "client-b", to: "ap" },
  ],
  steps: [
    {
      id: "client-a-senses-the-channel-idle",
      title: "Client A senses the channel: idle",
      explanation: "Before transmitting, client A listens to the radio channel first — a Clear Channel Assessment. From A's location, nothing is currently transmitting, so the channel sounds idle.",
      durationMs: 2000,
      activeDeviceIds: ["client-a"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Channel state (A's view)", value: "Idle" },
      ],
      detailFields: [],
    },
    {
      id: "client-b-also-senses-the-channel-idle",
      title: "Client B also senses the channel: idle",
      explanation: "At the same moment, client B does the same check. A and B are far enough apart that neither can hear the other's radio at all — they're hidden nodes to each other. B's channel sounds idle too, because B has no way to detect that A is about to transmit.",
      durationMs: 2200,
      activeDeviceIds: ["client-b"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Channel state (B's view)", value: "Idle" },
        { label: "Can B hear client A?", value: "No — hidden node", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "collision-at-the-access-point",
      title: "Both transmit at once: collision at the AP",
      explanation: "Because neither client could hear the other, both start transmitting to the AP at the same instant. The two signals arrive at the AP together and interfere, so the AP can decode neither frame. This is the hidden node problem: ordinary carrier sensing can't prevent it, because the collision happens at the shared receiver, not at either sender.",
      durationMs: 2600,
      activeDeviceIds: ["client-a", "ap", "client-b"],
      activeLinkIds: ["client-a-ap", "client-b-ap"],
      summaryFields: [
        { label: "Result at the AP", value: "Garbled — neither frame decodes", changed: true },
      ],
      detailFields: [
        { label: "Why carrier sensing didn't help", value: "The collision occurs at the AP, which neither sender could observe before transmitting" },
      ],
      stateNote: "Both clients will wait a random backoff interval and try again — but without a fix, they can collide the same way every time they happen to transmit together.",
    },
    {
      id: "client-a-sends-rts-to-ap",
      title: "Client A requests reserved airtime: RTS",
      explanation: "To fix this, client A first sends a short Request to Send (RTS) frame to the AP before attempting the real data transfer. RTS is brief, so even if it collides with something, little airtime is wasted finding out.",
      durationMs: 2000,
      activeDeviceIds: ["client-a", "ap"],
      activeLinkIds: ["client-a-ap"],
      packet: { kind: "frame", label: "RTS", from: "client-a", to: "ap" },
      summaryFields: [
        { label: "Frame", value: "RTS (Request to Send)" },
      ],
      detailFields: [
        { label: "Carries", value: "How long the upcoming data + ACK exchange will take" },
      ],
    },
    {
      id: "ap-broadcasts-cts-both-clients-hear-it",
      title: "The AP replies with a Clear to Send — both clients hear it",
      explanation: "The AP answers with a Clear to Send (CTS) frame. Client B never heard A's RTS, but the CTS comes from the AP, and both clients are within range of the AP — so this time, both of them receive it.",
      durationMs: 2400,
      activeDeviceIds: ["client-a", "ap", "client-b"],
      activeLinkIds: ["client-a-ap", "client-b-ap"],
      packet: { kind: "frame", label: "CTS", from: "ap", to: "client-a", fanOut: true },
      summaryFields: [
        { label: "Frame", value: "CTS (Clear to Send)" },
        { label: "Heard by", value: "Client A and Client B", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "client-b-sets-its-nav-and-defers",
      title: "Client B sets its NAV and defers",
      explanation: "The CTS carries a duration value. Client B reads it and sets its Network Allocation Vector (NAV) — a virtual carrier-sense timer — even though B still has no idea what A and the AP are actually about to exchange. For that duration, B treats the channel as busy and holds off transmitting.",
      durationMs: 2400,
      activeDeviceIds: ["client-b"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Client B's NAV", value: "Set — channel treated as busy", changed: true },
      ],
      detailFields: [
        { label: "Client B still hasn't heard", value: "Client A's original RTS" },
      ],
      stateNote: "This is the whole fix: B defers because of what the AP said, not because of anything it heard from A directly.",
    },
    {
      id: "client-a-sends-data-protected",
      title: "Client A transmits data, safely",
      explanation: "With B deferring because of its NAV, client A's data frame to the AP has the channel to itself. Nothing can collide with it this time.",
      durationMs: 2200,
      activeDeviceIds: ["client-a", "ap"],
      activeLinkIds: ["client-a-ap"],
      packet: { kind: "frame", label: "Data", from: "client-a", to: "ap" },
      summaryFields: [
        { label: "Frame", value: "Data" },
        { label: "Collision risk", value: "None — Client B is deferring" },
      ],
      detailFields: [],
    },
    {
      id: "ap-acknowledges-nav-expires",
      title: "The AP acknowledges the frame; Client B's NAV expires",
      explanation: "The AP sends an ACK back to confirm the data arrived intact. Once this exchange finishes, client B's NAV timer expires and B is free to contend for the channel again.",
      durationMs: 2400,
      activeDeviceIds: ["client-a", "ap", "client-b"],
      activeLinkIds: ["client-a-ap"],
      packet: { kind: "frame", label: "ACK", from: "ap", to: "client-a" },
      summaryFields: [
        { label: "Frame", value: "ACK" },
        { label: "Client B's NAV", value: "Expired — free to contend again", changed: true },
      ],
      detailFields: [],
      stateNote: "RTS/CTS adds a round trip, so real deployments typically only use it for larger frames where that overhead is worth it — but it reliably solves a collision that plain carrier sensing cannot.",
    },
  ],
} as const);
