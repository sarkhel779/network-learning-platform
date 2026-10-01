import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const ipsecTunnelEstablishmentScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "ipsec-site-to-site-tunnel-establishment",
  title: "IPsec: building a site-to-site tunnel and carrying traffic through it",
  description: "Watch two VPN gateways negotiate an IKEv2 tunnel in two round trips, then watch a real packet get wrapped in ESP tunnel mode to cross the public path between them.",
  defaultSpeed: 1,
  devices: [
    { id: "gateway-a", label: "Gateway A", role: "protects 10.0.1.0/24", x: 140, y: 135 },
    { id: "gateway-b", label: "Gateway B", role: "protects 10.0.2.0/24", x: 640, y: 135 },
  ],
  links: [
    { id: "gateway-a-gateway-b", from: "gateway-a", to: "gateway-b" },
  ],
  steps: [
    {
      id: "ike-sa-init-exchange",
      title: "Gateways exchange IKE_SA_INIT",
      explanation: "Gateway A and Gateway B exchange IKE_SA_INIT messages in the clear — Diffie-Hellman public values and nonces, along with the algorithms each is willing to use for the IKE SA itself.",
      durationMs: 2200,
      activeDeviceIds: ["gateway-a", "gateway-b"],
      activeLinkIds: ["gateway-a-gateway-b"],
      packet: { kind: "packet", label: "IKE_SA_INIT: DH public values, nonces (cleartext)", from: "gateway-a", to: "gateway-b" },
      summaryFields: [
        { label: "Exchange", value: "IKE_SA_INIT" },
        { label: "Protected", value: "No — this exchange is cleartext" },
      ],
      detailFields: [
        { label: "UDP port", value: "500" },
      ],
    },
    {
      id: "ike-channel-established",
      title: "Both sides derive keys; the IKE SA becomes encrypted",
      explanation: "Both gateways independently derive the same keys from the Diffie-Hellman exchange. From this point on, the IKE SA is an encrypted and authenticated control channel — even though neither gateway has proven its identity yet.",
      durationMs: 2200,
      activeDeviceIds: ["gateway-a", "gateway-b"],
      activeLinkIds: [],
      summaryFields: [
        { label: "IKE SA", value: "Encrypted control channel established", changed: true },
      ],
      detailFields: [
        { label: "Identity proven yet?", value: "No — that's the next exchange" },
      ],
    },
    {
      id: "ike-auth-exchange",
      title: "Gateways authenticate inside the encrypted channel",
      explanation: "Inside the now-encrypted IKE SA, each gateway sends its identity and proves it (for example, a pre-shared key or certificate), and both propose a Child SA to protect traffic between their two private subnets.",
      durationMs: 2200,
      activeDeviceIds: ["gateway-a", "gateway-b"],
      activeLinkIds: ["gateway-a-gateway-b"],
      packet: { kind: "packet", label: "IKE_AUTH: identity + auth (encrypted)", from: "gateway-a", to: "gateway-b" },
      summaryFields: [
        { label: "Exchange", value: "IKE_AUTH" },
        { label: "Proposed Child SA", value: "10.0.1.0/24 ↔ 10.0.2.0/24" },
      ],
      detailFields: [],
    },
    {
      id: "child-sa-negotiated",
      title: "The Child SA is negotiated",
      explanation: "Both sides agree on the Child SA's encryption and integrity algorithms and the exact traffic selectors it protects. IKEv2 has gone from nothing to a fully negotiated tunnel in just these two round trips.",
      durationMs: 2200,
      activeDeviceIds: ["gateway-a", "gateway-b"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Child SA", value: "Negotiated", changed: true },
        { label: "Round trips used", value: "2 (IKE_SA_INIT + IKE_AUTH)" },
      ],
      detailFields: [],
      stateNote: "IKEv1 needed considerably more round trips to reach this same point.",
    },
    {
      id: "original-packet-needs-protection",
      title: "A host on site A sends traffic toward site B",
      explanation: "A host at 10.0.1.5 sends a packet addressed to 10.0.2.5. Gateway A's security policy matches this traffic against the Child SA that was just negotiated.",
      durationMs: 2000,
      activeDeviceIds: ["gateway-a"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Original packet", value: "10.0.1.5 → 10.0.2.5" },
        { label: "Matched policy", value: "Protect via negotiated Child SA" },
      ],
      detailFields: [],
    },
    {
      id: "esp-tunnel-encapsulation",
      title: "Gateway A wraps the whole packet in ESP tunnel mode",
      explanation: "Gateway A encrypts and authenticates the entire original packet — its original header included — inside a new ESP packet, under a brand-new outer IP header from Gateway A to Gateway B.",
      durationMs: 2200,
      activeDeviceIds: ["gateway-a", "gateway-b"],
      activeLinkIds: ["gateway-a-gateway-b"],
      packet: { kind: "packet", label: "ESP (tunnel mode): outer Gateway A → Gateway B, inner 10.0.1.5 → 10.0.2.5", from: "gateway-a", to: "gateway-b" },
      summaryFields: [
        { label: "Outer header", value: "Gateway A → Gateway B" },
        { label: "Inner (encrypted) packet", value: "10.0.1.5 → 10.0.2.5" },
      ],
      detailFields: [
        { label: "IP protocol", value: "50 (ESP)" },
      ],
    },
    {
      id: "gatewayb-decapsulates-and-forwards",
      title: "Gateway B decapsulates and forwards the original packet",
      explanation: "Gateway B decrypts and verifies the ESP packet using the Child SA, strips the outer header, and forwards the original, unmodified inner packet onto the 10.0.2.0/24 network — the host at 10.0.2.5 receives it exactly as it was sent.",
      durationMs: 2600,
      activeDeviceIds: ["gateway-b"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Outer header", value: "Removed" },
        { label: "Delivered", value: "10.0.1.5 → 10.0.2.5 (unmodified)", changed: true },
      ],
      detailFields: [],
      stateNote: "Neither original host ever needed to know IPsec was involved — the gateways handled it entirely on their behalf.",
    },
  ],
} as const);
